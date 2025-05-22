import { ReceiptItem } from '@/types/receipt';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Don't throw an error if the API key is missing
const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
let genAI: GoogleGenerativeAI | null = null;

if (GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
}

async function analyzeReceiptWithGemini(base64Image: string): Promise<ReceiptItem[]> {
    // If no API key is set, return mock data
    if (!genAI) {
        console.warn('GOOGLE_GEMINI_API_KEY is not set. Returning mock data.');
        return [
            { id: 'item-1', name: 'Burger', price: 12.99, assignedTo: [] },
            { id: 'item-2', name: 'Fries', price: 4.99, assignedTo: [] },
            { id: 'item-3', name: 'Soda', price: 2.49, assignedTo: [] },
            { id: 'item-4', name: 'Ice Cream', price: 5.99, assignedTo: [] },
        ];
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `You are a Receipt Analysis AI assistant. Analyze the following receipt image and extract all items and their prices.
IMPORTANT: Maintain the exact prices and item names as they appear on the receipt.

Return a single JSON object with the following structure:
{
  "items": [
    {
      "id": "unique_id",
      "name": "exact item name as shown on receipt",
      "price": price_as_number,
      "assignedTo": []
    }
  ]
}

IMPORTANT INSTRUCTIONS:
1. Extract ONLY actual products/items and their prices from the receipt
2. DO NOT include TOTAL, SUBTOTAL, CASH, PAYMENT, or CHANGE entries
3. Keep item names exactly as they appear on the receipt
4. Convert prices to numbers (remove currency symbols)
5. Ensure the JSON is valid and follows the exact structure shown above
6. If an item has a quantity, multiply the price by the quantity`;

        const parts = [
            { text: prompt },
            {
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: base64Image.split(',')[1] // Remove the data URL prefix
                }
            }
        ];

        const result = await model.generateContent(parts);
        const response = await result.response;
        const text = response.text();

        // Validate that the response is valid JSON
        try {
            const data = JSON.parse(text);
            // Filter out common total/payment entries
            return data.items
                .filter((item: any) => {
                    const name = item.name.toLowerCase();
                    return !(
                        name.includes('total') ||
                        name.includes('subtotal') ||
                        name.includes('cash') ||
                        name.includes('change') ||
                        name.includes('payment') ||
                        name.includes('tax') ||
                        name.includes('tip')
                    );
                })
                .map((item: any, index: number) => ({
                    id: item.id || `item-${index + 1}`,
                    name: item.name,
                    price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
                    assignedTo: [],
                }));
        } catch (e) {
            // If the response isn't valid JSON, try to extract JSON from it
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const data = JSON.parse(jsonMatch[0]);
                // Filter out common total/payment entries
                return data.items
                    .filter((item: any) => {
                        const name = item.name.toLowerCase();
                        return !(
                            name.includes('total') ||
                            name.includes('subtotal') ||
                            name.includes('cash') ||
                            name.includes('change') ||
                            name.includes('payment') ||
                            name.includes('tax') ||
                            name.includes('tip')
                        );
                    })
                    .map((item: any, index: number) => ({
                        id: item.id || `item-${index + 1}`,
                        name: item.name,
                        price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
                        assignedTo: [],
                    }));
            }
            throw new Error('Failed to get valid JSON response from Gemini');
        }
    } catch (error) {
        console.error('Error in analyzeReceiptWithGemini:', error);
        if (error instanceof Error && error.message.includes('404')) {
            throw new Error('The receipt analysis service is temporarily unavailable. Please try again later.');
        }
        throw error;
    }
}

export async function POST(request: Request) {
    try {
        const { image } = await request.json();

        if (!image) {
            return NextResponse.json(
                { error: 'No image provided' },
                { status: 400 }
            );
        }

        const items = await analyzeReceiptWithGemini(image);
        return NextResponse.json({ items });
    } catch (error) {
        console.error('Error processing receipt:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to process receipt' },
            { status: 500 }
        );
    }
} 