// lib/geminiService.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ExpenseFormData } from '@/types/expense';

export const extractExpenseData = async (imageData: string): Promise<ExpenseFormData> => {
  const API_KEY = process.env.GOOGLE_API_KEY;

  if (!API_KEY) {
    throw new Error('GOOGLE_API_KEY environment variable is required');
  }

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }); // Using the latest available model

  try {
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
    const image = {
      inlineData: {
        data: imageData,
        mimeType: 'image/jpeg' // We'll assume JPEG, but this can be adjusted
      }
    };

    // Generate content using the model
    const result = await model.generateContent([prompt, image]);
    const response = await result.response;
    const text = response.text();

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
      throw new Error('Failed to parse AI response');
    }

    return expenseData;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to extract expense data from image');
  }
};