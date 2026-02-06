"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Upload, CheckCircle2, AlertCircle, ChevronDown, Wand2 } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import ContactModal, { ContactFormValues } from "./ContactModal";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
];

const formSchema = z.object({
    description: z
        .string()
        .min(500, { message: "Description must be at least 500 characters." })
        .refine((val) => val.trim().split(/\s+/).length >= 500, {
            message: "Description must be at least 500 words.",
        }),

    domain: z.string().min(1, { message: "Project domain is required." }),
    country: z.string().min(1, { message: "Country is required." }),
    file: z
        .custom<FileList>()
        .optional()
        .refine((files) => !files || files.length === 0 || files.length === 1, "Project document is required.")
        .refine((files) => !files || files.length === 0 || files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
        .refine(
            (files) => !files || files.length === 0 || ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
            "Only .pdf, .doc, .docx, and .txt formats are supported."
        ),
});

type FormValues = z.infer<typeof formSchema>;

const PROJECT_DOMAINS = [
    "Web & Software Development",
    "Mobile App Development",
    "Blockchain & Web3 Solutions",
    "AI-driven Solutions",
    "SaaS Development",
    "Other",
];



export default function ProjectForm() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Modal State
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [projectFormData, setProjectFormData] = useState<FormValues | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
        reset,
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
    });

    const domainValue = watch("domain"); // Watch domain for custom handling if needed, though mostly standard.

    const descriptionValue = watch("description") || "";
    const wordCount = descriptionValue.trim().split(/\s+/).filter((w) => w.length > 0).length;
    const fileValue = watch("file");

    const onProjectSubmit = (data: FormValues) => {
        // Step 1: Save data and open modal
        setProjectFormData(data);
        setIsContactModalOpen(true);
    };

    const handleFinalSubmit = async (contactData: ContactFormValues) => {
        setIsSubmitting(true);

        try {
            // --- STEP 1: CAPTURE LEAD (Save to DB) ---
            // We do this immediately so we don't lose the lead if the AI step fails or user drops off.
            try {
                const leadPayload = {
                    name: contactData.name,
                    email: contactData.email,
                    phone: contactData.phone,
                    projectDescription: projectFormData?.description || "",
                    domain: projectFormData?.domain || "General",
                    country: projectFormData?.country || "",
                };

                // Send to backend (don't block heavily, but good to wait for 1s to ensure save)
                await fetch("/api/leads", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(leadPayload),
                });
                console.log("Lead captured successfully");

            } catch (leadError) {
                console.error("Lead capture failed (proceeding to analysis anyway):", leadError);
            }

            // --- STEP 2: GENERATE ANALYSIS (OpenAI) ---
            const formData = new FormData();
            formData.append("description", projectFormData?.description || "");
            formData.append("category", projectFormData?.domain || "General"); // Handle optional domain
            formData.append("country", projectFormData?.country || "");

            // Append contact info
            formData.append("contactName", contactData.name);
            formData.append("contactEmail", contactData.email);
            formData.append("contactPhone", contactData.phone); // Updated key

            if (projectFormData && projectFormData.file && projectFormData.file.length > 0) {
                formData.append("file", projectFormData.file[0]);
            }

            const response = await fetch("/api/analyze", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Analysis failed");
            }

            const analysisData = await response.json();

            // Log AI data as requested
            console.log("AI Proposal Data:", analysisData);

            // Store data for the analysis page to consume
            const fullReportData = {
                client: {
                    name: contactData.name,
                    email: contactData.email,
                    contact: contactData.phone,
                    country: projectFormData?.country,
                    flag: "🏳️", // Could implement mapping later
                    currency: "USD"
                },
                analysis: analysisData
            };

            sessionStorage.setItem("aiReportData", JSON.stringify(fullReportData));

            reset();
            router.push("/analysis");

        } catch (error) {
            console.error("Submission error:", error);
            alert("Something went wrong generating your analysis. Please try again.");
        } finally {
            setIsSubmitting(false);
            setIsContactModalOpen(false);
        }
    };

    return (
        <section id="project-form" className="relative flex items-start justify-center pb-16 w-full">

            {/* Contact Modal Integration */}
            <ContactModal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
                onSubmit={handleFinalSubmit}
                isSubmitting={isSubmitting}
            />

            <div className="container px-4 md:px-6 mx-auto w-full max-w-4xl">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="p-6 md:p-10 relative overflow-hidden max-w-4xl mx-auto bg-white backdrop-blur-xl border border-gray-100 shadow-2xl rounded-3xl"
                >
                    <form onSubmit={handleSubmit(onProjectSubmit)} className="space-y-8">

                        {/* 1. Project Description (Required) */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-baseline">
                                <label htmlFor="description" className="text-sm font-medium text-foreground">
                                    Project Description <span className="text-destructive">*</span>
                                </label>
                                <div className={`flex items-center gap-2 text-xs font-medium transition-colors duration-300 ${wordCount >= 500 ? 'text-green-600' : 'text-muted-foreground'}`}>
                                    {wordCount >= 500 && <CheckCircle2 className="w-3 h-3" />}
                                    {wordCount} words <span className="text-[10px] font-normal opacity-70">(min 500)</span>
                                </div>
                            </div>
                            <div className="relative">
                                <textarea
                                    suppressHydrationWarning
                                    {...register("description")}
                                    rows={8}
                                    placeholder="Tell us about your project in 500+ words... What are your goals? Who is the target audience? What features do you envision?"
                                    className="flex min-h-[200px] w-full rounded-xl border border-input/50 bg-white/80 p-4 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50 resize-y shadow-sm transition-all duration-300 hover:bg-white hover:border-primary/30"
                                />
                                <div className="absolute bottom-3 right-3 bg-secondary/50 px-2 py-0.5 rounded text-[10px] text-muted-foreground pointer-events-none border border-border/50">
                                    Markdown Supported
                                </div>
                            </div>

                            {errors.description && (
                                <p className="text-sm text-destructive flex items-center gap-1 font-medium animate-in slide-in-from-left-1">
                                    <AlertCircle className="w-4 h-4" /> {errors.description.message}
                                </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                * Detailed descriptions help us provide accurate estimates.
                            </p>
                        </div>

                        {/* 2 & 3. Domain (Optional) & Country (Required) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Project Domain */}
                            <div className="space-y-2">
                                <label htmlFor="domain" className="text-sm font-medium text-foreground">
                                    Project Domain <span className="text-muted-foreground font-normal ml-1">(Optional)</span>
                                </label>
                                <div className="relative group">
                                    <select
                                        suppressHydrationWarning
                                        {...register("domain")}
                                        className="flex h-12 w-full items-center justify-between rounded-xl border border-input/50 bg-white/80 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer shadow-sm transition-all duration-300 hover:bg-white hover:border-primary/30"
                                    >
                                        <option value="">Select Domain...</option>
                                        {PROJECT_DOMAINS.map((domain) => (
                                            <option key={domain} value={domain}>
                                                {domain}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 opacity-50 pointer-events-none" />
                                </div>
                                {errors.domain && (
                                    <p className="text-sm text-destructive flex items-center gap-1 font-medium animate-in slide-in-from-left-1">
                                        <AlertCircle className="w-4 h-4" /> {errors.domain.message}
                                    </p>
                                )}
                            </div>

                            {/* Country */}
                            <div className="space-y-2">
                                <label htmlFor="country" className="text-sm font-medium text-foreground">
                                    Country <span className="text-destructive">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter Country..."
                                    suppressHydrationWarning
                                    {...register("country")}
                                    className="flex h-12 w-full rounded-xl border border-input/50 bg-white/80 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm transition-all duration-300 hover:bg-white hover:border-primary/30"
                                />
                                {errors.country && (
                                    <p className="text-sm text-destructive flex items-center gap-1 font-medium animate-in slide-in-from-left-1">
                                        <AlertCircle className="w-4 h-4" /> {errors.country.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* 4. Project Proposal Upload (Optional) */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                Project Proposal PDF <span className="text-muted-foreground font-normal ml-1">(Optional)</span>
                            </label>
                            <label
                                htmlFor="file-upload"
                                className="group flex flex-col items-center justify-center w-full h-32 border border-dashed border-input/50 rounded-xl cursor-pointer bg-white/50 hover:bg-white transition-all duration-300 shadow-sm border-spacing-4 hover:border-primary/50"
                            >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4 space-y-2">
                                    <Upload className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                            Click to Upload or Drag & Drop
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            PDF, DOCX, or TXT
                                        </p>
                                    </div>
                                </div>
                                <input
                                    id="file-upload"
                                    type="file"
                                    className="hidden"
                                    {...register("file")}
                                />
                            </label>

                            {/* File Preview */}
                            {fileValue && fileValue.length > 0 && (
                                <div className="bg-white/80 border border-border rounded-xl p-3 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 mt-2 shadow-sm">
                                    <div className="bg-background p-1 rounded-full border border-border">
                                        <CheckCircle2 className="w-3 h-3 text-green-600" />
                                    </div>
                                    <span className="text-sm font-medium text-foreground truncate max-w-[200px]">{fileValue?.[0]?.name}</span>
                                </div>
                            )}

                            {errors.file && (
                                <p className="text-sm text-destructive flex items-center gap-1 font-medium animate-in slide-in-from-left-1">
                                    <AlertCircle className="w-4 h-4" /> {(errors.file?.message as string) || "File error"}
                                </p>
                            )}
                        </div>

                        {/* Action Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                suppressHydrationWarning
                                disabled={isSubmitting}
                                className="w-full inline-flex h-14 items-center justify-center rounded-full bg-gradient-to-r from-primary via-orange-500 to-red-500 px-8 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:opacity-90 hover:shadow-primary/25 hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                            >
                                Request Estimate
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </section>
    );
}
