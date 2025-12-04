import { GoogleGenAI } from "@google/genai";

const getGeminiClient = () => {
  // Always create a new client to ensure we capture the latest selected API key if it changed
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable is missing");
  }
  return new GoogleGenAI({ apiKey });
};

const getMimeType = (base64String: string): string => {
  const match = base64String.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
  return match ? match[1] : 'image/png'; // Default to png if not found
};

const getCleanBase64 = (base64String: string): string => {
  // Robustly remove the data URL header by splitting at the comma
  if (base64String.includes(',')) {
    return base64String.split(',')[1];
  }
  return base64String;
};

/**
 * Edits an image using Gemini 2.5 Flash Image.
 * 
 * @param imageBase64 The base64 string of the image.
 * @param prompt The text instruction for the edit.
 * @param aspectRatio Optional aspect ratio for the output (e.g., '16:9', '1:1').
 * @returns The base64 string of the generated image.
 */
export const editImageWithGemini = async (
  imageBase64: string, 
  prompt: string, 
  aspectRatio?: string
): Promise<string> => {
  try {
    const ai = getGeminiClient();
    const mimeType = getMimeType(imageBase64);
    const cleanBase64 = getCleanBase64(imageBase64);

    const requestOptions: any = {
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    };

    if (aspectRatio) {
      requestOptions.config = {
        imageConfig: {
          aspectRatio: aspectRatio
        }
      };
    }

    const response = await ai.models.generateContent(requestOptions);

    // Robustly check for the existence of candidates, content, and parts
    const candidate = response.candidates?.[0];
    const content = candidate?.content;
    const parts = content?.parts;

    if (parts && parts.length > 0) {
      // First check for image
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      
      // If no image, check for text (often a refusal or explanation)
      const textPart = parts.find(p => p.text);
      if (textPart && textPart.text) {
        console.warn("Gemini Refusal/Text Response:", textPart.text);
        throw new Error(`The AI could not generate the image: "${textPart.text}"`);
      }
    }
    
    // Log unexpected structure for debugging
    console.error("Unexpected Gemini response structure:", JSON.stringify(response, null, 2));
    throw new Error("No image data found in response");
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // Ensure we throw a string message if possible for UI to render
    if (error.message) {
      throw new Error(error.message);
    }
    throw error;
  }
};

/**
 * Generates a video using Veo 3.1.
 * 
 * @param imageBase64 The base64 string of the source image.
 * @param prompt The text prompt describing the video action.
 * @returns The URL of the generated video.
 */
export const generateVideo = async (imageBase64: string, prompt: string): Promise<string> => {
  try {
    const ai = getGeminiClient();
    const mimeType = getMimeType(imageBase64);
    const cleanBase64 = getCleanBase64(imageBase64);

    console.log("Starting video generation with Veo...");

    // Using Veo fast model for quicker previews as per guidelines
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      image: {
        imageBytes: cleanBase64,
        mimeType: mimeType,
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    // Poll for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({operation: operation});
    }

    if (operation.error) {
      const errorMessage = (operation.error as any).message || "Video generation failed";
      throw new Error(errorMessage as string);
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) {
      throw new Error("No video URI returned in response");
    }

    // Append API key to the URL as required for fetching the content
    return `${videoUri}&key=${process.env.API_KEY}`;
  } catch (error) {
    console.error("Gemini Video Generation Error:", error);
    throw error;
  }
};
