import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: process.env.GROQ_BASE_URL,
});

const IMAGE_ANALYSIS_PROMPT = "Analyze the following image and provide a detailed description of its contents, including any text, objects, people, or notable features:";

export async function POST(req: NextRequest) {
  console.log('Image analysis request received');

  try {
    const { image, instructions } = await req.json();

    if (!image || !instructions) {
      console.error('No image or instructions provided');
      return NextResponse.json({ error: 'No image or instructions provided' }, { status: 400 });
    }

    console.log('Sending request to Groq API');
    const response = await openai.chat.completions.create({
      model: process.env.MODEL_VISION || "mixtral-8x7b-32768",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: `${IMAGE_ANALYSIS_PROMPT}\n\nExplain user provided image. User Provided instructions: ${instructions}` },
            {
              type: "image_url",
              image_url: {
                url: image,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
    });

    const analysis = response.choices[0].message.content;
    console.log('Analysis received:', analysis);

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Error during image analysis:', error);
    return NextResponse.json({ error: 'Image analysis failed' }, { status: 500 });
  }
}