import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Access the API key from environment variables
const apiKey = process.env.GOOGLE_AI_API_KEY;

// Validate API key
if (!apiKey) {
  throw new Error('GOOGLE_AI_API_KEY is not set in environment variables');
}

// Initialize Google AI with the API key
const genAI = new GoogleGenerativeAI(apiKey);

// Helper function to generate prompts based on type
function generatePrompt(type: string, content: any) {
  const basePrompt = `Act as a professional resume writer. Generate ONLY the actual content to be used in the resume. Do not provide explanations, suggestions, or instructions.

Input Content:
${JSON.stringify(content)}

Requirements:
1. Return only the final content
2. Content should be ready to use directly in the resume
3. No explanations or meta-commentary
4. No bullet points or formatting
5. Just the plain text content

Generate the content for: `;

  switch (type) {
    case 'improve':
      return basePrompt + "an improved version that is more professional and impactful.";
    case 'analyze':
      return basePrompt + "optimized content based on the job description.";
    case 'suggest':
      return basePrompt + "an improved version of this resume section.";
    default:
      return basePrompt + "professional resume content.";
  }
}

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    const { prompt, type } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    try {
      // Initialize the model
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      // Generate the appropriate prompt
      const formattedPrompt = generatePrompt(type, prompt);

      // Set generation config to encourage direct responses
      const generationConfig = {
        temperature: 0.7,
        topK: 1,
        topP: 0.8,
        maxOutputTokens: 1000,
      };

      // Generate content
      const result = await model.generateContent(formattedPrompt);

      const response = await result.response;
      const text = response.text();

      return NextResponse.json({ result: text });
    } catch (genError: any) {
      console.error('Generation Error:', genError);
      throw new Error(`Generation failed: ${genError.message}`);
    }
  } catch (error: any) {
    console.error('AI API Error:', error);
    
    // Return a more specific error message
    return NextResponse.json(
      { 
        error: 'Failed to process AI request',
        details: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
} 