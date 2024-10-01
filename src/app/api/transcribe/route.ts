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
    const file = formData.get('file');

    if (!file || !(file instanceof Blob)) {
      console.error('No file provided or invalid file type');
      return NextResponse.json({ error: 'No file provided or invalid file type' }, { status: 400 });
    }

    console.log('File received');

    const buffer = Buffer.from(await file.arrayBuffer());

    console.log('Sending request to Groq API');
    const transcription = await openai.audio.transcriptions.create({
      file: new File([buffer], 'audio.wav', { type: 'audio/wav' }),
      model: 'whisper-large-v3',
    });

    console.log('Transcription received:', transcription);

    return NextResponse.json({ transcription: transcription.text });
  } catch (error) {
    console.error('Error during transcription:', error);
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 });
  }
}