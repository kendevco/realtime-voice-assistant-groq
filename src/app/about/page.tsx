
import { Button } from "@/components/ui/button"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">About MicroSaaS</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="mb-4">At MicroSaaS, we&apos;re on a mission to empower individuals and businesses with cutting-edge AI tools. We believe that the power of artificial intelligence should be accessible to everyone, not just large corporations with deep pockets.</p>
          <p className="mb-4">Our suite of AI-powered tools is designed to streamline your workflow, boost productivity, and unlock new creative possibilities. Whether you&apos;re a content creator, a podcast host, or a busy professional, we have the right tool to help you work smarter, not harder.</p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
          <p className="mb-4">Founded in 2023 by a team of AI enthusiasts and software engineers, MicroSaaS started as a passion project. We were frustrated by the lack of affordable, user-friendly AI tools in the market and decided to create our own.</p>
          <p className="mb-4">What began as a simple idea has now grown into a suite of powerful AI tools used by thousands of satisfied customers worldwide. We&apos;re proud of how far we&apos;ve come, but we&apos;re even more excited about the future.</p>
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Our Values</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Innovation: We&apos;re always pushing the boundaries of what&apos;s possible with AI.</li>
          <li>Accessibility: We believe powerful AI tools should be available to everyone.</li>
          <li>User-Centric: Our users&apos; needs drive every decision we make.</li>
          <li>Transparency: We&apos;re committed to being open about our AI models and data usage.</li>
          <li>Continuous Improvement: We&apos;re never satisfied with the status quo.</li>
        </ul>
      </div>
      <div className="mt-8 text-center">
        <h2 className="text-2xl font-semibold mb-4">Join Us on Our Journey</h2>
        <p className="mb-4">We&apos;re just getting started, and we&apos;d love for you to be part of our story. Try our tools, give us feedback, and help us shape the future of AI-powered productivity.</p>
        <Button size="lg">Get Started Today</Button>
      </div>
    </div>
  )
}