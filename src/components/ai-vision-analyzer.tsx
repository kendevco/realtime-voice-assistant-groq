"use client"

import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { motion } from 'framer-motion';
import { Moon, Sun, Camera, Mic, Send, Loader2, Upload, Copy, Volume2, SwitchCamera, Save } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useTheme } from 'next-themes';
import Image from 'next/image';

export default function AiVisionAnalyzer() {
  const [image, setImage] = useState<string | null>(null);
  const [instructions, setInstructions] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [activeTab, setActiveTab] = useState('camera');
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string | undefined>(undefined);

  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setTheme('dark');
    const getCameraDevices = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setCameraDevices(videoDevices);
      if (videoDevices.length > 0) {
        setCurrentDeviceId(videoDevices[0].deviceId);
      }
    };

    getCameraDevices();
  }, [setTheme]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (webcamRef.current) {
        webcamRef.current.video!.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing the camera:", err);
      alert("Unable to access the camera. Please make sure you've granted the necessary permissions.");
    }
  };

  const switchCamera = async () => {
    const currentIndex = cameraDevices.findIndex(device => device.deviceId === currentDeviceId);
    const nextIndex = (currentIndex + 1) % cameraDevices.length;
    setCurrentDeviceId(cameraDevices[nextIndex].deviceId);
  };

  const captureImage = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setImage(imageSrc);
    }
  }, [webcamRef]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();

        const audioChunks: BlobPart[] = [];
        mediaRecorder.addEventListener("dataavailable", event => {
          audioChunks.push(event.data);
        });

        mediaRecorder.addEventListener("stop", () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          sendAudioToWhisper(audioBlob);
        });
      })
      .catch(error => {
        console.error("Error accessing the microphone:", error);
        alert("Unable to access the microphone. Please make sure you've granted the necessary permissions.");
        setIsRecording(false);
      });
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendAudioToWhisper = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');

    try {
      const response = await fetch('/api/transcribe-whisper', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Transcription failed');
      }
      const result = await response.json();
      setInstructions(result.transcription);
      handleSubmit(); // Auto-submit after transcription
    } catch (error) {
      console.error('Error during transcription:', error);
      alert('An error occurred during transcription. Please try again.');
    }
  };

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
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
        throw new Error('Analysis failed');
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

  const handleCopy = () => {
    if (analysis) {
      navigator.clipboard.writeText(analysis)
        .then(() => alert('Analysis copied to clipboard!'))
        .catch(err => console.error('Failed to copy text: ', err));
    }
  };

  const handleListen = async () => {
    if (analysis) {
      try {
        const response = await fetch('/api/text-to-speech', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: analysis }),
        });
        if (!response.ok) {
          throw new Error('Text-to-speech conversion failed');
        }
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
      } catch (error) {
        console.error('Error during text-to-speech conversion:', error);
        alert('An error occurred during text-to-speech conversion. Please try again.');
      }
    }
  };

  const handleSave = async () => {
    if (!analysis) return;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `${timestamp}-picture-analysis.txt`;

    try {
      // @ts-expect-error: File System Access API may not be supported in all browsers
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: filename,
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

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = (event) => {
            setImage(event.target?.result as string);
          };
          reader.readAsDataURL(blob);
        }
      }
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme === 'light' ? 'from-purple-400 via-pink-500 to-red-500' : 'from-purple-900 via-pink-900 to-red-900'} flex items-center justify-center p-4`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`bg-white ${theme === 'dark' ? 'dark:bg-gray-800' : ''} rounded-lg shadow-2xl p-8 max-w-4xl w-full`}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-4xl font-bold text-center ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              AI Vision Analyzer
            </span>
          </h1>
          <Button onClick={toggleTheme} variant="outline" size="icon">
            {theme === 'light' ? <Moon className="h-[1.2rem] w-[1.2rem]" /> : <Sun className="h-[1.2rem] w-[1.2rem]" />}
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="camera">Camera</TabsTrigger>
              <TabsTrigger value="upload">Upload</TabsTrigger>
            </TabsList>
            <TabsContent value="camera" className="space-y-4">
              <div className="relative aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                {image ? (
                  <Image
                    src={image}
                    alt="Captured"
                    layout="fill"
                    objectFit="cover"
                  />
                ) : (
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ deviceId: currentDeviceId }}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex gap-2">
                <Button type="button" onClick={startCamera} className="flex-1">
                  <Camera className="mr-2 h-4 w-4" />
                  Start Camera
                </Button>
                <Button type="button" onClick={switchCamera} className="flex-1">
                  <SwitchCamera className="mr-2 h-4 w-4" />
                  Switch Camera
                </Button>
                <Button type="button" onClick={captureImage} className="flex-1">
                  <Camera className="mr-2 h-4 w-4" />
                  Capture
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="upload" className="space-y-4">
              <div
                className="relative aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden"
                onPaste={handlePaste}
                tabIndex={0}
                role="button"
                aria-label="Paste image area"
              >
                {image ? (
                  <Image
                    src={image}
                    alt="Uploaded"
                    layout="fill"
                    objectFit="cover"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full">
                    <p className={`${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                      No image uploaded. Click to upload or paste an image.
                    </p>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  ref={fileInputRef}
                  className="hidden"
                />
                <Button type="button" onClick={() => fileInputRef.current?.click()} className="flex-1">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Image
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          <div className="space-y-2">
            <Label htmlFor="instructions" className={`text-lg font-semibold ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>Instructions</Label>
            <div className="flex gap-2">
              <Textarea
                id="instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Enter instructions or use voice input"
                className="flex-grow"
                rows={3}
              />
              <Button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                variant={isRecording ? "destructive" : "secondary"}
              >
                <Mic className="h-4 w-4" />
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
        <div className="mt-8">
          <h2 className={`text-2xl font-semibold mb-4 ${theme === 'light' ? 'text-gray-800' :

            'text-gray-200'}`}>Analysis Result</h2>
          {analysis ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <ScrollArea className="h-[calc(100vh-24rem)] md:h-96 rounded-md border p-4">
                <div className={`${theme === 'light' ? 'text-gray-800' : 'text-gray-200'} leading-relaxed`}>{analysis}</div>
              </ScrollArea>
              <div className="flex gap-4 flex-wrap">
                <Button onClick={handleListen} className="flex-1 py-4 text-lg font-semibold">
                  <Volume2 className="mr-2 h-5 w-5" />
                  Listen
                </Button>
                <Button onClick={handleCopy} className="flex-1 py-4 text-lg font-semibold">
                  <Copy className="mr-2 h-5 w-5" />
                  Copy
                </Button>
                <Button onClick={handleSave} className="flex-1 py-4 text-lg font-semibold">
                  <Save className="mr-2 h-5 w-5" />
                  Save
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className={`${theme === 'light' ? 'bg-gray-100' : 'bg-gray-700'} p-6 rounded-lg h-48 flex items-center justify-center`}>
              <p className={`${theme === 'light' ? 'text-gray-500' : 'text-gray-400'} text-lg`}>No analysis available yet.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}