'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
//import { VoiceAssistant } from '@/components/VoiceAssistant'

export default function VoiceAssistantPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Real-Time Voice Assistant</h1>
      <Card>
        <CardHeader>
          <CardTitle>Interact with our AI assistant using your voice</CardTitle>
        </CardHeader>
        <CardContent>
          {/* <VoiceAssistant /> */}
        </CardContent>
      </Card>
    </div>
  )
}

