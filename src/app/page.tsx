'use client'

import React from 'react';
import Microphone from "@/components/microphone";
import AIVisionAnalyzer from '@/components/ai-vision-analyzer'
import AudioTranscriber from '@/components/audio-transcriber';


export default function Home() {
  return (// old: flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-900 via-pink-900 to-red-900
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="mb-32 flex justify-center items-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4">
        <AIVisionAnalyzer />
      </div>
{/*       <div className="mb-32 flex justify-center items-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4">
        <Microphone />
      </div> */}
      <div className="mb-32 flex justify-center items-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4">
        <AudioTranscriber />
      </div>
    </main>
  );
}
