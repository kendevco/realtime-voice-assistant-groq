import { Card } from "@/components/ui/card"

const reviews = [
  { name: 'Alice Johnson', role: 'Content Creator', comment: 'The AI Image Helper has revolutionized my workflow. It\'s like having a creative assistant at my fingertips!' },
  { name: 'Bob Smith', role: 'Podcast Host', comment: 'Transcribing my podcasts used to be a nightmare. Now, it\'s a breeze with the accurate Whisper-3-Large transcription.' },
  { name: 'Carol Davis', role: 'UX Researcher', comment: 'The Real-Time Voice Assistant has made my user interviews so much more efficient. It\'s like having an AI note-taker!' },
]

export function ReviewSection() {
  return (
    <section className="my-16">
      <h2 className="text-3xl font-bold text-center mb-8">What Our Users Say</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {reviews.map((review) => (
          <Card key={review.name}>
            {/* Card content */}
          </Card>
        ))}
      </div>
    </section>
  )
}