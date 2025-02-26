import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY as string);

// Function to generate resume content
export async function generateResumeContent(
  userInfo: {
    name: string;
    email: string;
    phone: string;
    education: string[];
    experience: string[];
    skills: string[];
    objective?: string;
  },
  style: 'professional' | 'creative' | 'technical' = 'professional'
) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
      Create a professional resume for ${userInfo.name} with the following information:
      
      Contact Information:
      - Name: ${userInfo.name}
      - Email: ${userInfo.email}
      - Phone: ${userInfo.phone}
      
      ${userInfo.objective ? `Objective: ${userInfo.objective}` : ''}
      
      Education:
      ${userInfo.education.map(edu => `- ${edu}`).join('\n')}
      
      Experience:
      ${userInfo.experience.map(exp => `- ${exp}`).join('\n')}
      
      Skills:
      ${userInfo.skills.map(skill => `- ${skill}`).join('\n')}
      
      Please format this as a ${style} resume with appropriate sections and formatting.
      Enhance the descriptions to be impactful and results-oriented.
      Return the content in a structured format that can be easily formatted into a resume.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error('Error generating resume content:', error);
    throw new Error('Failed to generate resume content');
  }
}

// Function to improve resume content
export async function improveResumeContent(
  currentContent: string,
  improvementType: 'grammar' | 'impact' | 'keywords' = 'impact'
) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    let prompt = '';
    
    switch (improvementType) {
      case 'grammar':
        prompt = `Improve the grammar and clarity of the following resume content:\n\n${currentContent}`;
        break;
      case 'impact':
        prompt = `Enhance the following resume content to be more impactful and results-oriented:\n\n${currentContent}`;
        break;
      case 'keywords':
        prompt = `Optimize the following resume content with relevant industry keywords for better ATS performance:\n\n${currentContent}`;
        break;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error('Error improving resume content:', error);
    throw new Error('Failed to improve resume content');
  }
} 