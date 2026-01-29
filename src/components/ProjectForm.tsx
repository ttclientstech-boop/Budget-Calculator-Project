"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Upload, CheckCircle2, AlertCircle } from "lucide-react";
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
        .refine((val) => val.trim().split(/\s+/).length >= 50, {
            message: "Description must be at least 50 words.",
        }),

    category: z.string().optional(),
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

const SERVICES = [
    "AI & Next-Gen Tech",
    "Web & Software Development",
    "Mobile App Development",
    "Blockchain & Web3",
    "Automation",
    "Recruitment Services",
];

export default function ProjectForm() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    // const [isSuccess, setIsSuccess] = useState(false); // Removed in favor of redirect

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

    const descriptionValue = watch("description") || "";
    const wordCount = descriptionValue.trim().split(/\s+/).filter((w) => w.length > 0).length;

    const onProjectSubmit = (data: FormValues) => {
        // Step 1: Save data and open modal
        setProjectFormData(data);
        setIsContactModalOpen(true);
    };

    const handleFinalSubmit = async (contactData: ContactFormValues) => {
        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append("description", projectFormData?.description || "");
            formData.append("category", projectFormData?.category || "");
            formData.append("country", projectFormData?.country || "");

            // Append contact info as JSON string or individual fields depending on how updated API wants it.
            // The API mainly needs description/file for analysis, but we might want to log who asked.
            formData.append("contactName", contactData.name);
            formData.append("contactEmail", contactData.email);

            if (projectFormData?.file && projectFormData.file.length > 0) {
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

            // Store data for the analysis page to consume
            // Combine the AI analysis with the client details for the report
            const fullReportData = {
                client: {
                    name: contactData.name,
                    email: contactData.email,
                    contact: contactData.whatsapp,
                    country: projectFormData?.country,
                    // Basic flag mapping or default
                    flag: "🏳️",
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
        <section className="bg-background relative flex items-start justify-center pt-4 md:pt-8 pb-20 w-full">

            {/* Contact Modal */}
            <ContactModal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
                onSubmit={handleFinalSubmit}
                isSubmitting={isSubmitting}
            />

            <div className="container px-4 md:px-6 mx-auto w-full max-w-[95vw] lg:max-w-7xl h-full flex flex-col justify-center">

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="bg-card rounded-[3rem] shadow-2xl p-8 md:p-16 lg:p-20 border border-white/50 relative overflow-hidden w-full"
                >
                    {/* Decorative gradients */}
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                    {/* Merged Header Inside Card */}
                    <div className="text-center mb-12 relative z-10">
                        <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl font-serif text-primary">
                            Start Your Project
                        </h2>
                        <p className="mt-4 text-muted-foreground text-xl max-w-2xl mx-auto font-light">
                            Tell us about your next big idea. We're ready to bring it to life with our expert team.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onProjectSubmit)} className="space-y-10 relative z-10">

                        {/* Project Description */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-baseline">
                                <label htmlFor="description" className="text-base font-semibold text-foreground/80">
                                    Project Description
                                </label>
                                <span className={`text-sm font-medium ${wordCount < 500 ? 'text-muted-foreground' : 'text-green-600'}`}>
                                    {wordCount} / 500 words
                                </span>
                            </div>
                            <textarea
                                suppressHydrationWarning
                                {...register("description")}
                                rows={8}
                                placeholder="Describe your project requirements, goals, and target audience in detail..."
                                className="flex min-h-[200px] w-full rounded-xl border-2 border-transparent bg-secondary/30 px-5 py-4 text-base ring-offset-background placeholder:text-muted-foreground focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50 resize-y transition-all duration-300 hover:bg-secondary/50"
                            />
                            {errors.description && (
                                <p className="text-sm text-destructive flex items-center gap-1 font-medium animate-in slide-in-from-left-1">
                                    <AlertCircle className="w-4 h-4" /> {errors.description.message}
                                </p>
                            )}
                        </div>


                        {/* Category & Country Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-3">
                                <label htmlFor="category" className="text-base font-semibold text-foreground/80">
                                    Service Category <span className="text-sm font-normal text-muted-foreground">(Optional)</span>
                                </label>
                                <div className="relative group">
                                    <select
                                        suppressHydrationWarning
                                        {...register("category")}
                                        className="flex h-14 w-full items-center justify-between rounded-xl border-2 border-transparent bg-secondary/30 px-4 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50 appearance-none transition-all duration-300 hover:bg-secondary/50"
                                    >
                                        <option value="">Select a service...</option>
                                        {SERVICES.map((service) => (
                                            <option key={service} value={service}>
                                                {service}
                                            </option>
                                        ))}
                                    </select>
                                    {/* Custom Arrow */}
                                    <div className="absolute right-4 top-4 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                    </div>
                                </div>
                                {errors.category && (
                                    <p className="text-sm text-destructive flex items-center gap-1 font-medium animate-in slide-in-from-left-1">
                                        <AlertCircle className="w-4 h-4" /> {errors.category.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-3">
                                <label htmlFor="country" className="text-base font-semibold text-foreground/80">
                                    Country
                                </label>
                                <input
                                    suppressHydrationWarning
                                    {...register("country")}
                                    type="text"
                                    placeholder="e.g. United States"
                                    className="flex h-14 w-full rounded-xl border-2 border-transparent bg-secondary/30 px-4 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 hover:bg-secondary/50"
                                />
                                {errors.country && (
                                    <p className="text-sm text-destructive flex items-center gap-1 font-medium animate-in slide-in-from-left-1">
                                        <AlertCircle className="w-4 h-4" /> {errors.country.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* File Upload */}
                        <div className="space-y-3">
                            <label className="text-base font-semibold text-foreground/80">
                                Project Document <span className="text-sm font-normal text-muted-foreground">(Optional)</span>
                            </label>
                            <div className="flex items-center justify-center w-full">
                                <label
                                    htmlFor="file-upload"
                                    className="group flex flex-col items-center justify-center w-full h-40 border-3 border-dashed rounded-2xl cursor-pointer bg-secondary/10 border-input/50 hover:bg-secondary/20 hover:border-primary/50 transition-all duration-300"
                                >
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                                        <div className="p-3 bg-background rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform duration-300">
                                            <Upload className="w-6 h-6 text-primary" />
                                        </div>
                                        <p className="mb-2 text-base font-medium text-foreground/80">
                                            <span className="text-primary font-bold hover:underline">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            PDF, DOCX, or TXT (MAX. 5MB)
                                        </p>
                                    </div>
                                    <input
                                        id="file-upload"
                                        type="file"
                                        className="hidden"
                                        {...register("file")}
                                    />
                                </label>
                            </div>

                            {watch("file") && watch("file").length > 0 && (
                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-lg p-3 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                    <div className="bg-green-100 dark:bg-green-900 p-1.5 rounded-full">
                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                    </div>
                                    <span className="text-sm font-medium text-foreground">{watch("file")?.[0]?.name}</span>
                                </div>
                            )}

                            {errors.file && (
                                <p className="text-sm text-destructive flex items-center gap-1 font-medium animate-in slide-in-from-left-1">
                                    <AlertCircle className="w-4 h-4" /> {(errors.file?.message as string) || "File error"}
                                </p>
                            )}
                        </div>

                        <div className="pt-8">
                            <button
                                type="submit"
                                suppressHydrationWarning
                                disabled={isSubmitting} // NOTE: isSubmitting controls the modal submit state, so here we might not need to disable if we aren't submitting yet? 
                                // actually, onProjectSubmit is synchronous, so we don't need a loading state on this button anymore unless we want to simulate pre-processing.
                                className="w-full inline-flex h-14 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground shadow-xl transition-all hover:bg-primary/90 hover:scale-[1.01] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                            >
                                Proceed to Contact
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </section>
    );
}
