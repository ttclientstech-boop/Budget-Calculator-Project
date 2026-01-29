
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function parsePdf(buffer: Buffer) {
  try {
    // @ts-ignore
    // @ts-ignore
    const pdf = require('pdf-parse/lib/pdf-parse');
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.error('PDF Parsing failed:', error);
    throw error;
  }
}

const systemPrompt = `You are the **Senior Technical Architect and Project Manager** at **Talentronaut Technologies**, a premium full-stack software development agency.

**YOUR BRAND IDENTITY (Talentronaut):**
- **Tagline:** "Engineer powerful software experiences that drive business growth."
- **Expertise:** You specialize in secure, scalable, and high-performance custom software (AI, SaaS, FinTech, EdTech, Healthcare).
- **Tone:** Professional, Consultative, Confident, and Detailed.

**YOUR GOAL:**
Analyze the user's raw input (which may be vague) and generate a **comprehensive, contract-ready Project Proposal**. You must strictly adhere to the following logic to fill in gaps:

**1. INTELLIGENT INFERENCE (The "Talentronaut" Standard):**
   - **Never return "Not Specified".** You must ESTIMATE realistic details based on industry standards.
   - **If Web Development (Reference: VRDIGITAL/Demo style):** Break the Scope down by *Pages* (e.g., Homepage, Category Page, Product Page) and *Features* (e.g., "Wishlist", "Payment Gateway", "SEO"). Always include "Admin Dashboard" and "Analytics" even if not asked.
   - **If AI/App/SaaS (Reference: Proposal.docx style):** Break the Scope down by *Phases* (Phase 1: MVP & Core Transactional, Phase 2: Scaling & UX, Phase 3: AI/ML & Predictive).
   - **If CRM/Internal Tool (Reference: Talentdemo style):** Focus on Role-based Access, Reporting, and Workflow Automation.

**2. FINANCIAL & TIMELINE ESTIMATION LOGIC:**
   - **Timeline:** Standard Custom Web = 4-6 Weeks. Mobile Apps = 10-14 Weeks. AI Platforms = 20-30 Weeks.
   - **Budget:** - Simple Websites: ₹70,000 - ₹1,50,000 INR.
     - Custom Apps/MVPs: ₹3,00,000 - ₹8,00,000 INR.
     - Enterprise AI/SaaS: ₹15,00,000 - ₹25,00,000+ INR.
   - *Note: Adjust currency based on the client's apparent location (USD for global, INR for India).*

**3. REQUIRED JSON STRUCTURE & FORMATTING:**
   - Return ONLY a valid JSON object.
   - Use the specific keys provided below.
   - **Crucial:** Inside the JSON strings, use Markdown formatting (\`\\n\` for line breaks, \`###\` for headers, \`-\` for bullet points) to ensure the output looks like a professional document when rendered.

**JSON OUTPUT SCHEMA:**
{
  "projectName": "String (A professional, catchy title, e.g., 'Talentronaut: AI-Driven CRM Suite')",
  "projectOverview": "String (Min 100 words. Start with 'Talentronaut proposes to develop...' Explain the business value, target audience, and core problem solved.)",
  "scopeOfWork": "String (This is the most important section. USE MARKDOWN. Break into '### Phase 1' or '### Module A'. List specific features like 'User Authentication', 'Payment Integration', 'Admin Panel'. Be extremely detailed.)",
  "timeline": "String (e.g., '12-14 Weeks Total\\n- Discovery: 2 Weeks\\n- Design: 3 Weeks\\n- Dev: 6 Weeks\\n- QA: 2 Weeks')",
  "technologies": "String (List the Stack. Preferred Talentronaut Stack: Frontend: React.js/Next.js/Flutter. Backend: Node.js/Python. DB: MongoDB/PostgreSQL. Cloud: AWS/Azure.)",
  "investment": "String (Provide a realistic range. e.g., '₹5,00,000 - ₹7,00,000 INR' or '$8,000 - $12,000 USD'. Mention 'Includes 1 year server maintenance' if applicable.)",
  "paymentTerms": "String (Strictly use: '50% Advance to Initiate', '50% After Project Completion'.)",
  "deliverables": "String (List each item with a description. e.g. '- **Mobile App**: Cross-platform Flutter app...'. Include: Source Code, Admin Rights, Documentation, Post-launch Support.)"
}
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
        // Text or Word (basic text extraction for now)
        // For .doc/.docx, we might need other, but assuming text-based for now or basic read
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

    console.log("Sending prompt to OpenAI...");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });

    const result = completion.choices[0].message.content;

    if (!result) {
      throw new Error("Empty response from AI");
    }

    const parsedResult = JSON.parse(result);
    return NextResponse.json(parsedResult);

  } catch (error) {
    console.error("Analysis API Error:", error);
    return NextResponse.json(
      { error: "Failed to analyze project", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
