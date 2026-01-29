
import {
    Users,
    Mail,
    Phone,
    Globe,
    Calendar,
    Code2,
    CheckCircle2,
    Smartphone,
    Database,
    Shield,
    Cloud,
    Zap,
    Clock,
    BarChart3,
    Cpu,
    Target,
    Layout,
    GitBranch,
    Server,
    Lock,
    Rocket,
    CreditCard,
    Briefcase
} from "lucide-react";
import React, { forwardRef } from "react";

// Types for props matching the new API schema
export interface PDFReportProps {
    clientData: {
        name: string;
        email: string;
        contact: string;
        country: string;
        flag: string;
        currency: string;
    };
    analysisData: {
        projectName: string;
        projectOverview: string;
        scopeOfWork: string;
        timeline: string;
        technologies: string;
        investment: string;
        paymentTerms: string;
        deliverables: string;
    } | null;
}

const PdfReport = forwardRef<HTMLDivElement, PDFReportProps>(({
    clientData,
    analysisData
}, ref) => {

    if (!analysisData) return null;

    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    // Helper to split text by newline for bullet points and parse markdown
    // --- RENDER HELPERS ---

    // 1. Helper to format bold text (**text**)
    const formatText = (str: string) => {
        if (!str.includes('**')) return str;
        return str.split(/(\*\*.*?\*\*)/).map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index} className="font-bold text-[#1e293b]">{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    // 2. Shared Helper to render a single line
    const renderLine = (line: string, i: number) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-1"></div>;

        // Header
        if (trimmed.startsWith('#')) {
            const content = trimmed.replace(/^#+\s*/, '');
            return (
                <h4 key={i} className="text-[#0f172a] font-bold text-lg mt-3 mb-2 font-serif border-b border-gray-100 pb-1 break-inside-avoid">
                    {content}
                </h4>
            );
        }

        // Key-Value pairs like "Front-End: React"
        if (trimmed.includes(':') && trimmed.length < 100 && !trimmed.startsWith('-') && !trimmed.startsWith('•') && !trimmed.includes('**')) {
            const parts = trimmed.split(':');
            return (
                <p key={i} className="mb-1 text-base leading-relaxed text-[#334155] font-light break-inside-avoid">
                    <span className="font-bold text-[#1e293b]">{parts[0]}:</span>{parts.slice(1).join(':')}
                </p>
            );
        }

        // Numbered List Items (1. Item)
        if (/^\d+\./.test(trimmed)) {
            const parts = trimmed.split('.');
            const number = parts[0];
            const content = parts.slice(1).join('.').trim();

            return (
                <div key={i} className="flex gap-3 mb-2 pl-1 items-start break-inside-avoid">
                    <span className="text-[#D94632] font-bold text-base shrink-0 min-w-[20px] text-right">{number}.</span>
                    <p className="text-base leading-relaxed text-[#334155] font-light">{formatText(content)}</p>
                </div>
            );
        }

        // Bullet Points (Fallback)
        if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*')) {
            const content = trimmed.replace(/^[-•*]\s*/, '');
            return (
                <div key={i} className="flex gap-2 mb-2 pl-2 items-start break-inside-avoid">
                    <span className="text-[#D94632] mt-1.5 text-[10px] shrink-0">●</span>
                    <p className="text-base leading-relaxed text-[#334155] font-light">{formatText(content)}</p>
                </div>
            );
        }

        // Standard Paragraph
        return (
            <p key={i} className="mb-2 text-base leading-relaxed text-[#334155] font-light break-inside-avoid">{formatText(trimmed)}</p>
        );
    };

    // 3. Main Content Render (splits text)
    const renderContent = (text: string) => {
        if (!text) return null;
        return text.split(/\r?\n|\\n/).map((line, i) => renderLine(line, i));
    };

    // 4. Specialized Scope Render (Alphabetical Bullets)
    const renderScopeLines = (lines: string[]) => {
        let alphaIndex = 0;

        return lines.map((line, i) => {
            const trimmed = line.trim();
            if (!trimmed) return null;

            // Header -> Reset Counter
            if (trimmed.startsWith('#') || trimmed.toLowerCase().startsWith('module')) {
                alphaIndex = 0;
                return renderLine(line, i);
            }

            // Bullet Point -> Render Alphabet (a, b, c...)
            if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*')) {
                const content = trimmed.replace(/^[-•*]\s*/, '');
                const letter = String.fromCharCode(97 + alphaIndex) + ')'; // 97 = 'a'
                alphaIndex++;

                return (
                    <div key={i} className="flex gap-3 mb-2 pl-2 items-baseline break-inside-avoid">
                        <span className="text-[#D94632] font-bold text-base shrink-0 min-w-[20px] text-right">{letter}</span>
                        <p className="text-base leading-relaxed text-[#334155] font-light">{formatText(content)}</p>
                    </div>
                );
            }

            // Fallback to standard render
            return renderLine(line, i);
        });
    };    // Brand Colors (Matching Global CSS)
    // Background: hsl(26 100% 99%) -> #fffcfb
    // Foreground: hsl(220 10% 29%) -> #434d5b
    // Primary: hsl(9 69% 53%) -> #D94632
    // Secondary: hsl(17 100% 94%) -> #ffe0d1

    // A4 Aspect Ratio Container Style
    // A4 is 210mm x 297mm. At 96 DPI, that's approx 794px x 1123px.
    const pageStyle = "w-[794px] h-[1123px] bg-[#fffcfb] relative overflow-hidden flex flex-col shadow-lg mb-8 mx-auto print-page origin-top-left font-serif text-[#434d5b]";
    const contentPadding = "px-12 py-12 flex-1 flex flex-col"; // Increased padding for document feel

    // --- PAGINATION LOGIC FOR SCOPE OF WORK ---
    const scopeLines = analysisData.scopeOfWork ? analysisData.scopeOfWork.split(/\r?\n|\\n/).filter(line => line.trim() !== '') : [];

    // Page 3 capacity: Project Overview is there, so we have less space for Scope.
    // Reduced to 10 to ensure plenty of space for footer.
    const ITEMS_PER_FIRST_PAGE = 10;
    // Full Scope Page capacity: Reduced to 22 to prevent footer crowding.
    const ITEMS_PER_FULL_PAGE = 22;

    const firstScopeChunk = scopeLines.slice(0, ITEMS_PER_FIRST_PAGE);
    const remainingScopeLines = scopeLines.slice(ITEMS_PER_FIRST_PAGE);

    // Split remaining lines into chunks for dedicated pages
    const scopeChunks = [];
    for (let i = 0; i < remainingScopeLines.length; i += ITEMS_PER_FULL_PAGE) {
        scopeChunks.push(remainingScopeLines.slice(i, i + ITEMS_PER_FULL_PAGE));
    }

    // Helper to render a chunk of lines (Same logic as renderContent but for array)
    // Helper to render a chunk of lines (Same logic as renderContent but for array)

    return (
        <div ref={ref} className="bg-[#f3f4f6] p-4 md:p-8">
            {/* --- PAGE 1: COVER PAGE --- */}
            <div id="pdf-page-1" className={pageStyle}>
                {/* Subtle Orange Glows for Light Theme */}
                <div
                    className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full"
                    style={{ background: 'rgba(217, 70, 50, 0.05)', filter: 'blur(100px)', transform: 'none', right: '-200px', top: '-200px' }}
                ></div>
                <div
                    className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full"
                    style={{ background: 'rgba(249, 115, 22, 0.05)', filter: 'blur(100px)', transform: 'none', left: '-200px', bottom: '-200px' }}
                ></div>

                <div className={contentPadding}>
                    {/* Header Logo */}
                    <div className="flex justify-between items-start mb-24 relative z-10">
                        <div className="flex items-center gap-3">
                            <img src="/images/logo.svg" alt="Talentronaut Logo" className="h-10 w-auto" />
                            <div className="text-3xl font-bold tracking-tight text-[#D94632]">Talentronaut.</div>
                        </div>
                        <div className="text-right text-[#94a3b8] text-sm font-sans">
                            <p>CONFIDENTIAL</p>
                            <p className="opacity-70">Ref: PROJ-{new Date().getFullYear()}-8832</p>
                        </div>
                    </div>

                    {/* Main Title */}
                    <div className="flex-1 flex flex-col justify-center relative z-10">
                        <div className="border-l-4 border-[#D94632] pl-8 py-2 mb-8">
                            <h1 className="text-6xl font-bold leading-tight text-[#1e293b] mb-4">
                                {analysisData.projectName.replace(/^Talentronaut[:\s]*/i, '').replace(/^Talentronout[:\s]*/i, '')}
                            </h1>
                            <p className="text-2xl text-[#64748b] font-light max-w-lg leading-relaxed font-sans">
                                Project Proposal & Execution Plan
                            </p>
                        </div>
                    </div>

                    {/* Footer Details */}
                    <div className="border-t border-[#e2e8f0] pt-8 mt-auto relative z-10">
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <p className="text-xs text-[#94a3b8] uppercase tracking-widest mb-2 font-sans font-bold">Prepared For</p>
                                <p className="text-xl font-bold text-[#1e293b] mb-1">{clientData.name}</p>
                                <p className="text-[#64748b] font-sans text-sm">{clientData.country}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-[#94a3b8] uppercase tracking-widest mb-2 font-sans font-bold">Statement Date</p>
                                <p className="text-xl font-medium text-[#1e293b]">{currentDate}</p>
                            </div>
                        </div>
                    </div>

                    {/* Website Footer */}
                    <div className="absolute bottom-6 left-0 right-0 flex justify-center z-10">
                        <a href="https://www.talentronaut.in/" target="_blank" rel="noopener noreferrer" className="text-[#94a3b8] text-xs font-sans hover:text-[#D94632] transition-colors">
                            https://www.talentronaut.in
                        </a>
                    </div>
                </div>
            </div>

            {/* --- PAGE 2: COMPANY PROFILE --- */}
            <div id="pdf-page-2" className={pageStyle}>
                <div className={contentPadding}>
                    <div className="pb-4 mb-8 border-b border-[#e2e8f0]">
                        <h2 className="text-sm font-bold text-[#94a3b8] uppercase tracking-widest">02 • Company Profile</h2>
                    </div>

                    <div className="space-y-12 font-sans">
                        {/* Who We Are */}
                        <div>
                            <h3 className="text-[#1e293b] font-bold text-2xl mb-4 font-serif">Who We Are</h3>
                            <p className="text-[#334155] leading-relaxed text-base font-light">
                                <span className="font-bold text-[#D94632]">Talentronaut Technologies</span> is a premium, full-stack software development agency based in India,
                                serving clients across the globe. We specialize in building secure, scalable, and high-performance
                                custom software solutions that drive digital transformation.
                            </p>
                            <p className="text-[#334155] leading-relaxed mt-4">
                                With deep expertise in modern technologies and cross-industry insights, we turn bold ideas into
                                future-ready digital products.
                            </p>
                        </div>

                        {/* Development Process - Vertical List (Point-wise) */}
                        <div>
                            <h3 className="text-[#1e293b] font-bold text-2xl mb-8 font-serif">
                                Development Process
                            </h3>
                            <div className="space-y-8 pl-2">
                                {/* Step 1 */}
                                <div className="flex gap-6 items-start">
                                    <div className="text-3xl font-bold text-[#e2e8f0] font-serif leading-none mt-1">01</div>
                                    <div>
                                        <h4 className="text-lg font-bold text-[#1e293b] mb-1">Discover & Define</h4>
                                        <p className="text-[#64748b] text-base leading-relaxed">Ideation workshops, requirement mapping & stakeholder alignment.</p>
                                    </div>
                                </div>

                                {/* Step 2 */}
                                <div className="flex gap-6 items-start">
                                    <div className="text-3xl font-bold text-[#e2e8f0] font-serif leading-none mt-1">02</div>
                                    <div>
                                        <h4 className="text-lg font-bold text-[#1e293b] mb-1">Design</h4>
                                        <p className="text-[#64748b] text-base leading-relaxed">Prototyping, UI/UX creation, system architecture blueprints.</p>
                                    </div>
                                </div>

                                {/* Step 3 */}
                                <div className="flex gap-6 items-start">
                                    <div className="text-3xl font-bold text-[#e2e8f0] font-serif leading-none mt-1">03</div>
                                    <div>
                                        <h4 className="text-lg font-bold text-[#1e293b] mb-1">Develop</h4>
                                        <p className="text-[#64748b] text-base leading-relaxed">Agile-based development cycles with regular releases.</p>
                                    </div>
                                </div>

                                {/* Step 4 */}
                                <div className="flex gap-6 items-start">
                                    <div className="text-3xl font-bold text-[#e2e8f0] font-serif leading-none mt-1">04</div>
                                    <div>
                                        <h4 className="text-lg font-bold text-[#1e293b] mb-1">Test & Deploy</h4>
                                        <p className="text-[#64748b] text-base leading-relaxed">QA, performance audits, secure deployment.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Our Mission */}
                        <div className="pt-8 border-t border-[#e2e8f0]">
                            <p className="text-[#1e293b] font-serif italic text-lg text-center leading-relaxed">
                                "To engineer powerful software experiences that drive business growth, user engagement, and operational efficiency."
                            </p>
                        </div>
                    </div>
                    {/* Website Footer */}
                    <div className="mt-auto pt-8 border-t border-[#e2e8f0] flex justify-center">
                        <a href="https://www.talentronaut.in/" target="_blank" rel="noopener noreferrer" className="text-[#94a3b8] text-xs font-sans hover:text-[#D94632] transition-colors">
                            https://www.talentronaut.in
                        </a>
                    </div>
                </div>
            </div>

            {/* --- PAGE 3: PROJECT OVERVIEW & SCOPE (PART 1) --- */}
            <div id="pdf-page-3" className={pageStyle}>
                <div className={contentPadding}>
                    <div className="pb-4 mb-8 border-b border-[#e2e8f0]">
                        <h2 className="text-sm font-bold text-[#94a3b8] uppercase tracking-widest">03 • Project Details</h2>
                    </div>

                    <div className="space-y-10 font-sans">
                        {/* Project Overview */}
                        <div>
                            <h3 className="text-[#0f172a] font-bold text-2xl mb-4 font-serif flex items-center gap-3">
                                Project Overview
                            </h3>
                            <div className="text-[#334155] leading-relaxed text-base font-light">
                                {renderContent(analysisData.projectOverview)}
                            </div>
                        </div>

                        <hr className="border-[#e2e8f0]" />

                        {/* Scope of Work (Chunk 1) */}
                        <div>
                            <h3 className="text-[#0f172a] font-bold text-2xl mb-4 font-serif flex items-center gap-3">
                                Scope of Work
                            </h3>
                            <div className="text-[#334155] text-base leading-7 font-light">
                                {renderScopeLines(firstScopeChunk)}
                            </div>
                        </div>
                    </div>
                    {/* Website Footer */}
                    <div className="mt-auto pt-8 border-t border-[#e2e8f0] flex justify-center">
                        <a href="https://www.talentronaut.in/" target="_blank" rel="noopener noreferrer" className="text-[#94a3b8] text-xs font-sans hover:text-[#D94632] transition-colors">
                            https://www.talentronaut.in
                        </a>
                    </div>
                </div>
            </div>

            {/* --- PAGE 3+N: DYNAMIC SCOPE PAGES --- */}
            {scopeChunks.map((chunk, i) => (
                <div key={`scope-page-${i}`} className={pageStyle}>
                    <div className={contentPadding}>
                        <div className="pb-4 mb-8 border-b border-[#e2e8f0]">
                            <h2 className="text-sm font-bold text-[#94a3b8] uppercase tracking-widest">03 • Project Details (Cont.)</h2>
                        </div>

                        <div className="font-sans">
                            {/* Scope of Work (Chunk N) */}
                            <div>
                                <h3 className="text-[#0f172a] font-bold text-2xl mb-4 font-serif flex items-center gap-3 opacity-50">
                                    Scope of Work (Continued)
                                </h3>
                                <div className="text-[#334155] text-base leading-7 font-light">
                                    {renderScopeLines(chunk)}
                                </div>
                            </div>
                        </div>

                        {/* Website Footer */}
                        <div className="mt-auto pt-8 border-t border-[#e2e8f0] flex justify-center">
                            <a href="https://www.talentronaut.in/" target="_blank" rel="noopener noreferrer" className="text-[#94a3b8] text-xs font-sans hover:text-[#D94632] transition-colors">
                                https://www.talentronaut.in
                            </a>
                        </div>
                    </div>
                </div>
            ))}

            {/* --- PAGE 4: TIMELINE & TECHNOLOGY --- */}
            <div id="pdf-page-4" className={pageStyle}>
                <div className={contentPadding}>
                    <div className="pb-4 mb-8 border-b border-[#e2e8f0]">
                        <h2 className="text-sm font-bold text-[#94a3b8] uppercase tracking-widest">04 • Plan & Technology</h2>
                    </div>

                    <div className="space-y-10 font-sans">


                        {/* Timeline Table */}
                        <div>
                            <h3 className="text-[#0f172a] font-bold text-2xl mb-4 font-serif">
                                Project Timeline
                            </h3>
                            <div className="overflow-hidden border border-[#e2e8f0] rounded-lg">
                                <table className="w-full text-sm text-left text-[#334155]">
                                    <thead className="text-[12px] text-[#475569] uppercase bg-[#f8fafc] border-b border-[#e2e8f0]">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 font-bold w-1/3">Phase / Milestone</th>
                                            <th scope="col" className="px-6 py-3 font-bold">Duration / Details</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(() => {
                                            const lines = analysisData.timeline.split('\n').filter(line => line.trim());

                                            // 1. Identify "Total" row vs regular rows
                                            // The API often puts the total summary as the first line like "12-14 Weeks Total"
                                            // or we might find "Total" in the text.
                                            let totalRow: { phase: string; duration: string } | null = null;
                                            let regularRows: { phase: string; duration: string }[] = [];

                                            lines.forEach((line, index) => {
                                                const cleanLine = line.replace(/^[-•*]\s*/, '').trim();
                                                const parts = cleanLine.includes(':') ? cleanLine.split(':') : [cleanLine, ''];
                                                const phase = parts[0].trim();
                                                const duration = parts.slice(1).join(':').trim();

                                                const item = { phase, duration };

                                                // Heuristic: If it's the first line and has no colon/duration, OR explicitly says Total in phase
                                                const isTotal = (index === 0 && !duration) || phase.toLowerCase().includes('total');

                                                if (isTotal) {
                                                    totalRow = item;
                                                } else {
                                                    regularRows.push(item);
                                                }
                                            });

                                            // 2. Render Regular Rows
                                            return (
                                                <>
                                                    {regularRows.map((row, i) => (
                                                        <tr key={i} className="bg-white border-b border-[#e2e8f0] last:border-0 hover:bg-[#fcfcfc]">
                                                            <td className="px-6 py-4 font-medium text-[#0f172a]">
                                                                {row.phase}
                                                            </td>
                                                            <td className="px-6 py-4 text-[#334155]">
                                                                {row.duration || '-'}
                                                            </td>
                                                        </tr>
                                                    ))}

                                                    {/* 3. Render Total Row at the Bottom */}
                                                    {totalRow && (
                                                        <tr className="bg-[#fff7ed] border-t-2 border-[#D94632]">
                                                            <td className="px-6 py-4 font-bold text-[#D94632]">
                                                                Total Estimated Timeline
                                                            </td>
                                                            <td className="px-6 py-4 font-bold text-[#D94632]">
                                                                {totalRow.phase.replace(/total/i, '').trim() || totalRow.phase}
                                                            </td>
                                                        </tr>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <hr className="border-[#e2e8f0]" />

                        {/* Technologies Table */}
                        <div>
                            <h3 className="text-[#0f172a] font-bold text-2xl mb-4 font-serif">
                                Technologies & Frameworks
                            </h3>
                            <div className="overflow-hidden border border-[#e2e8f0] rounded-lg">
                                <table className="w-full text-sm text-left text-[#334155]">
                                    <thead className="text-[12px] text-[#475569] uppercase bg-[#f8fafc] border-b border-[#e2e8f0]">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 font-bold w-1/4">Category</th>
                                            <th scope="col" className="px-6 py-3 font-bold">Technology Stack</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {analysisData.technologies.split('\n').map((line, index) => {
                                            const cleanLine = line.replace(/^[-•*]\s*/, '').trim();
                                            if (!cleanLine) return null;

                                            // Try to split by colon first
                                            let category = "General";
                                            let stack = cleanLine;

                                            if (cleanLine.includes(':')) {
                                                const parts = cleanLine.split(':');
                                                category = parts[0].trim();
                                                stack = parts.slice(1).join(':').trim();
                                            }

                                            return (
                                                <tr key={index} className="bg-white border-b border-[#e2e8f0] last:border-0 hover:bg-[#fcfcfc]">
                                                    <td className="px-6 py-4 font-bold text-[#0f172a] bg-[#fdfdfd]">
                                                        {category}
                                                    </td>
                                                    <td className="px-6 py-4 text-[#334155]">
                                                        {stack}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    {/* Website Footer */}
                    <div className="mt-auto pt-8 border-t border-[#e2e8f0] flex justify-center">
                        <a href="https://www.talentronaut.in/" target="_blank" rel="noopener noreferrer" className="text-[#94a3b8] text-xs font-sans hover:text-[#D94632] transition-colors">
                            https://www.talentronaut.in
                        </a>
                    </div>
                </div>
            </div>

            {/* --- PAGE 5: INVESTMENT & PAYMENT --- */}
            <div id="pdf-page-5" className={pageStyle}>
                <div className={contentPadding}>
                    <div className="pb-4 mb-8 border-b border-[#e2e8f0]">
                        <h2 className="text-sm font-bold text-[#94a3b8] uppercase tracking-widest">05 • Commercials</h2>
                    </div>

                    <div className="font-sans h-full flex flex-col justify-start space-y-10">

                        {/* Investment */}
                        <div>
                            <h3 className="text-[#0f172a] font-bold text-2xl mb-4 font-serif">
                                Approximate Investment
                            </h3>
                            <div className="text-[#0f172a] text-lg font-medium leading-relaxed whitespace-pre-line border-l-4 border-[#D94632] pl-6 py-2 bg-[#fff7ed]">
                                {renderContent(analysisData.investment)}
                            </div>
                        </div>

                        <hr className="border-[#e2e8f0]" />

                        {/* Payment Terms */}
                        <div>
                            <h3 className="text-[#0f172a] font-bold text-2xl mb-6 font-serif">
                                Payment Terms
                            </h3>
                            <div className="grid grid-cols-2 gap-6">
                                {/* Term 1 */}
                                <div className="bg-[#f8fafc] p-6 rounded-xl border border-[#e2e8f0] relative overflow-hidden">
                                    <div className="absolute top-0 right-0 bg-[#e2e8f0] text-[#64748b] text-xs font-bold px-3 py-1 rounded-bl-lg">01</div>
                                    <h4 className="text-[#0f172a] font-bold text-lg mb-2">50% Advance to Initiate</h4>
                                    <p className="text-[#64748b] text-base leading-relaxed">
                                        Required to mobilize the development team, set up the infrastructure, and kickstart the design phase.
                                    </p>
                                </div>

                                {/* Term 2 */}
                                <div className="bg-[#fff7ed] p-6 rounded-xl border border-orange-100 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 bg-[#ffedd5] text-[#D94632] text-xs font-bold px-3 py-1 rounded-bl-lg">02</div>
                                    <h4 className="text-[#0f172a] font-bold text-lg mb-2">50% Title Transfer</h4>
                                    <p className="text-[#64748b] text-base leading-relaxed">
                                        Payable upon successful User Acceptance Testing (UAT) sign-off and before the final source code handover.
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                    {/* Website Footer */}
                    <div className="mt-auto pt-8 border-t border-[#e2e8f0] flex justify-center">
                        <a href="https://www.talentronaut.in/" target="_blank" rel="noopener noreferrer" className="text-[#94a3b8] text-xs font-sans hover:text-[#D94632] transition-colors">
                            https://www.talentronaut.in
                        </a>
                    </div>
                </div>
            </div>

            {/* --- PAGE 6: DELIVERABLES --- */}
            <div id="pdf-page-6" className={pageStyle}>
                <div className={contentPadding}>
                    <div className="pb-4 mb-8 border-b border-[#e2e8f0]">
                        <h2 className="text-sm font-bold text-[#94a3b8] uppercase tracking-widest">06 • Deliverables</h2>
                    </div>

                    <div className="font-sans h-full flex flex-col justify-start space-y-8">
                        <div>
                            <h3 className="text-[#0f172a] font-bold text-2xl mb-6 font-serif">
                                List of Deliverables
                            </h3>
                            <div className="text-[#334155] text-base leading-loose">
                                {renderScopeLines(analysisData.deliverables ? analysisData.deliverables.split(/\r?\n|\\n/) : [])}
                            </div>
                        </div>
                    </div>
                    {/* Website Footer */}
                    <div className="mt-auto pt-8 border-t border-[#e2e8f0] flex justify-center">
                        <a href="https://www.talentronaut.in/" target="_blank" rel="noopener noreferrer" className="text-[#94a3b8] text-xs font-sans hover:text-[#D94632] transition-colors">
                            https://www.talentronaut.in
                        </a>
                    </div>
                </div>
            </div>


            {/* --- PAGE 7: GLOBAL PRESENCE --- */}
            <div id="pdf-page-7" className={pageStyle}>

                {/* Background Pattern - Subtle Building/Abstract feel */}
                <div className="absolute inset-0 z-0 opacity-5 pointer-events-none select-none overflow-hidden bg-orange-50/50">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="black" strokeWidth="0.5" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div>

                <div className={`${contentPadding} relative z-10 flex flex-col h-full`}>

                    {/* Header */}
                    <div className="mb-8">
                        <h2 className="text-[#D94632] font-bold text-5xl font-serif mb-2">Global Presence</h2>
                    </div>

                    {/* Locations Columns */}
                    <div className="flex w-full mb-12 font-serif items-start">
                        {/* HQ Section */}
                        <div className="w-[40%] border-r border-gray-300 pr-8">
                            <div className="flex justify-between items-start">
                                <h3 className="text-[#0f172a] font-bold text-3xl">HQ</h3>
                                <div className="text-[#334155] text-base leading-relaxed text-right">
                                    <p>Chennai, TN</p>
                                    <p>Pune, MH</p>
                                    <p>Aurangabad, MH</p>
                                </div>
                            </div>
                        </div>

                        {/* Clients Section */}
                        <div className="w-[60%] pl-12">
                            <div className="flex gap-12 items-start">
                                <h3 className="text-[#0f172a] font-bold text-3xl shrink-0">Clients In</h3>
                                <div className="text-[#334155] text-base leading-relaxed">
                                    <p>USA, UAE, UK, Australia,</p>
                                    <p>Singapore, Germany</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Map Section */}
                    {/* Map Section */}
                    <div className="relative w-full h-[320px] mb-12 bg-white rounded-3xl shadow-xl flex items-center justify-center overflow-hidden">
                        {/* Map Image - Fits exactly like the outer box (full bleed) */}
                        <img src="/images/globe.png" alt="Global Presence Map" className="w-full h-full object-cover" />
                    </div>


                    {/* Stats Bar */}
                    <div className="bg-[#D94632] text-white p-6 rounded-2xl shadow-lg flex items-center justify-between mb-12">
                        <div className="flex flex-col">
                            <h3 className="text-2xl font-serif font-bold">Websites in Numbers</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="text-sm text-white/90">Chennai, TN, India</span>
                            </div>
                        </div>
                        <div className="flex gap-12 text-center">
                            <div>
                                <p className="text-3xl font-bold">4+</p>
                                <p className="text-xs uppercase tracking-wider opacity-90">Years</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold">250</p>
                                <p className="text-xs uppercase tracking-wider opacity-90">Clients</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold">450+</p>
                                <p className="text-xs uppercase tracking-wider opacity-90">Projects</p>
                            </div>
                        </div>
                    </div>

                    {/* Client Logos Grid */}
                    <div className="mt-auto mb-4">
                        <div className="grid grid-cols-4 gap-8 items-center opacity-70 grayscale hover:grayscale-0 transition-all duration-300">
                            {/* Reusing existing assets */}
                            <img src="/images/spj.png" alt="Spazorlab" className="h-10 object-contain mx-auto" />
                            <img src="/images/Yuglogo.png" alt="Yugandhara" className="h-10 object-contain mx-auto" />
                            <img src="/images/linksus.png" alt="LinksUs" className="h-10 object-contain mx-auto" />
                            {/* Placeholders for others to fill the grid as per design */}
                            <div className="h-10 flex items-center justify-center font-bold text-gray-400">SM Consultancy</div>
                            <div className="h-10 flex items-center justify-center font-bold text-gray-400">EnviFuture</div>
                            <div className="h-10 flex items-center justify-center font-bold text-gray-400">Mask Prod.</div>
                            <div className="h-10 flex items-center justify-center font-bold text-gray-400">SportzDen</div>
                            <div className="h-10 flex items-center justify-center font-bold text-gray-400">Immortals</div>
                        </div>
                    </div>

                    {/* Website Footer for Page 7 */}
                    <div className="pt-6 border-t border-[#e2e8f0] flex justify-center">
                        <a href="https://www.talentronaut.in/" target="_blank" rel="noopener noreferrer" className="text-[#94a3b8] text-xs font-sans hover:text-[#D94632] transition-colors">
                            https://www.talentronaut.in
                        </a>
                    </div>

                </div>
            </div>
        </div >
    );
});

PdfReport.displayName = "PdfReport";

export default PdfReport;
