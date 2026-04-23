import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = 'gemini-3-flash-preview';

export interface EbookOutline {
  title: string;
  introduction: string;
  chapters: {
    title: string;
    description: string;
  }[];
  conclusion: string;
}

export async function generateOutline(
  niche: string,
  tone: string,
  pages: number,
  author: string
): Promise<EbookOutline> {
  const prompt = `You are a professional eBook architect and ghostwriter.
Your task is to create a comprehensive eBook outline based on the following parameters:
- Topic/Niche: ${niche}
- Tone/Style: ${tone}
- Author Name: ${author}
- Target Page Count: ${pages} pages (This implies we need a solid amount of chapters, roughly 8-12 chapters to provide enough meat).

Create a structured, highly engaging, and logical outline. Use the provided JSON schema. Ensure the descriptions are detailed enough to guide a writer later.`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "The captivating title of the eBook" },
          introduction: { type: Type.STRING, description: "What the introduction should cover" },
          chapters: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Chapter title" },
                description: { type: Type.STRING, description: "Detailed outline of what this chapter will cover" }
              },
              required: ["title", "description"]
            }
          },
          conclusion: { type: Type.STRING, description: "What the conclusion should cover" }
        },
        required: ["title", "introduction", "chapters", "conclusion"]
      }
    }
  });

  const text = response.text || "{}";
  return JSON.parse(text) as EbookOutline;
}

export async function generateSection(
  bookTitle: string,
  author: string,
  tone: string,
  sectionTitle: string,
  sectionDescription: string,
  isIntroOrConclusion: boolean = false
): Promise<string> {
  const prompt = `You are the expert author "${author}" writing a highly valuable eBook titled "${bookTitle}".
The tone of the book is: ${tone}.

Your task is to write the complete content for the following section:
Section Title: ${sectionTitle}

Instructions for this section:
${sectionDescription}

Write the full, comprehensive content for this section. The output should be formatted in standard Markdown.
Use appropriate headings (starting with ## or ###), paragraphs, and bullet points if necessary.
Make the content detailed, practical, and highly engaging. Do not just write a summary; write the actual book content. Keep it professional and original.
Do not include the book title at the top, just start with the Section Title as an H1 (#) or H2 (##) as appropriate, followed by the deep content.`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      temperature: 0.7,
    }
  });

  return response.text || "";
}
