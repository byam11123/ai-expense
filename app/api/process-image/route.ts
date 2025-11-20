// app/api/process-image/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ExpenseFormData } from '@/types/expense';

export async function POST(req: NextRequest) {
  console.log('Processing image...');
  const API_KEY = process.env.GOOGLE_API_KEY;

  if (!API_KEY) {
    console.error('GOOGLE_API_KEY environment variable is not set');
    return NextResponse.json({ error: 'GOOGLE_API_KEY environment variable is required' }, { status: 500 });
  }
  console.log('API key found');

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  try {
    const formData = await req.formData();
    console.log('Form data received');
    const image = formData.get('image') as File | null;

    if (!image) {
      console.error('No image provided in form data');
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }
    console.log('Image found in form data');

    // Convert image to base64
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    console.log('Image converted to base64');

    // Define the prompt that guides the AI model to extract specific information
    const prompt = `Analyze this receipt image and extract the following information:
    1. Total Price (as a number)
    2. Currency (e.g. USD, EUR, etc.)
    3. Expense Category (e.g. Food, Travel, Shopping, Entertainment, Utilities, Healthcare, Education, Other)
    4. Vendor Name (the business name)
    5. Billing Date (the date of the transaction in YYYY-MM-DD format if visible on the receipt)

    Return the result as a JSON object with the following format:
    {
      "total": <number>,
      "currency": "<currency code>",
      "category": "<category>",
      "vendor": "<vendor name>",
      "billingDate": "<date in YYYY-MM-DD format or null if not available>"
    }

    Only return the JSON object, nothing else.`;

    // Prepare the content for the model
    const imagePart = {
      inlineData: {
        data: base64,
        mimeType: image.type
      }
    };

    console.log('Generating content with Gemini...');
    // Generate content using the model
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    console.log('Content generated successfully');

    // Clean up the response to extract just the JSON part
    let jsonString = text
      .replace(/```json/g, '') // Remove JSON code block markers
      .replace(/```/g, '')     // Remove any remaining code block markers
      .trim();

    // If the response still has text before the JSON, try to find the JSON portion
    if (!jsonString.startsWith('{') && jsonString.includes('{')) {
      const startIndex = jsonString.indexOf('{');
      const endIndex = jsonString.lastIndexOf('}') + 1;
      jsonString = jsonString.substring(startIndex, endIndex);
    }

    // Parse the JSON response
    let expenseData: ExpenseFormData;
    try {
      expenseData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      console.error('Raw response:', text);
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    return NextResponse.json(expenseData);
  } catch (error) {
    console.error('Error processing image:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
  }
}