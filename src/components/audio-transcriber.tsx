"use client"

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Mic, FileAudio, Download, Save, Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";
import { track } from '@vercel/analytics';
import { toast } from 'react-hot-toast'; // Assuming you're using react-hot-toast for notifications

export default function AudioTranscriber() {
  const [file, setFile] = useState<File | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);

  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setTheme('dark');
  }, [setTheme]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      try {
        track('File Selected', { fileName: e.target.files[0].name });
      } catch (error) {
        if (error instanceof Error) {
          console.error('Error processing audio:', error.message);
          toast.error(`Error processing audio: ${error.message}`);
        } else {
          console.error('An unknown error occurred');
          toast.error('An unknown error occurred');
        }
      }
    }

  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;
    setIsTranscribing(true);
    setTranscription(null);
    const formData = new FormData();
    formData.append('file', file);
    try {
      track('Transcription Started', { fileName: file.name });
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Transcription failed');
      }
      const result = await response.json();
      setTranscription(result.transcription);
      track('Transcription Completed', { fileName: file.name });
    } catch (error: unknown) {
      console.error('Error during transcription:', error);
      alert('An error occurred during transcription. Please try again.');

      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      track('Transcription Error', { fileName: file.name, error: errorMessage });
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleDownload = () => {
    if (transcription) {
      const blob = new Blob([transcription], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'transcription.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      track('Transcription Downloaded');
    }
  };

  const handleSave = async () => {
    if (!transcription || !file) return;

    const originalFileName = file.name.split('.').slice(0, -1).join('.');
    const suggestedName = `${originalFileName}_transcript.txt`;

    try {
      // @ts-expect-error: File System Access API may not be supported in all browsers
      const fileHandle = await window.showSaveFilePicker({
        suggestedName,
        types: [{
          description: 'Text Files',
          accept: { 'text/plain': ['.txt'] },
        }],
      });
      const writable = await fileHandle.createWritable();
      await writable.write(transcription);
      await writable.close();
      alert('Transcription saved successfully!');
      track('Transcription Saved', { fileName: suggestedName });
    } catch (err) {
      if (err instanceof Error) {
        console.error('Error saving transcription:', err.message);
        toast.error(`Error saving transcription: ${err.message}`);
      } else {
        console.error('An unknown error occurred while saving');
        toast.error('An unknown error occurred while saving');
      }
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    track('Theme Toggled', { newTheme });
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
              Audio Transcriber
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
                <Label htmlFor="audio-file" className="text-lg font-semibold text-gray-700">Select Audio File</Label>
                <div className="relative">
                  <Input
                    id="audio-file"
                    type="file"
                    accept="audio/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Label 
                    htmlFor="audio-file" 
                    className="cursor-pointer flex items-center justify-center w-full p-4 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-300"
                  >
                    <FileAudio className="w-8 h-8 text-gray-400 mr-2" />
                    <span className="text-gray-600">{file ? file.name : 'Choose an audio file'}</span>
                  </Label>
                </div>
              </div>
              <Button 
                type="submit" 
                disabled={!file || isTranscribing}
                className="w-full py-6 text-lg font-semibold transition-all duration-300 transform hover:scale-105"
              >
                {isTranscribing ? (
                  <>
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    Transcribing...
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 h-6 w-6" />
                    Transcribe Audio
                  </>
                )}
              </Button>
            </form>
          </div>
          <div className="w-full md:w-1/2">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Transcription</h2>
            {transcription ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`bg-background text-foreground ${theme === 'dark' ? 'dark' : ''}`}
              >
                <ScrollArea className="h-48 rounded-md border p-4">
                  <div className="text-foreground leading-relaxed">{transcription}</div>
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
              <div className="bg-gray-100 p-6 rounded-lg h-48 flex items-center justify-center">
                <p className="text-gray-500 text-lg">No transcription available yet.</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}