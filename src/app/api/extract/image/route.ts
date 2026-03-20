import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Allow large requests up to 10MB since images can be big
export const maxDuration = 60; // Max timeout for Vercel/NextJS if deployed there

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(req: Request) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    console.log('[AI Vision] Analyzing image...');

    // Call OpenAI GPT-4o with the image
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a highly accurate data extraction assistant for an HVAC service booking system in Thailand.
Your job is to read screenshots of customer chats (LINE, Facebook, etc.) and accurately extract standard booking details.
Return ONLY a valid JSON object without markdown wrappers or markdown codeblocks. 

Here is the exact JSON structure and rules:
{
  "customer_name": "string (extract real name/nickname if present, ignore generic greetings)",
  "phone": "string (extract phone number, digits only or with dashes/spaces, e.g. 081-123-4567)",
  "address_full": "string (extract the full address details provided, including soi, road, subdistrict, region)",
  "area": "string (MUST BE one of: bangna, bangphli, samutprakan, thepharak, latkrabang. Map from address if possible)",
  "machine_count": "number (extract integer of how many AC units need service e.g. 'ล้าง2ตัว' = 2, default is 1 if unspecified but service requested)",
  "job_type": "string (either 'cleaning' or 'repair' depending on context. ล้าง=cleaning, ซ่อม=repair)"
}

Rules:
Rule: "machine_count" must be a number (integer), e.g. 1, 2. (Not a string like "1").
Rule: "job_type" must be exactly "cleaning" or "repair".

        },
        {
          role: "user",
          content: [
            { type: "text", text: "Please extract booking details from this chat screenshot." },
            {
              type: "image_url",
              image_url: {
                url: image, // format is "data:image/jpeg;base64,....."
                detail: "high"
              },
            },
          ],
        },
      ],
      temperature: 0.1, // Low temp for extraction
      response_format: { type: "json_object" }
    });

    const aiMessage = response.choices[0]?.message?.content;
    if (!aiMessage) {
      return NextResponse.json({ error: 'AI returned empty response' }, { status: 500 });
    }

    const extractedData = JSON.parse(aiMessage);
    console.log('[AI Vision] Success:', extractedData);

    return NextResponse.json(extractedData);

  } catch (error: any) {
    console.error('[AI Vision] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process image' },
      { status: 500 }
    );
  }
}
