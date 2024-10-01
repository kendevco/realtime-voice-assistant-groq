import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  if (!openai.apiKey) {
    return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const audioFile = formData.get('file') as Blob;

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const buffer = await audioFile.arrayBuffer();
    const audioData = new Uint8Array(buffer);

    const response = await openai.audio.transcriptions.create({
      file: new File([audioData], 'audio.wav', { type: 'audio/wav' }),
      model: "whisper-1",
    });

    return NextResponse.json({ transcription: response.text });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error with OpenAI API request: ${error.message}`);
    } else {
      console.error(`Unknown error with OpenAI API request`);
    }
    return NextResponse.json({ error: "An error occurred during transcription" }, { status: 500 });
  }
}