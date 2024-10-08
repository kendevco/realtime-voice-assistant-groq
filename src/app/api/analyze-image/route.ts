import { NextRequest, NextResponse } from "next/server";

const IMAGE_ANALYSIS_PROMPT = `Analyze the provided image and describe it in detail. Format your response in markdown, using appropriate headers, paragraphs, and bullet points where relevant. Include the following aspects in your analysis:

- Overall scene description
- Key elements and their arrangement
- Colors and lighting
- Atmosphere and mood
- Any text or logos visible
- Unique or notable features

Ensure your description is vivid and well-structured.

If the user has provided specific instructions for analysis, focus on those aspects. If the user's instructions are vague or not provided, include all the points mentioned above in your analysis.`;

export async function POST(req: NextRequest) {
  console.log("Image analysis request received");

  try {
    const { image, instructions } = await req.json();

    if (!image || !instructions) {
      console.error("No image or instructions provided");
      return NextResponse.json(
        { error: "No image or instructions provided" },
        { status: 400 }
      );
    }

    console.log("Sending request to Groq API");
    const response = await fetch(
      `${process.env.GROQ_BASE_URL}/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: process.env.MODEL_VISION || "mixtral-8x7b-32768",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `${IMAGE_ANALYSIS_PROMPT}\n\nAnalyze the following image. Additional instructions: ${instructions}`,
                },
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
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Groq API error:", errorData);
      return NextResponse.json(
        { error: "Image analysis failed", details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;
    console.log("Analysis received:", analysis);

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Error during image analysis:", error);
    return NextResponse.json(
      {
        error: "Image analysis failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
