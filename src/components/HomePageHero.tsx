import Image from 'next/image'
import { Button } from "@/components/ui/button"

export function HomePageHero() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
            Analyze Images with AI
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Upload any image and get instant AI-powered insights. Enhance your workflow with our cutting-edge image analysis tool.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg">Get Started</Button>
            <Button size="lg" variant="outline">Learn More</Button>
          </div>
        </div>
        <div className="relative aspect-video">
          <Image
            src="/imageanalyzer.png"
            alt="Image Analyzer Screenshot"
            fill
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>
      </div>
    </div>
  )
}