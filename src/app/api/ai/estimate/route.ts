import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// We expect TELEGRAM_BOT_TOKEN and other keys, let's assume they provide GEMINI_API_KEY
// in the real environment. If it is missing, we'll return an error requiring it.
export async function POST(request: NextRequest) {
  try {
    const { scopeOfWork, propertyContext } = await request.json();

    if (!scopeOfWork) {
      return NextResponse.json({ error: 'Missing scopeOfWork' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is missing in environment variables. Please add it to your .env.local file to enable AI Estimates.' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are an expert property maintenance estimator in Rome, GA.
The technician has provided the following repair/installation scope:
"${scopeOfWork}"

Context about the property: ${propertyContext || 'Standard residential rental property'}

Generate a pricing breakdown with 3 options: Good, Better, Best.
For each option, provide:
1. "tier": "Good", "Better", or "Best"
2. "title": A short, client-facing title (e.g., "Standard Repair", "Premium Upgraded Fixtures")
3. "description": A 1-2 sentence description explaining the value of this tier to the client.
4. "items": An array of line items needed for this tier. Each item must have:
   - "type": either "labor", "material", or "flat_rate"
   - "description": name of the labor or material
   - "quantity": numeric quantity
   - "unitPrice": dollar cost per unit
   - "total": quantity * unitPrice

Ensure your prices are highly realistic for contractors in Rome, Georgia (NW Georgia).
Labor rates should generally range from $65/hr to $115/hr depending on skill.

You must respond ONLY with valid JSON matching this structure:
{
  "options": [
    {
      "tier": "Good",
      "title": "...",
      "description": "...",
      "items": [
        { "type": "labor", "description": "...", "quantity": 1, "unitPrice": 85, "total": 85 }
      ],
      "totalOptionCost": 0
    }
  ]
}
No markdown formatting, just the raw JSON object.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    if (!response.text) {
      throw new Error('Gemini returned an empty response');
    }

    const jsonText = response.text;
    const parsedData = JSON.parse(jsonText);

    return NextResponse.json(parsedData, { status: 200 });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate estimate' }, { status: 500 });
  }
}
