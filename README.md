# AI-Powered Image Analysis and Audio Transcription with Groq

This project leverages Groq's API and LLAMA 3.2 to provide lightning-fast, cost-effective AI solutions for image analysis and audio transcription.

## Key Features

1. **AI Image Analysis**
   - Upload any image and receive instant AI-powered insights
   - Enhance your workflow with cutting-edge image analysis

2. **Audio Transcription**
   - Upload audio files for quick and accurate transcription
   - Powered by advanced language models for high-quality results

## Technology Stack

- **AI Backend**: Groq API
- **Language Model**: LLAMA 3.2
- **Frontend**: Next.js with React

## Why Choose This Tool?

- **Super Fast**: Utilizes Groq's high-performance API for rapid results
- **Cost-Effective**: LLAMA 3.2 provides state-of-the-art performance at a fraction of the cost
- **Versatile**: Handles both image analysis and audio transcription in one application

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- pnpm
- A Groq API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ai-image-audio-analyzer.git
   cd ai-image-audio-analyzer
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Copy the `.env.example` file to `.env.local` and fill in your API keys:
   ```bash
   cp .env.example .env.local
   ```

4. Edit `.env.local` and add your Groq API key and other necessary credentials.

### Running the Application

1. Start the development server:
   ```bash
   pnpm dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

- `GROQ_API_KEY`: Your Groq API key
- `GROQ_BASE_URL`: Groq API base URL (default: https://api.groq.com/openai/v1)
- `MODEL_VISION`: The vision model to use (default: "llama-3.2-11b-vision-preview")
- `NEXT_PUBLIC_VOICE_FAST_MODEL`: The fast voice model (default: "llama-3.2-3b-preview")
- `NEXT_PUBLIC_SERVER_URL`: Your server URL (default: "http://localhost:3000")

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
