"use client"

import { useState, useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Camera, Mic, Send, Download, Save, Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";
import Image from 'next/image';

export default function AIVisionAnalyzer() {
  const [image, setImage] = useState<string | null>(null);
  const [instructions, setInstructions] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setTheme('dark');
  }, [setTheme]); // Add setTheme to the dependency array

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Failed to access the camera. Please make sure you have given permission.');
    }
  };

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      setImage(canvas.toDataURL('image/jpeg'));
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const formData = new FormData();
        formData.append('file', audioBlob, 'audio.wav');

        try {
          const response = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
          });
          if (!response.ok) {
            throw new Error('Transcription failed');
          }
          const result = await response.json();
          setInstructions(result.transcription);
        } catch (error) {
          console.error('Error during transcription:', error);
          alert('An error occurred during transcription. Please try again.');
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Failed to start recording. Please make sure you have given permission.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!image || !instructions) return;
    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image, instructions }),
      });
      if (!response.ok) {
        throw new Error('Image analysis failed');
      }
      const result = await response.json();
      setAnalysis(result.analysis);
    } catch (error) {
      console.error('Error during image analysis:', error);
      alert('An error occurred during image analysis. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownload = () => {
    if (analysis) {
      const blob = new Blob([analysis], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'image-analysis.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleSave = async () => {
    if (!analysis) return;

    try {
      // @ts-expect-error: File System Access API may not be supported in all browsers
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: 'image-analysis.txt',
        types: [{
          description: 'Text Files',
          accept: { 'text/plain': ['.txt'] },
        }],
      });
      const writable = await fileHandle.createWritable();
      await writable.write(analysis);
      await writable.close();
      alert('Analysis saved successfully!');
    } catch (err) {
      console.error('Failed to save the file:', err);
      alert('Failed to save the analysis. Please try again.');
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 dark:from-purple-900 dark:via-pink-900 dark:to-red-900 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 max-w-4xl w-full"
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-white">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              AI Vision Analyzer
            </span>
          </h1>
          <Button onClick={toggleTheme} variant="outline" size="icon">
            {theme === 'light' ? <Moon className="h-[1.2rem] w-[1.2rem]" /> : <Sun className="h-[1.2rem] w-[1.2rem]" />}
          </Button>
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="camera" className="text-lg font-semibold text-gray-700 dark:text-gray-300">Camera</Label>
                <div className="relative aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                  {image ? (
                    <Image
                      src={image}
                      alt="Captured"
                      layout="fill"
                      objectFit="cover"
                    />
                  ) : (
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex gap-2">
                  <Button type="button" onClick={startCamera} className="flex-1">
                    <Camera className="mr-2 h-4 w-4" />
                    Start Camera
                  </Button>
                  <Button type="button" onClick={captureImage} className="flex-1">
                    <Camera className="mr-2 h-4 w-4" />
                    Capture
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructions" className="text-lg font-semibold text-gray-700 dark:text-gray-300">Instructions</Label>
                <div className="flex gap-2">
                  <Input
                    id="instructions"
                    value={instructions}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInstructions(e.target.value)}
                    placeholder="Enter instructions or use voice input"
                    className="flex-grow"
                  />
                  <Button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                  >
                    <Mic className="mr-2 h-4 w-4" />
                    {isRecording ? 'Stop' : 'Voice'}
                  </Button>
                </div>
              </div>
              <Button 
                type="submit" 
                disabled={!image || !instructions || isAnalyzing}
                className="w-full py-6 text-lg font-semibold transition-all duration-300 transform hover:scale-105"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-6 w-6" />
                    Analyze Image
                  </>
                )}
              </Button>
            </form>
          </div>
          <div className="w-full md:w-1/2">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Analysis Result</h2>
            {analysis ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                <ScrollArea className="h-81 rounded-md border p-4">
                  <div className="text-gray-800 dark:text-gray-200 leading-relaxed">{analysis}</div>
                </ScrollArea>
                <div className="flex gap-4">
                  <Button onClick={handleDownload} className="flex-1 py-4 text-lg font-semibold">
                    <Download className="mr-2 h-5 w-5" />
                    Download
                  </Button>
                  <Button onClick={handleSave} className="flex-1 py-4 text-lg font-semibold">
                    <Save className="mr-2 h-5 w-5" />
                    Save
                  </Button>
                </div>
              </motion.div>
            ) : (
              <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg h-48 flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400 text-lg">No analysis available yet.</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}