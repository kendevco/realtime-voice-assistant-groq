'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import AudioTranscriber from '@/components/audio-transcriber'

export default function TranscriberPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Audio Transcriber</h1>
      <Card>
        <CardHeader>
          <CardTitle>Upload an audio file for transcription</CardTitle>
        </CardHeader>
        <CardContent>
          <AudioTranscriber />
        </CardContent>
      </Card>
    </div>
  )
}
