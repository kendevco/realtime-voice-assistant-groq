import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">MicroSaaS</h3>
            <p className="text-sm text-muted-foreground">Empowering your workflow with AI-driven tools.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Features</h4>
            <ul className="space-y-2">
              <li><Link href="/ai-image-helper" className="text-sm hover:underline">AI Image Helper</Link></li>
              <li><Link href="/transcriber" className="text-sm hover:underline">Transcriber</Link></li>
              <li><Link href="/voice-assistant" className="text-sm hover:underline">Voice Assistant</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-sm hover:underline">About Us</Link></li>
              <li><Link href="/pricing" className="text-sm hover:underline">Pricing</Link></li>
              <li><Link href="/terms" className="text-sm hover:underline">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <ul className="space-y-2">
              <li><a href="https://github.com/kendevco" className="text-sm hover:underline">GitHub</a></li>
              <li><a href="https://linkedin.com/kendevco" className="text-sm hover:underline">LinkedIn</a></li>
              <li><a href="https://kendev.co" className="text-sm hover:underline">KenDev.co</a></li>
              <li><a href="mailto:support@microsaas.com" className="text-sm hover:underline">Contact Us</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} MicroSaaS. All rights reserved.
        </div>
      </div>
    </footer>
  )
}