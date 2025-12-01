import { GoogleGenAI, Chat, GenerateContentResponse, Type } from "@google/genai";
import { Message, ImageGenConfig } from "../types";

// Helper to ensure we get a fresh client with the latest key
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found. Please select a key.");
  }
  return new GoogleGenAI({ apiKey });
};

export const createChatSession = (enableSearch: boolean) => {
  const client = getClient();
  // Use gemini-2.5-flash for search grounding (fast & accurate for web info)
  // Use gemini-3-pro-preview for deep reasoning if search is off
  const model = enableSearch ? 'gemini-2.5-flash' : 'gemini-3-pro-preview';
  
  const config: any = {
    systemInstruction: "Você é um assistente de estudos inteligente e amigável para alunos do SESI (Serviço Social da Indústria). Ajude com dúvidas escolares, explique conceitos complexos de forma simples e incentive o aprendizado. Responda sempre em Português do Brasil.",
  };

  if (enableSearch) {
    config.tools = [{ googleSearch: {} }];
  }

  return client.chats.create({
    model,
    config
  });
};

export const sendMessageToChat = async (chat: Chat, message: string): Promise<GenerateContentResponse> => {
  return await chat.sendMessage({ message });
};

export const analyzeHomeworkImage = async (base64Image: string, prompt: string) => {
  const client = getClient();
  // Vision task: gemini-3-pro-preview
  const model = 'gemini-3-pro-preview';

  const response = await client.models.generateContent({
    model,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg', // Assuming jpeg for simplicity, or detect from input
            data: base64Image
          }
        },
        {
          text: `Você é um tutor do SESI. Analise esta imagem de uma tarefa escolar. ${prompt || "Explique como resolver este problema passo a passo. Não dê apenas a resposta final, ensine o aluno a pensar."}`
        }
      ]
    },
    config: {
        systemInstruction: "Seja didático e paciente. Use formatação clara com Markdown."
    }
  });

  return response;
};

export const generateStudyImage = async (prompt: string, config: ImageGenConfig) => {
  const client = getClient();
  // Image Generation: gemini-2.5-flash-image (Free/Standard tier)
  const model = 'gemini-2.5-flash-image';

  const response = await client.models.generateContent({
    model,
    contents: {
      parts: [
        {
          text: prompt
        }
      ]
    },
    config: {
      imageConfig: {
        // imageSize not supported for flash-image
        aspectRatio: config.aspectRatio
      }
    }
  });

  return response;
};

export const editStudyImage = async (base64Image: string, mimeType: string, prompt: string) => {
  const client = getClient();
  // Image Editing: gemini-2.5-flash-image
  const model = 'gemini-2.5-flash-image';

  const response = await client.models.generateContent({
    model,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Image
          }
        },
        {
          text: prompt
        }
      ]
    }
  });

  return response;
};