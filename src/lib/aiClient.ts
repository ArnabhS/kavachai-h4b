import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function askAgent(prompt: string, content: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const chat = model.startChat({ history: [] });

  const res = await chat.sendMessage([prompt, content].join("\n"));

  const responseText = res.response.text();

  try {
    return JSON.parse(responseText || "{}");
  } catch {
    return { error: "Invalid response format" };
  }
}
