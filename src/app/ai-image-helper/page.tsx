'use client'

import dynamic from 'next/dynamic'

const AiVisionAnalyzer = dynamic(() => import('@/components/ai-vision-analyzer'), { ssr: false })

export default function AIImageHelper() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">AI Image Helper</h1>
      <AiVisionAnalyzer />
    </div>
  )
}