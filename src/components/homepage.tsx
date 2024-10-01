import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Badge } from "@/components/ui/badge"
// import { Image, Mic, MessageSquare, Star } from 'lucide-react'
import { FeatureSection } from "@/components/FeatureSection"
import { ReviewSection } from "@/components/ReviewSection"
import { PricingSection } from "@/components/PricingSection"

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Welcome to Our AI-Powered MicroSaaS</h1>
        <p className="text-xl mb-8">Unleash the power of AI with our suite of tools</p>
        <Button size="lg">Get Started</Button>
      </section>

      <FeatureSection />
      <ReviewSection />
      <PricingSection />

      <section className="my-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-xl mb-8">Join thousands of satisfied users and experience the power of AI today!</p>
        <Button size="lg">Sign Up Now</Button>
      </section>
    </div>
  )
}