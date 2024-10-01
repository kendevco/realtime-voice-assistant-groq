import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Image, Mic, MessageSquare } from 'lucide-react'

const features = [
  {
    title: 'AI Image Helper',
    description: 'Upload or take pictures and get AI-powered insights',
    icon: Image,
  },
  {
    title: 'Transcriber',
    description: 'Transcribe audio files with high accuracy using Whisper-3-Large',
    icon: Mic,
  },
  {
    title: 'Real-Time Voice Assistant',
    description: 'Interact with our AI assistant using your voice',
    icon: MessageSquare,
  },
]

export function FeatureSection() {
  return (
    <section className="my-16">
      <h2 className="text-3xl font-bold text-center mb-8">Our Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
              <feature.icon className="w-10 h-10 mb-2" />
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}