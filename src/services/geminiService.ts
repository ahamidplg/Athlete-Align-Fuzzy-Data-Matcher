import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface HometownStats {
  hometown: string;
  olympicCount: number;
  paralympicCount: number;
}

export async function generateTeamInsights(stats: HometownStats[]) {
  const dataStr = stats.map(s => `${s.hometown}: ${s.olympicCount}`).join(", ");
  const data2Str = stats.map(s => `${s.hometown}: ${s.paralympicCount}`).join(", ");

  const prompt = `You are a Gemini API assistant for a Team USA parity dashboard called "Two Flags, One Team." 
Given the following aggregated data:
Olympic athlete count per hometown: {${dataStr}} 
Paralympic athlete count per hometown: {${data2Str}}

Generate 3 natural-language insights that:
- Treat Olympic and Paralympic data with equal prominence
- Use conditional phrasing ("could help find," "is associated with," "tends to appear")
- Never mention medal counts – only participation and hometowns
- Include a reference to the tri-composite logo where appropriate

Return the response as a simple list of 3 strings.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    return response.text;
  } catch (error) {
    console.error("Error generating insights:", error);
    return "Unable to generate insights at this time.";
  }
}
