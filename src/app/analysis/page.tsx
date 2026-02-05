"use client";

import Link from "next/link";
import {
    CheckCircle2,
    BarChart3,
    ArrowLeft,
    Globe,
    Smartphone,
    Database,
    Cpu,
    Cloud,
    Code2,
    Calendar,
    Users,
    Zap,
    Shield,
    Clock,
    Download,
    Mail,
    Phone,
    FileText,
    ArrowRight,
    MessageCircle
} from "lucide-react";


import jsPDF from "jspdf";
import { useState, useRef, useEffect } from "react";
import PdfReport from "@/components/analysis/PdfReport";

export default function AnalysisPage() {
    const [isExporting, setIsExporting] = useState(false);
    const [reportData, setReportData] = useState<any>(null);
    // We use a separate ref for the hidden print container to ensure full-resolution capture
    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // 1. Try to get data from Session Storage (Real Flow)
        const storedData = sessionStorage.getItem("aiReportData");

        if (storedData) {
            try {
                console.log("Raw Session Data:", storedData);
                const parsedData = JSON.parse(storedData);
                console.log("Parsed Report Data:", parsedData);

                if (parsedData && parsedData.analysis) {
                    setReportData(parsedData);
                    return;
                } else {
                    console.warn("Parsed data missing 'analysis' property", parsedData);
                }
            } catch (e) {
                console.error("Failed to parse report data", e);
            }
        }

        // 2. Fallback to Mock Data Simulation if no real data found
        console.log("No valid session data found, falling back to simulation.");
        const timer = setTimeout(() => {
            setReportData({
                client: {
                    name: "Alex Morgan",
                    email: "alex.morgan@example.com",
                    contact: "+1 (555) 012-3456",
                    country: "United States",
                    currency: "USD",
                    flag: "🇺🇸"
                },
                analysis: {
                    projectName: "SaaS Project Manager",
                    projectOverview: "The client aims to build a comprehensive SaaS platform for project management. The goal is to streamline collaboration and improve productivity for remote teams.\nKey objectives include centralized tracking, real-time updates, and automated reporting.",
                    scopeOfWork: "Phase 1: Discovery & Design\n- Requirement gathering\n- UI/UX Wireframes\n\nPhase 2: MVP Development\n- User Authentication\n- Task Management Board\n- Basic Reporting\n\nPhase 3: Testing & Launch\n- QA Testing\n- Deployment to AWS\n- User Training",
                    timeline: "Total Duration: 12-14 Weeks\n- Discovery: 2 Weeks\n- Design: 3 Weeks\n- Development: 8 Weeks\n- UAT & Launch: 1 Week",
                    technologies: "Frontend: Next.js, Tailwind CSS\nBackend: Node.js, Express\nDatabase: PostgreSQL\nCloud: AWS (EC2, S3, RDS)",
                    investment: "Total Estimated Cost: $15,000 - $20,000\n- Design: $3,000\n- Development: $12,000\n- Deployment & Support: $3,000",
                    paymentTerms: "50% Advance to Initiate\n50% After Project Completion",
                    deliverables: "1. **Source Code Repository**: Complete ownership of Github repository with full version history.\n2. **Admin Dashboard**: Web-based control panel to manage users, content, and analytics.\n3. **User Application**: Fully functional mobile/web app deployed to production.\n4. **Technical Documentation**: Architecture diagrams, API references, and setup guides.\n5. **3 Months Support**: Priority bug fixing and server monitoring post-launch."
                }
            });
        }, 1000); // Reduced delay for better UX if fallback is needed
        return () => clearTimeout(timer);
    }, []);

    const clientData = reportData ? reportData.client : {
        name: "Guest User",
        email: "guest@example.com",
        contact: "+1 (555) 000-0000",
        country: "Unknown",
        currency: "USD",
        flag: "🏳️"
    };

    const analysisData = reportData ? reportData.analysis : null;

    const handleExportPDF = async () => {
        if (!printRef.current) return;

        setIsExporting(true);

        try {
            // dynamic import for better performance
            const { toJpeg } = await import('html-to-image');
            const jsPDF = (await import('jspdf')).default;

            // Default A4 dimensions (Portrait, mm)
            const pdf = new jsPDF("p", "mm", "a4");
            const a4Width = pdf.internal.pageSize.getWidth();
            const a4Height = pdf.internal.pageSize.getHeight();

            const pages = printRef.current.querySelectorAll('.print-page');

            for (let i = 0; i < pages.length; i++) {
                const page = pages[i] as HTMLElement;

                // Capture using html-to-image
                // Using JPEG with 0.8 quality and 1.5 pixel ratio for optimal size (< 5MB)
                const imgData = await toJpeg(page, {
                    quality: 0.8,
                    pixelRatio: 1.5,
                    backgroundColor: "#ffffff"
                });

                const imgProps = pdf.getImageProperties(imgData);
                const imgWidth = imgProps.width;
                const imgHeight = imgProps.height;

                // Determine Render Dimensions
                // We fit the image width to the A4 width
                const ratio = a4Width / imgWidth;
                const renderHeight = imgHeight * ratio;

                // If it's the first page, we don't need to add a page (it's created by default)
                // But if the default page exists and we are at i > 0, we add a new one.
                // For the "Dynamic Section" (which might be taller than A4), we need to set the page height explicitly.

                if (i > 0) {
                    // Check if this page needs a custom height (Dynamic Section)
                    if (renderHeight > a4Height) {
                        // Add a page with custom dimensions [width, height] in mm
                        // Note: jsPDF addPage takes (format) or (width, height, units) depending on usage.
                        // For custom size: addPage([width, height])
                        pdf.addPage([a4Width, renderHeight]);
                    } else {
                        pdf.addPage("a4", "p");
                    }
                }

                // If it's the first page and it's custom height (unlikely for cover, but good for safety)
                if (i === 0 && renderHeight > a4Height) {
                    // The document is initialized as A4. If first page is custom, we might need to resize the init page
                    // or just live with it (Cover is typically A4).
                    // For now, assuming Cover is always A4.
                }

                pdf.addImage(imgData, 'JPEG', 0, 0, a4Width, renderHeight);
            }

            pdf.save(`Talentronaut_Project_Analysis_${clientData.name.replace(/\s+/g, '_')}.pdf`);

        } catch (error) {
            console.error("PDF Export Failed", error);
            alert("Failed to export PDF. Please try again.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-100 pb-20 font-sans relative">

            {/* --- HEADER --- */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50 no-print shadow-sm">
                <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between max-w-7xl">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-muted-foreground">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 leading-tight">Project Analysis</h1>
                            <p className="text-xs text-muted-foreground hidden md:block">Reference ID: #PROJ-2024-8832</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3">
                        {/* 1. Visit Web Application */}
                        <a
                            href="https://www.talentronaut.in/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#D94632] transition-colors p-2 hover:bg-orange-50 rounded-lg"
                            title="Visit Website"
                        >
                            <Globe size={18} />
                            <span className="hidden lg:inline">Visit Website</span>
                        </a>

                        {/* 2. Connect on Whatsapp */}
                        <a
                            href="https://wa.me/918220324802"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-green-600 transition-colors p-2 hover:bg-green-50 rounded-lg"
                            title="Connect on WhatsApp"
                        >
                            <MessageCircle size={18} />
                            <span className="hidden lg:inline">WhatsApp</span>
                        </a>

                        {/* 3. Request the Call */}
                        <a
                            href="tel:+918220324802"
                            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors p-2 hover:bg-blue-50 rounded-lg"
                            title="Call Us"
                        >
                            <Phone size={18} />
                            <span className="hidden lg:inline">Call</span>
                        </a>

                        {/* 4. Export Report (Primary Action) */}
                        <button
                            onClick={handleExportPDF}
                            disabled={isExporting}
                            className="bg-[#D94632] text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-[#b93826] transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-wait shadow-sm ml-2"
                        >
                            {isExporting ? (
                                <>Processing...</>
                            ) : (
                                <>
                                    <Download size={16} /> <span className="hidden sm:inline">Export Report</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* --- DOCUMENT VIEWER (VISIBLE) --- */}
            <div className="container mx-auto py-8 md:py-12 flex justify-center overflow-x-hidden">
                <div className="w-full flex justify-center">
                    {!reportData ? (
                        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
                            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <h2 className="text-xl font-bold text-gray-700">Generating Analysis...</h2>
                            <p className="text-gray-500 max-w-md">
                                Please wait while our AI analyzes your project requirements and builds a comprehensive strategic report.
                            </p>
                        </div>
                    ) : (
                        <div className="[zoom:0.35] xs:[zoom:0.5] sm:[zoom:0.6] md:[zoom:0.8] xl:[zoom:1] transition-all duration-300 mb-12 origin-top">
                            <PdfReport
                                clientData={clientData}
                                analysisData={analysisData}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* --- HIDDEN PRINT TEMPLATE (FULL RESOLUTION) --- */}
            {/* Placed at 0,0 but behind everything (z-50). No opacity to ensure capture works, main bg covers it. */}
            {
                reportData && (
                    <div className="fixed top-0 left-0 -z-50 pointer-events-none opacity-0">
                        <PdfReport
                            ref={printRef}
                            clientData={clientData}
                            analysisData={analysisData}
                        />
                    </div>
                )
            }

        </main >
    );
}
