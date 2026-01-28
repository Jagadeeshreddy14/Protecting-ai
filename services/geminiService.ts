import { GoogleGenAI, Type } from "@google/genai";
import { Question, QuestionType } from "../types";

// Initialize Gemini
const apiKey = process.env.API_KEY || ''; // Fallback handled in logic
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const generateQuestionsAI = async (
  subject: string,
  topic: string,
  difficulty: string,
  count: number
): Promise<Question[]> => {
  if (!ai) {
    console.warn("Gemini API Key missing. Returning mock questions.");
    return generateMockQuestions(subject, topic, count);
  }

  const prompt = `
    Generate ${count} multiple-choice questions (MCQ) for a university exam.
    Subject: ${subject}
    Topic: ${topic}
    Difficulty: ${difficulty}
    
    Return pure JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING } 
              },
              correctAnswer: { type: Type.STRING, description: "The correct option string exactly as it appears in options" },
              marks: { type: Type.NUMBER }
            },
            required: ["text", "options", "correctAnswer", "marks"]
          }
        }
      }
    });

    if (response.text) {
      const rawData = JSON.parse(response.text);
      return rawData.map((q: any, idx: number) => ({
        id: `ai-gen-${Date.now()}-${idx}`,
        text: q.text,
        type: QuestionType.MCQ,
        options: q.options,
        correctAnswer: q.correctAnswer,
        marks: q.marks || 1
      }));
    }
    throw new Error("No response text");
  } catch (error) {
    console.error("Gemini Generation Failed:", error);
    return generateMockQuestions(subject, topic, count);
  }
};

const generateMockQuestions = (subject: string, topic: string, count: number): Question[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `mock-${Date.now()}-${i}`,
    text: `(Simulation) Sample ${subject} question about ${topic} #${i + 1}?`,
    type: QuestionType.MCQ,
    options: ["Option A", "Option B", "Option C", "Option D"],
    correctAnswer: "Option A",
    marks: 1
  }));
};