"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, AlertCircle, LockKeyhole, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const contactSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    phone: z.string().min(10, { message: "Please enter a valid Phone number." }),
});

export type ContactFormValues = z.infer<typeof contactSchema>;

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ContactFormValues) => void;
    isSubmitting: boolean;
    title?: string;
    description?: string;
    isSuccess?: boolean;
    successMessage?: string;
}

export default function ContactModal({
    isOpen,
    onClose,
    onSubmit,
    isSubmitting,
    title = "Your Project Report is ready to generate.",
    description = "Where should we send it?",
    isSuccess = false,
    successMessage = "Thank you for connecting! We will reach out to you soon."
}: ContactModalProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ContactFormValues>({
        resolver: zodResolver(contactSchema),
    });

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        {/* Modal */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-white/20 overflow-hidden relative"
                        >
                            {/* Header */}
                            <div className="p-6 md:p-8 pb-4 flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl md:text-2xl font-bold font-sans text-primary leading-tight">
                                        {isSuccess ? "Success!" : title}
                                    </h3>
                                    <p className="text-muted-foreground mt-2 text-sm md:text-base">
                                        {isSuccess ? "" : description}
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="rounded-full p-2 hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 md:p-8 pt-0">
                                {isSuccess ? (
                                    <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
                                            <CheckCircle2 className="w-8 h-8" />
                                        </div>
                                        <p className="text-lg font-medium text-foreground">
                                            {successMessage}
                                        </p>
                                        <button
                                            onClick={onClose}
                                            className="mt-4 px-6 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg transition-colors font-medium"
                                        >
                                            Close
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                                        {/* Name */}
                                        <div className="space-y-1.5">
                                            <label htmlFor="name" className="text-sm font-semibold text-foreground/80">
                                                Full Name
                                            </label>
                                            <input
                                                {...register("name")}
                                                type="text"
                                                placeholder="John Doe"
                                                className="flex h-12 w-full rounded-lg border border-input bg-background/50 px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                            />
                                            {errors.name && (
                                                <p className="text-xs text-destructive flex items-center gap-1 font-medium">
                                                    <AlertCircle className="w-3 h-3" /> {errors.name.message}
                                                </p>
                                            )}
                                        </div>

                                        {/* Phone */}
                                        <div className="space-y-1.5">
                                            <label htmlFor="phone" className="text-sm font-semibold text-foreground/80">
                                                Phone Number
                                            </label>
                                            <input
                                                {...register("phone")}
                                                type="tel"
                                                placeholder="+1 (555) 000-0000"
                                                className="flex h-12 w-full rounded-lg border border-input bg-background/50 px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                            />
                                            {errors.phone && (
                                                <p className="text-xs text-destructive flex items-center gap-1 font-medium">
                                                    <AlertCircle className="w-3 h-3" /> {errors.phone.message}
                                                </p>
                                            )}
                                        </div>

                                        {/* Email */}
                                        <div className="space-y-1.5">
                                            <label htmlFor="email" className="text-sm font-semibold text-foreground/80">
                                                Email Address
                                            </label>
                                            <input
                                                {...register("email")}
                                                type="email"
                                                placeholder="john@example.com"
                                                className="flex h-12 w-full rounded-lg border border-input bg-background/50 px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                            />
                                            {errors.email && (
                                                <p className="text-xs text-destructive flex items-center gap-1 font-medium">
                                                    <AlertCircle className="w-3 h-3" /> {errors.email.message}
                                                </p>
                                            )}
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full inline-flex h-12 items-center justify-center rounded-lg bg-primary text-base font-bold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none mt-2"
                                        >
                                            {isSubmitting ? (
                                                <span className="flex items-center gap-2">
                                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                    Processing...
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    Submit <LockKeyhole className="w-4 h-4 opacity-70" />
                                                </span>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

