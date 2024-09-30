import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: process.env.GROQ_BASE_URL,
});

export async function POST(req: NextRequest) {
  console.log('Transcription request received');

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.error('No file provided');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log('File received:', file.name);

    const buffer = await file.arrayBuffer();
    const fileStream = new Blob([buffer]);

    console.log('Sending request to Groq API');
    const fileForTranscription = new File([fileStream], 'audio.wav', { type: fileStream.type });
    const transcription = await openai.audio.transcriptions.create({
      file: fileForTranscription,
      model: 'whisper-large-v3',
    });

    console.log('Transcription received:', transcription);

    return NextResponse.json({ transcription: transcription.text });
  } catch (error) {
    console.error('Error during transcription:', error);
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 });
  }
}