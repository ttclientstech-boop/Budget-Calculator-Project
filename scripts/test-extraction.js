const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const OpenAI = require('openai');
require('dotenv').config({ path: '.env.local' }); // Try .env.local first
if (!process.env.OPENAI_API_KEY) {
    require('dotenv').config({ path: '.env' }); // Fallback
}

async function main() {
    const pdfPath = path.join(__dirname, '../public/Demo.pdf');

    if (!fs.existsSync(pdfPath)) {
        console.error("Error: Demo.pdf not found at", pdfPath);
        return;
    }

    // Basic import attempt
    const pdfModule = require('pdf-parse');
    const PDFParse = pdfModule.PDFParse || pdfModule.default?.PDFParse || pdfModule;

    // console.log("PDFParse Class:", PDFParse);

    let dataBuffer = fs.readFileSync(pdfPath);

    // Check if we can instantiate it
    let pdfText = "";
    if (typeof PDFParse === 'function' && PDFParse.prototype && PDFParse.prototype.getText) {
        try {
            // Try v2 API: new PDFParse({ data: buffer })
            const parser = new PDFParse({ data: dataBuffer });
            const result = await parser.getText();
            pdfText = result.text;
            await parser.destroy();
        } catch (e) {
            console.log("v2 instantiation failed, trying v1 style or other:", e);
        }
    } else {
        // Maybe v1 function style
        try {
            const data = await PDFParse(dataBuffer);
            pdfText = data.text;
        } catch (e2) {
            console.log("PDF Parse v1 failed as well:", e2);
            // One last try, maybe default export is the class but I missed it?
            if (pdfModule.default && typeof pdfModule.default === 'function') {
                try {
                    const parser = new pdfModule.default({ data: dataBuffer });
                    const result = await parser.getText();
                    pdfText = result.text;
                    await parser.destroy();
                } catch (e3) { console.error("All PDF parsing attempts failed."); return; }
            } else {
                return;
            }
        }
    }
    console.log("PDF Text Extracted (length):", pdfText.length);

    console.log("\n--- DETAILED PROMPT ---\n");

    const systemPrompt = `You are a helpful project proposal assistant.
Your goal is to extract specific project details from the provided project description/document.
Refine the content to be very easy to read, using basic English and simple language. 
Do NOT use bluff words or fluff. be direct and professional but simple.

Extract and format the following 8 points:
1. Project Name.
2. Project Overview and Understanding.
3. Scope of Work (Break into phases if required).
4. Project Timeline.
5. Framework Technologies.
6. Approx investment required.
7. Payment terms.
8. Deliverables.

Output valid JSON with keys: projectName, projectOverview, scopeOfWork, timeline, technologies, investment, paymentTerms, deliverables.
Content within JSON values should be formatted for direct insertion into a report (e.g. use \\n for line breaks).
`;

    const userPrompt = `Project Document Content:\n\n${pdfText.slice(0, 15000)}`;

    console.log("System Prompt: " + systemPrompt);
    console.log("User Prompt (preview): " + userPrompt.slice(0, 200) + "...");
    console.log("\n-----------------------\n");

    if (!process.env.OPENAI_API_KEY) {
        console.error("Error: OPENAI_API_KEY not found in environment.");
        return;
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    console.log("Sending to OpenAI...");
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
            response_format: { type: "json_object" },
        });

        const result = completion.choices[0].message.content;
        console.log("\n--- AI RESPONSE (CONSOLE CHECK) ---\n");
        console.log(result);
        console.log("\n-----------------------------------\n");

    } catch (error) {
        console.error("Error from OpenAI:", error);
    }
}

main();
