"use client"

import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { motion } from 'framer-motion';
import { Moon, Sun, Camera, Send, Loader2, Upload, Copy, Volume2, SwitchCamera, Save, Image as ImageIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { track } from '@vercel/analytics';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { useToast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"
import MicrophoneButton from './MicrophoneButton';
import { useMediaQuery } from 'react-responsive';

export default function AiVisionAnalyzer() {
  const [cameraImage, setCameraImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [instructions, setInstructions] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('camera');
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string | undefined>(undefined);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const { theme, setTheme } = useTheme();
  const { toast } = useToast()
  const isMobile = useMediaQuery({ maxWidth: 767 });

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
    toast({
      title: "Welcome",
      description: "AI Vision Analyzer is ready to use.",
    });
  }, [setTheme, toast]);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (webcamRef.current) {
        webcamRef.current.video!.srcObject = stream;
      }
      setCameraImage(null);
      toast({
        title: "Camera Started",
        description: "Your camera is now active.",
      });
    } catch (err) {
      console.error("Error accessing the camera:", err);
      toast({
        title: "Error",
        description: "Unable to access the camera. Please make sure you've granted the necessary permissions.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const switchCamera = async () => {
    const currentIndex = cameraDevices.findIndex(device => device.deviceId === currentDeviceId);
    const nextIndex = (currentIndex + 1) % cameraDevices.length;
    setCurrentDeviceId(cameraDevices[nextIndex].deviceId);
    toast({
      title: "Camera Switched",
      description: "Switched to the next available camera.",
    });
  };

  const captureImage = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCameraImage(imageSrc);
      setUploadedImage(null);
      setActiveTab('camera');
      track('Image Captured', { source: 'webcam' });
      toast({
        title: "Image Captured",
        description: "Your image has been successfully captured.",
      });
    }
  }, [webcamRef, toast]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        track('Image Uploaded', { fileName: file.name });
        toast({
          title: "Image Uploaded",
          description: `File "${file.name}" has been successfully uploaded.`,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const formatAnalysis = (rawAnalysis: string) => {
    if (!rawAnalysis.trim().startsWith('```') && !rawAnalysis.trim().endsWith('```')) {
      return '```\n' + rawAnalysis + '\n```';
    }
    return rawAnalysis;
  };

  const handleAnalyze = async () => {
    const image = activeTab === 'camera' ? cameraImage : uploadedImage;
    if (!image) {
      toast({
        title: "Error",
        description: "Please capture or upload an image first.",
        variant: "destructive",
      })
      return;
    }

    if (!instructions) {
      toast({
        title: "Error",
        description: "Please provide instructions for the analysis.",
        variant: "destructive",
      })
      return;
    }

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
      setAnalysis(formatAnalysis(result.analysis));
      track('Image Analyzed', { instructionsLength: instructions.length });
      toast({
        title: "Analysis Complete",
        description: "Your image has been successfully analyzed.",
      });
    } catch (error) {
      console.error('Error during image analysis:', error);
      toast({
        title: "Error",
        description: "An error occurred during image analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = () => {
    if (analysis) {
      navigator.clipboard.writeText(analysis)
        .then(() => {
          toast({
            title: "Success",
            description: "Analysis copied to clipboard!",
          });
          track('Analysis Copied', { analysisLength: analysis.length });
        })
        .catch(err => {
          console.error('Failed to copy text: ', err);
          toast({
            title: "Error",
            description: "Failed to copy analysis to clipboard.",
            variant: "destructive",
          });
        });
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
        toast({
          title: "Success",
          description: "Audio playback started.",
        });
        track('Analysis Listened', { analysisLength: analysis.length });
      } catch (error) {
        console.error('Error during text-to-speech conversion:', error);
        toast({
          title: "Error",
          description: "An error occurred during text-to-speech conversion. Please try again.",
          variant: "destructive",
        });
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
      toast({
        title: "Success",
        description: "Analysis saved successfully!",
      });
      track('Analysis Saved', { fileName: filename, analysisLength: analysis.length });
    } catch (err) {
      console.error('Failed to save the file:', err);
      toast({
        title: "Error",
        description: "Failed to save the analysis. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    toast({
      title: "Theme Changed",
      description: `Switched to ${newTheme} mode.`,
    });
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = (event) => {
            setUploadedImage(event.target?.result as string);
            setActiveTab('upload');
            track('Image Pasted', { fileType: blob.type });
            toast({
              title: "Image Pasted",
              description: "Your pasted image has been uploaded.",
            });
          };
          reader.readAsDataURL(blob);
        }
      }
    }
  };

  const handleMicrophoneStateChange = (recording: boolean, transcribing: boolean) => {
    setIsRecording(recording);
    setIsTranscribing(transcribing);
    if (recording) {
      setInstructions('');
      toast({
        title: "Recording Started",
        description: "Speak your instructions now.",
      });
    } else if (transcribing) {
      toast({
        title: "Transcribing",
        description: "Converting your speech to text...",
      });
    }
  };

  const isControlsDisabled = isRecording || isTranscribing || isAnalyzing;

  const handleTabChange = (value: string) => {
    if (value === 'camera') {
      startCamera();
      setUploadedImage(null);
      setCameraImage(null);
    } else if (value === 'upload' && cameraImage) {
      toast({
        title: "Warning",
        description: "Switching to upload will clear the captured image. Do you want to proceed?",
        action: (
          <ToastAction altText="Switch to upload" onClick={() => {
            setCameraImage(null);
            setActiveTab('upload');
            toast({
              title: "Tab Switched",
              description: "Switched to upload tab. Captured image cleared.",
            });
          }}>
            Switch
          </ToastAction>
        ),
      });
    } else {
      setActiveTab(value);
      toast({
        title: "Tab Switched",
        description: `Switched to ${value} tab.`,
      });
    }
  };

  useEffect(() => {
    if (activeTab === 'camera') {
      startCamera();
    }
  }, [activeTab, startCamera]);

  const takePhoto = async () => {
    if (isMobile) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          const video = document.createElement('video');
          video.srcObject = stream;
          video.play();

          video.onloadedmetadata = () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d')?.drawImage(video, 0, 0);
            const imageSrc = canvas.toDataURL('image/jpeg');
            setUploadedImage(imageSrc);
            setCameraImage(null);
            setActiveTab('upload');
            stream.getTracks().forEach(track => track.stop());
            toast({
              title: "Photo Taken",
              description: "Your photo has been captured and uploaded.",
            });
          };
        } catch (err) {
          console.error("Error accessing the camera:", err);
          toast({
            title: "Error",
            description: "Unable to access the camera. Please make sure you've granted the necessary permissions.",
            variant: "destructive",
          });
        }
      }
    } else {
      const imageSrc = webcamRef.current?.getScreenshot();
      if (imageSrc) {
        setCameraImage(imageSrc);
        setUploadedImage(null);
        setActiveTab('camera');
        toast({
          title: "Photo Captured",
          description: "Your photo has been captured from the webcam.",
        });
      }
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme === 'light' ? 'from-purple-400 via-pink-500 to-red-500' : 'from-purple-900 via-pink-900 to-red-900'} flex items-center justify-center p-4`}
         onPaste={handlePaste}>
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
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="camera" disabled={isControlsDisabled}>Camera</TabsTrigger>
              <TabsTrigger value="upload" disabled={isControlsDisabled}>Upload</TabsTrigger>
            </TabsList>
            <TabsContent value="camera" className="space-y-4">
              <div className="relative aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                {cameraImage ? (
                  <Image
                    src={cameraImage}
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
                <Button type="button" onClick={startCamera} className="flex-1" disabled={isControlsDisabled}>
                  <Camera className="mr-2 h-4 w-4" />
                  Start Camera
                </Button>
                <Button type="button" onClick={switchCamera} className="flex-1" disabled={isControlsDisabled}>
                  <SwitchCamera className="mr-2 h-4 w-4" />
                  Switch Camera
                </Button>
                <Button type="button" onClick={captureImage} className="flex-1" disabled={isControlsDisabled}>
                  <Camera className="mr-2 h-4 w-4" />
                  Capture
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="upload" className="space-y-4">
              <div
                className="relative aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadedImage ? (
                  <Image
                    src={uploadedImage}
                    alt="Uploaded"
                    layout="fill"
                    objectFit="cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center w-full h-full p-4">
                    <ImageIcon className="w-16 h-16 mb-4 text-gray-400" />
                    <p className="text-center text-gray-500 dark:text-gray-400">
                      Tap to upload an image or take a photo
                    </p>
                    <p className="text-center text-gray-400 dark:text-gray-500 text-sm mt-2">
                      You can also paste a screenshot (on desktop)
                    </p>
                  </div>
                )}
              </div>
              <div className="flex gap-2 flex-col sm:flex-row">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  ref={fileInputRef}
                  className="hidden"
                  disabled={isControlsDisabled}
                />
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-6"
                  disabled={isControlsDisabled}
                >
                  <Upload className="mr-2 h-5 w-5" />
                  Upload Image
                </Button>
                <Button
                  type="button"
                  onClick={takePhoto}
                  className="flex-1 py-6"
                  disabled={isControlsDisabled}
                >
                  <Camera className="mr-2 h-5 w-5" />
                  {isMobile ? "Take Photo" : "Capture from Webcam"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          <div className="space-y-2">
            <Label htmlFor="instructions" className={`text-lg font-semibold ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>Instructions</Label>
            <div className="flex gap-2">
              <MicrophoneButton
                onTranscript={setInstructions}
                onStateChange={handleMicrophoneStateChange}
                instructions={instructions}
                isDisabled={isControlsDisabled}
              />
            </div>
          </div>
          <Button
            type="button"
            onClick={handleAnalyze}
            disabled={(!cameraImage && !uploadedImage) || !instructions || isControlsDisabled}
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
        </div>
        <div className="mt-8">
          <h2 className={`text-2xl font-semibold mb-4 ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>Analysis Result</h2>
          {analysis ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <ScrollArea className="h-[calc(100vh-24rem)] md:h-96 rounded-md border p-4">
                <div className={`${theme === 'light' ? 'text-gray-800' : 'text-gray-200'} leading-relaxed prose prose-sm ${theme === 'light' ? 'prose-gray' : 'prose-invert'} max-w-none`}>
                  <MarkdownRenderer content={analysis} />
                </div>
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