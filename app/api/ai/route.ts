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
  switch (type) {
    case 'analyze':
      return `You are an ATS (Applicant Tracking System) analyzer. Analyze the following resume data and return ONLY a JSON object with scores and feedback. The response must be a valid JSON object with no additional text, markdown, or formatting.

Resume to analyze:
${JSON.stringify(content)}

Scoring Criteria:

ATS Compatibility (Score out of 100):
- Format and Structure (30 points):
  * Clear section headings
  * Consistent formatting
  * Proper use of bullet points
  * Standard resume sections present
- Content Quality (40 points):
  * Relevant information for each section
  * Proper date formatting
  * Contact information completeness
  * Professional email address
- Keyword Optimization (30 points):
  * Industry-standard terminology
  * Job-relevant skills
  * Technical terms accuracy

Impact Statements (Score out of 100):
- Action Verbs (25 points):
  * Strong action verbs at start
  * Variety in verb usage
  * Professional tone
- Quantification (25 points):
  * Numerical results
  * Percentages
  * Specific metrics
- Achievement Focus (25 points):
  * Results over responsibilities
  * Problem-solution statements
  * Impact on business
- Clarity (25 points):
  * Concise phrasing
  * Clear cause-effect
  * Professional language

Keywords Match (Score out of 100):
- Technical Skills (40 points):
  * Relevant technical skills
  * Current technologies
  * Industry-standard tools
- Soft Skills (30 points):
  * Leadership terms
  * Collaboration terms
  * Communication skills
- Industry Terms (30 points):
  * Domain-specific terminology
  * Role-specific keywords
  * Industry best practices

Required JSON format:
{
  "atsCompatibility": {
    "score": <number 0-100>,
    "feedback": "<clear, specific feedback with actionable improvements>"
  },
  "impactStatements": {
    "score": <number 0-100>,
    "feedback": "<clear, specific feedback with actionable improvements>"
  },
  "keywordsMatch": {
    "score": <number 0-100>,
    "feedback": "<clear, specific feedback with actionable improvements>"
  }
}

Important:
1. Scores must be integers between 0 and 100
2. Follow the scoring criteria exactly
3. Be consistent in scoring across analyses
4. Provide specific, actionable feedback for improvement`;
    case 'improve':
      return `Act as a professional resume writer. Generate ONLY the actual content to be used in the resume. Do not provide explanations, suggestions, or instructions.

Input Content:
${JSON.stringify(content)}

Requirements:
1. Return only the final content
2. Content should be ready to use directly in the resume
3. No explanations or meta-commentary
4. No bullet points or formatting
5. Just the plain text content

Generate an improved version that is more professional and impactful.`;
    case 'suggest':
      return `Act as a professional resume writer. Generate ONLY the actual content to be used in the resume. Do not provide explanations, suggestions, or instructions.

Input Content:
${JSON.stringify(content)}

Requirements:
1. Return only the final content
2. Content should be ready to use directly in the resume
3. No explanations or meta-commentary
4. No bullet points or formatting
5. Just the plain text content

Generate an improved version of this resume section.`;
    default:
      return `Act as a professional resume writer. Generate ONLY the actual content to be used in the resume. Do not provide explanations, suggestions, or instructions.

Input Content:
${JSON.stringify(content)}

Requirements:
1. Return only the final content
2. Content should be ready to use directly in the resume
3. No explanations or meta-commentary
4. No bullet points or formatting
5. Just the plain text content

Generate professional resume content.`;
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

      // Set generation config to encourage consistent, deterministic responses
      const generationConfig = {
        temperature: 0.1,
        topK: 1,
        topP: 0.1,
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