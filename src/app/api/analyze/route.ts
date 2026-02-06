
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dbConnect from "@/lib/db";
import AIUsage from "@/models/AIUsage";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function parsePdf(buffer: Buffer) {
  try {
    // @ts-ignore
    const pdf = require('pdf-parse/lib/pdf-parse');
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.error('PDF Parsing failed:', error);
    throw error;
  }
}

const systemPrompt = `You are a **Senior Technical Consultant and Enterprise Solution Architect** working for **Talentronaut Technologies**, a premium IT services and digital solutions company.

**YOUR GOAL:**
Generate a complete, client-ready, enterprise-grade **Project Proposal** based strictly on the project description provided.

**CRITICAL INSTRUCTIONS:**
- Return ONLY a valid JSON object.
- The content inside the JSON strings MUST use Markdown formatting (e.g., tables, headers, bullet points).
- **Tone:** Formal, confident, and premium consulting tone. No emojis, slang, or casual phrasing.
- **Inference:** Never return "Not Specified". Estimate realistic details based on industry standards.

**JSON OUTPUT SCHEMA & CONTENT GUIDELINES:**
{
  "projectName": "String (Official project title)",
  "projectOverview": "String (Concise, professional explanation of idea, objectives, and outcomes. Demonstrate clear understanding.)",
  "scopeOfWork": "String (Define scope clearly. Divide into logical phases e.g., '### Phase 1' using Markdown headers. Be detailed.)",
  "timeline": "String (MUST be a Markdown Table. Columns: | Week | Phase / Activity | Description of Work |. Provide week-wise breakdown.)",
  "technologies": "String (MUST be a Markdown Table. Columns: | Category | Technology Stack | e.g. Frontend | React, Tailwind...)",
  "investment": "String (MUST be a Markdown Table. Columns: | Week / Phase | Work Description | Estimated Cost |. The LAST ROW must be 'TOTAL' with the final amount. Use specific currency symbols.)",
  "paymentTerms": "String (Define professional payment terms aligned with milestones. e.g. 50% Advance, 50% Completion.)",
  "deliverables": "String (List all project deliverables professionally. e.g. source code, admin rights, docs.)"
}

**FINANCIAL & TIMELINE ESTIMATION LOGIC:**
- **Timeline:** Standard Web = 4-6 Weeks. Mobile Apps = 10-14 Weeks. AI/SaaS = 12-20 Weeks.
- **Budget:** Simple Web: ₹70,000 - ₹1.5L | Custom App: ₹3L - ₹8L | Enterprise AI: ₹15L - ₹25L+. (Use USD for international clients, INR for India).
`;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const description = formData.get('description') as string;
    const file = formData.get('file') as File | null;
    const category = formData.get('category') as string;
    const country = formData.get('country') as string;

    let fileContent = "";

    if (file) {
      console.log(`Processing file: ${file.name} (${file.type})`);
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (file.type === "application/pdf") {
        try {
          fileContent = await parsePdf(buffer);
          console.log("PDF parsed successfully, length:", fileContent.length);
        } catch (error) {
          console.error("PDF Parse Error:", error);
          return NextResponse.json(
            { error: "Failed to read PDF file" },
            { status: 400 }
          );
        }
      } else {
        fileContent = buffer.toString('utf-8');
      }
    }

    // Construct User Prompt
    let userPrompt = `Project Description:\n${description}\n`;
    if (category) userPrompt += `Service Category: ${category}\n`;
    if (country) userPrompt += `Client Country: ${country}\n`;
    if (fileContent) {
      userPrompt += `\nProject Document Content:\n${fileContent.slice(0, 20000)}`; // Limit token usage
    }

    console.log("Sending prompt to Gemini...");

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemPrompt,
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const result = await model.generateContent(userPrompt);
    const response = await result.response;
    const text = response.text();


    // Log for debugging
    console.log("Gemini Response usage:", response.usageMetadata);

    if (!text) {
      throw new Error("Empty response from AI");
    }

    // --- AI Usage Tracking ---
    try {
      await dbConnect();

      const usage = response.usageMetadata;
      if (usage) {
        const promptTokens = usage.promptTokenCount || 0;
        const candidatesTokens = usage.candidatesTokenCount || 0;
        // @ts-ignore - thoughtsTokenCount might not be in the type definition yet
        const thoughtsTokens = usage.thoughtsTokenCount || 0;

        // Total Output = Candidates + Thoughts (as per user observation that total = p + c + t)
        const totalOutputTokens = candidatesTokens + thoughtsTokens;

        // Pricing (User provided)
        // Input: $0.30 per 1M
        // Output: $2.50 per 1M
        const inputPrice = 0.30;
        const outputPrice = 2.50;

        const inputCost = (promptTokens / 1000000) * inputPrice;
        const outputCost = (totalOutputTokens / 1000000) * outputPrice;
        const totalCost = inputCost + outputCost;

        // Get client email from formData if available
        const clientEmail = formData.get('contactEmail') as string || "Unknown";

        await AIUsage.create({
          model: "gemini-2.5-flash",
          promptTokenCount: promptTokens,
          candidatesTokenCount: candidatesTokens,
          thoughtsTokenCount: thoughtsTokens,
          totalTokenCount: usage.totalTokenCount || (promptTokens + totalOutputTokens),
          inputCost: parseFloat(inputCost.toFixed(6)),
          outputCost: parseFloat(outputCost.toFixed(6)),
          totalCost: parseFloat(totalCost.toFixed(6)),
          clientEmail: clientEmail
        });

        console.log(`AI Usage Tracked: $${totalCost.toFixed(6)}`);
      }
    } catch (dbError) {
      console.error("Failed to track AI usage:", dbError);
      // We do NOT block the response if tracking fails
    }
    // -------------------------

    const parsedResult = JSON.parse(text);
    return NextResponse.json(parsedResult);

  } catch (error) {
    console.error("Analysis API Error:", error);
    return NextResponse.json(
      { error: "Failed to analyze project", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
