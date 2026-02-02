"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Sparkles, BarChart3, PieChart, TrendingUp } from "lucide-react";

export default function HeroSection() {
    return (
        <section className="relative overflow-hidden flex flex-col items-center justify-center min-h-[50vh] md:min-h-[60vh] w-full pt-16 md:pt-24 pb-12">

            {/* Background Decorative Elements - Glassmorphism & Abstract Vectors */}
            {/* Background Decorative Elements Removed - Moved to page.tsx for global coverage */}


            <div className="container px-4 md:px-6 relative z-10 flex flex-col items-center justify-center flex-1">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut", staggerChildren: 0.2 }}
                    className="flex flex-col items-center text-center space-y-6 md:space-y-8 max-w-5xl mx-auto"
                >
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="inline-flex items-center rounded-full border border-primary/20 bg-background/80 backdrop-blur-md px-5 py-2 text-sm font-medium text-primary shadow-sm ring-1 ring-primary/10"
                    >
                        <div className="relative w-8 h-8 mr-3 rounded-full overflow-hidden bg-white shadow-sm border border-gray-100 flex items-center justify-center">
                            <Image
                                src="/images/logoimg.jpg"
                                alt="Talentronaut Logo"
                                fill
                                className="object-contain p-0.5"
                            />
                        </div>
                        <span className="font-bold text-lg tracking-tight text-primary">Talentronaut</span>
                    </motion.div>

                    {/* Heading */}
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground font-sans leading-[1.1] max-w-4xl"
                    >
                        <span className="block text-foreground">Turn Project Idea into</span>
                        <span className="bg-gradient-to-r from-primary via-orange-500 to-red-500 bg-clip-text text-transparent pb-2 block mt-1">
                            Structured Scope, Insights, & Cost Clarity.
                        </span>
                    </motion.h1>

                    {/* Description */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="max-w-[700px] text-muted-foreground text-lg sm:text-xl md:text-2xl/relaxed leading-relaxed font-light px-2"
                    >
                        At Talentronaut, we build robust web applications, APIs, and enterprise software that drive efficiency and growth.
                    </motion.p>

                    {/* Floating Abstract Icons (Visual Interest) */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 1 }}
                        className="absolute w-full h-full pointer-events-none hidden md:block max-w-6xl"
                    >
                        <motion.div
                            animate={{ y: [0, -20, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-[20%] left-[5%] text-slate-300 opacity-50"
                        >
                            <BarChart3 size={48} strokeWidth={1.5} />
                        </motion.div>
                        <motion.div
                            animate={{ y: [0, 20, 0] }}
                            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute bottom-[20%] right-[10%] text-slate-300 opacity-50"
                        >
                            <PieChart size={56} strokeWidth={1.5} />
                        </motion.div>
                        <motion.div
                            animate={{ y: [0, -15, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                            className="absolute top-[10%] right-[20%] text-slate-300 opacity-40"
                        >
                            <TrendingUp size={40} strokeWidth={1.5} />
                        </motion.div>
                    </motion.div>

                </motion.div>
            </div>
        </section>
    );
}
