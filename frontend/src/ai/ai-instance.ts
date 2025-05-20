import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";

// For server-side usage, we only need GOOGLE_GENAI_API_KEY
const apiKey = process.env.GOOGLE_GENAI_API_KEY;

// Create a mock AI instance that will be used when the API key is not available
const createMockAI = () => ({
  definePrompt: () => {
    console.warn("Google GenAI API key is not configured. AI features will be disabled.");
    return {
      run: async () => {
        throw new Error("Google GenAI API key is not configured. Please set GOOGLE_GENAI_API_KEY in your environment variables.");
      }
    };
  },
  defineFlow: () => {
    console.warn("Google GenAI API key is not configured. AI features will be disabled.");
    return {
      run: async () => {
        throw new Error("Google GenAI API key is not configured. Please set GOOGLE_GENAI_API_KEY in your environment variables.");
      }
    };
  }
});

// Export the AI instance based on whether we have an API key
export const ai = apiKey 
  ? genkit({
      promptDir: "./src/ai/prompts",
      plugins: [
        googleAI({
          apiKey,
        }),
      ],
      model: "googleai/gemini-2.0-flash",
    })
  : createMockAI();
