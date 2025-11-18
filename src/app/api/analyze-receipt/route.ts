import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    // Validate base64 image
    if (!image.startsWith('data:image/')) {
      return NextResponse.json({ error: 'Invalid image format' }, { status: 400 });
    }

    // Extract base64 data
    const base64Data = image.split(',')[1];
    const mimeType = image.split(';')[0].split(':')[1];

    // Use Gemini 2.5 Flash for fast receipt analysis
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `You are analyzing a receipt or bill image to extract expense details for a bill-splitting app.

Extract the following information accurately:
- Total amount paid (the final total, not subtotals or tax amounts)
- Merchant/vendor name (restaurant, store, etc.)
- Date of purchase (if visible)
- Brief description of the purchase (e.g., "Dinner at Pizza Place", "Grocery shopping", "Coffee")
- Individual line items with prices (if clearly visible, up to 10 items)

Return ONLY a valid JSON object in this exact format (no markdown, no explanation):
{
  "amount": <number in cents, e.g., 4250 for $42.50>,
  "description": "<brief description string>",
  "merchant": "<merchant name or null>",
  "date": "<YYYY-MM-DD or null>",
  "items": [
    {"name": "<item name>", "price": <price in cents>},
    ...
  ] or null,
  "currency": "<currency symbol, default $>"
}

If the image is not a receipt or you cannot read it clearly, return:
{
  "error": "Unable to read receipt. Please ensure the image is clear and shows the total amount."
}

Important: Always return valid JSON only, no additional text.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      },
    ]);

    const response = result.response;
    const text = response.text();

    // Parse the JSON response
    let parsedData;
    try {
      // Remove any markdown code blocks if present
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedData = JSON.parse(cleanText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', text);
      return NextResponse.json(
        { error: 'Failed to analyze receipt. Please try again with a clearer image.' },
        { status: 500 }
      );
    }

    // Check if Gemini returned an error
    if (parsedData.error) {
      return NextResponse.json({ error: parsedData.error }, { status: 400 });
    }

    // Validate required fields
    if (!parsedData.amount || parsedData.amount <= 0) {
      return NextResponse.json(
        { error: 'Could not detect a valid amount. Please enter manually.' },
        { status: 400 }
      );
    }

    // Return the extracted data
    return NextResponse.json({
      amount: parsedData.amount,
      description: parsedData.description || 'Scanned expense',
      merchant: parsedData.merchant || null,
      date: parsedData.date || null,
      items: parsedData.items || null,
      currency: parsedData.currency || '$',
    });
  } catch (error: any) {
    console.error('Error analyzing receipt:', error);
    return NextResponse.json(
      { error: 'Failed to analyze receipt. Please try again.' },
      { status: 500 }
    );
  }
}
