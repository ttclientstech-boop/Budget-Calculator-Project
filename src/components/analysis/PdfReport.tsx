
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
    Briefcase,
    MapPin
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
    };

    // 5. Helper to render Markdown Tables
    const renderMarkdownTable = (markdown: string) => {
        if (!markdown) return null;
        const lines = markdown.split(/\r?\n/).filter(line => line.trim());
        const tableLines = lines.filter(line => line.trim().startsWith('|'));

        // If not enough lines to form a table, return null to fallback to text
        if (tableLines.length < 3) return null;

        const parseRow = (line: string) => {
            const parts = line.split('|');
            return parts.slice(1, -1).map(c => c.trim());
        };

        const headers = parseRow(tableLines[0]);
        // Row 1 is separator |---|
        const rows = tableLines.slice(2).map(parseRow);

        return (
            <div className="overflow-hidden border border-[#e2e8f0] rounded-lg my-4 break-inside-avoid shadow-sm text-sm">
                <table className="w-full text-left">
                    <thead className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[#64748b] uppercase text-[11px] tracking-wider">
                        <tr>
                            {headers.map((h, i) => (
                                <th key={i} className="px-6 py-3 font-bold">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, i) => (
                            <tr key={i} className="bg-white border-b border-[#e2e8f0] last:border-0 hover:bg-[#fafafa]">
                                {row.map((cell, j) => (
                                    <td key={j} className="px-6 py-4 text-[#334155] align-top leading-relaxed">
                                        {formatText(cell)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };
    // Background: hsl(26 100% 99%) -> #fffcfb
    // Foreground: hsl(220 10% 29%) -> #434d5b
    // Primary: hsl(9 69% 53%) -> #D94632 (Talentronaut Terra-Cotta)
    // Secondary: hsl(17 100% 94%) -> #ffe0d1

    // A4 Aspect Ratio Container Style
    // A4 is 210mm x 297mm. At 96 DPI, that's approx 794px x 1123px.
    const basePageStyle = "w-[794px] bg-[#fffcfb] relative flex flex-col shadow-lg mb-8 mx-auto print-page origin-top-left font-serif text-[#434d5b]";

    // Fixed A4 Page (Cover, Profile, etc.)
    const fixedPageStyle = `${basePageStyle} h-[1123px] overflow-hidden`;

    // Dynamic Page (Content can vary) - Removed min-h-[1123px] constraint to auto-fit content
    // Added min-h-[600px] just to maintain some 'paper' feel even if empty
    const dynamicPageStyle = `${basePageStyle} min-h-[600px] h-auto`;

    const contentPadding = "px-12 py-12 flex-1 flex flex-col"; // Increased padding for document feel

    return (
        <div ref={ref} className="bg-[#f3f4f6] p-4 md:p-8">
            {/* --- PAGE 1: COVER PAGE (Fixed A4) --- */}
            <div id="pdf-page-1" className={fixedPageStyle}>
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

            {/* --- PAGE 2: COMPANY PROFILE (Fixed A4) --- */}
            <div id="pdf-page-2" className={fixedPageStyle}>
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

            {/* --- DYNAMIC SECTION: DETAILS, TIMELINE, TECH, COMMERCIALS --- */}
            {/* This section will grow with content and be exported as a long variable-height page */}
            <div id="pdf-dynamic-section" className={dynamicPageStyle}>
                <div className={contentPadding}>

                    {/* SECTION 03: PROJECT DETAILS */}
                    <div className="pb-4 mb-8 border-b border-[#e2e8f0]">
                        <h2 className="text-sm font-bold text-[#94a3b8] uppercase tracking-widest">03 • Project Details</h2>
                    </div>

                    <div className="space-y-10 font-sans mb-16">
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

                        {/* Scope of Work (Full) */}
                        <div>
                            <h3 className="text-[#0f172a] font-bold text-2xl mb-4 font-serif flex items-center gap-3">
                                Scope of Work
                            </h3>
                            <div className="text-[#334155] text-base leading-7 font-light">
                                {renderScopeLines(analysisData.scopeOfWork ? analysisData.scopeOfWork.split(/\r?\n|\\n/) : [])}
                            </div>
                        </div>
                    </div>


                    {/* SECTION 04: PLAN & TECHNOLOGY */}
                    <div className="pb-4 mb-8 border-b border-[#e2e8f0]">
                        <h2 className="text-sm font-bold text-[#94a3b8] uppercase tracking-widest">04 • Plan & Technology</h2>
                    </div>

                    <div className="space-y-10 font-sans mb-16">
                        {/* Timeline Table */}
                        <div>
                            <h3 className="text-[#0f172a] font-bold text-2xl mb-4 font-serif">
                                Project Timeline
                            </h3>
                            {renderMarkdownTable(analysisData.timeline) || (
                                <div className="text-[#334155] leading-relaxed text-base font-light whitespace-pre-line">
                                    {renderContent(analysisData.timeline)}
                                </div>
                            )}
                        </div>

                        <hr className="border-[#e2e8f0]" />

                        {/* Technologies Table */}
                        <div>
                            <h3 className="text-[#0f172a] font-bold text-2xl mb-4 font-serif">
                                Technologies & Frameworks
                            </h3>
                            {renderMarkdownTable(analysisData.technologies) || (
                                <div className="text-[#334155] leading-relaxed text-base font-light whitespace-pre-line">
                                    {renderContent(analysisData.technologies)}
                                </div>
                            )}
                        </div>
                    </div>


                    {/* SECTION 05: COMMERCIALS */}
                    <div className="pb-4 mb-8 border-b border-[#e2e8f0]">
                        <h2 className="text-sm font-bold text-[#94a3b8] uppercase tracking-widest">05 • Commercials</h2>
                    </div>

                    <div className="font-sans flex flex-col justify-start space-y-10 mb-16">
                        {/* Investment */}
                        <div>
                            <h3 className="text-[#0f172a] font-bold text-2xl mb-4 font-serif">
                                Approximate Investment
                            </h3>
                            <div className="text-[#0f172a] text-lg font-medium leading-relaxed whitespace-pre-line border-l-4 border-[#D94632] pl-6 py-2 bg-[#fff7ed]">
                                {renderMarkdownTable(analysisData.investment) || renderContent(analysisData.investment)}
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


                    {/* SECTION 06: DELIVERABLES */}
                    <div className="pb-4 mb-8 border-b border-[#e2e8f0]">
                        <h2 className="text-sm font-bold text-[#94a3b8] uppercase tracking-widest">06 • Deliverables</h2>
                    </div>

                    <div className="font-sans flex flex-col justify-start space-y-8 mb-8">
                        <div>
                            <h3 className="text-[#0f172a] font-bold text-2xl mb-6 font-serif">
                                List of Deliverables
                            </h3>
                            <div className="text-[#334155] text-base leading-loose">
                                {renderScopeLines(analysisData.deliverables ? analysisData.deliverables.split(/\r?\n|\\n/) : [])}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Website Footer (End of Dynamic Section) */}
                <div className="pb-12 px-12 border-t border-[#e2e8f0] mt-auto flex justify-center pt-8 bg-[#fffcfb]">
                    <a href="https://www.talentronaut.in/" target="_blank" rel="noopener noreferrer" className="text-[#94a3b8] text-xs font-sans hover:text-[#D94632] transition-colors">
                        https://www.talentronaut.in
                    </a>
                </div>
            </div>


            {/* --- GLOBAL PRESENCE (Keeping as Fixed Page or could append to dynamic, but usually fits better as standalone end page) --- */}
            {/* Let's keep it as fixed page 3 (technically 4th rendered block) for impact */}
            <div id="pdf-page-end" className={fixedPageStyle}>

                {/* Background Pattern - Subtle Building/Abstract feel */}


                <div className={`${contentPadding} relative z-10 flex flex-col h-full`}>

                    {/* Header */}
                    <div className="mb-8">
                        {/* Updated Color to match Hero Branding (#D94632) */}
                        <h2 className="text-[#D94632] font-bold text-6xl font-serif mb-2 tracking-tight">Global Presence</h2>
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
                    <div className="relative w-full h-[320px] mb-12 bg-white rounded-3xl shadow-xl flex items-center justify-center overflow-hidden border border-orange-100/50">
                        {/* Map Image */}
                        <img src="/images/globe.png" alt="Global Presence Map" className="w-full h-full object-cover" />
                    </div>


                    {/* Stats Bar */}
                    {/* Using #D94632 background to match the red/orange branding */}
                    <div className="bg-[#D94632] text-white p-8 rounded-3xl shadow-lg flex items-center justify-between mb-12 relative overflow-hidden">
                        {/* Subtle Shine/Glow effect */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                        <div className="flex flex-col relative z-10">
                            <h3 className="text-3xl font-serif font-bold mb-1">Websites in Numbers</h3>
                            <div className="flex items-center gap-2 opacity-90">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="text-base font-medium">Chennai, TN, India</span>
                            </div>
                        </div>
                        <div className="flex gap-16 text-center relative z-10">
                            <div>
                                <p className="text-4xl font-bold mb-1">4+</p>
                                <p className="text-xs uppercase tracking-wider font-bold opacity-80">Years</p>
                            </div>
                            <div>
                                <p className="text-4xl font-bold mb-1">250</p>
                                <p className="text-xs uppercase tracking-wider font-bold opacity-80">Clients</p>
                            </div>
                            <div>
                                <p className="text-4xl font-bold mb-1">450+</p>
                                <p className="text-xs uppercase tracking-wider font-bold opacity-80">Projects</p>
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
            {/* --- CONTACT US (New Last Page) --- */}
            <div id="pdf-page-contact" className={fixedPageStyle}>
                {/* Background Pattern - Subtle */}


                <div className={`${contentPadding} relative z-10 flex flex-col h-full justify-center`}>
                    {/* Header */}
                    <div className="mb-12">
                        <h2 className="text-[#D94632] font-bold text-6xl font-serif mb-4 tracking-tight">Contact Us</h2>
                        <p className="text-[#64748b] text-xl font-light">We'd love to hear from you.</p>
                    </div>

                    {/* Contact Details Card */}
                    <div className="bg-white p-10 rounded-3xl shadow-xl border border-orange-100 mx-8">
                        <div className="space-y-8">
                            {/* Website */}
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center shrink-0">
                                    <Globe className="w-6 h-6 text-[#D94632]" />
                                </div>
                                <div>
                                    <p className="text-sm text-[#94a3b8] uppercase font-bold tracking-wider mb-1">Visit our Website</p>
                                    <a href="https://www.talentronaut.in/" target="_blank" rel="noopener noreferrer" className="text-xl font-medium text-[#1e293b] hover:text-[#D94632] transition-colors">
                                        https://www.talentronaut.in/
                                    </a>
                                </div>
                            </div>

                            {/* WhatsApp */}
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center shrink-0">
                                    <Smartphone className="w-6 h-6 text-[#D94632]" />
                                </div>
                                <div>
                                    <p className="text-sm text-[#94a3b8] uppercase font-bold tracking-wider mb-1">Connect on WhatsApp</p>
                                    <a href="https://wa.me/918220324802" target="_blank" rel="noopener noreferrer" className="text-xl font-medium text-[#1e293b] hover:text-[#D94632] transition-colors">
                                        +91 82203 24802
                                    </a>
                                </div>
                            </div>

                            {/* Call */}
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center shrink-0">
                                    <Phone className="w-6 h-6 text-[#D94632]" />
                                </div>
                                <div>
                                    <p className="text-sm text-[#94a3b8] uppercase font-bold tracking-wider mb-1">Call Us</p>
                                    <a href="tel:+918220324802" className="text-xl font-medium text-[#1e293b] hover:text-[#D94632] transition-colors">
                                        +91 82203 24802
                                    </a>
                                </div>
                            </div>

                            {/* Address */}
                            <div className="flex items-start gap-6">
                                <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center shrink-0 mt-1">
                                    <MapPin className="w-6 h-6 text-[#D94632]" />
                                </div>
                                <div>
                                    <p className="text-sm text-[#94a3b8] uppercase font-bold tracking-wider mb-1">Address</p>
                                    <p className="text-lg font-medium text-[#1e293b] leading-relaxed">
                                        5-49, Maharaja Garden, Bajanai Kovil St,<br />
                                        Andavar Nagar, Ramapuram,<br />
                                        Chennai, Tamil Nadu 600089
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Thank You Message */}
                    <div className="mt-auto mb-16 text-center">
                        <h1 className="text-7xl font-bold text-[#1e293b] font-serif mb-4" style={{ letterSpacing: '-0.03em' }}>
                            Thank You!
                        </h1>
                        <p className="text-[#64748b] text-xl font-light">
                            Looking forward to building something amazing together.
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="pt-6 border-t border-[#e2e8f0] flex justify-center">
                        <a href="https://www.talentronaut.in/" target="_blank" rel="noopener noreferrer" className="text-[#94a3b8] text-xs font-sans hover:text-[#D94632] transition-colors">
                            https://www.talentronaut.in
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
});

PdfReport.displayName = "PdfReport";

export default PdfReport;
