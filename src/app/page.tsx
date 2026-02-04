"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  Play,
  Zap,
  Star,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Code2,
  Smartphone,
  Layers,
  Brain,
  Cloud,
  CheckCircle2,
  Shield,
  TrendingUp,
  Globe
} from 'lucide-react';
import ProjectForm from "@/components/ProjectForm";
import { section } from 'framer-motion/client';
import { WebDevIcon, MobileIcon, BlockchainIcon, AIIcon, SaasIcon } from "@/components/ServiceIcons";

// ============ UTILS & COMPONENTS ============

const FadeIn = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

const ServiceCard = ({ icon: Icon, title, description, delay }: { icon: React.ElementType; title: string; description: string, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="group relative h-full bg-white/50 backdrop-blur-lg border border-white/50 p-8 rounded-3xl hover:bg-white/80 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-2"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

    <div className="relative z-10">
      <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 text-white transform group-hover:rotate-6 transition-transform duration-500 shadow-lg shadow-orange-500/30">
        <Icon className="w-8 h-8" />
      </div>

      <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-600 leading-relaxed mb-6">{description}</p>

      {/* <div className="flex items-center text-orange-600 font-semibold cursor-pointer group/link">
        <span className="group-hover/link:underline">Explore Service</span>
        <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/link:translate-x-1" />
      </div> */}
    </div>
  </motion.div>
);

const TestimonialCard = ({ name, role, company, content, rating, image }: { name: string; role: string; company: string; content: string; rating: number; image?: string }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden"
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100/50 rounded-full blur-3xl -mr-16 -mt-16" />

    <div className="flex gap-1 mb-6 relative z-10">
      {[...Array(rating)].map((_, i) => (
        <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
      ))}
    </div>

    <p className="text-gray-700 text-lg leading-relaxed mb-8 relative z-10">"{content}"</p>

    <div className="flex items-center gap-4 relative z-10">
      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-800 to-gray-900 flex items-center justify-center text-white font-bold text-lg shadow-lg">
        {name.charAt(0)}
      </div>
      <div>
        <h4 className="font-bold text-gray-900">{name}</h4>
        <p className="text-sm text-gray-500">{role} @ {company}</p>
      </div>
    </div>
  </motion.div>
);

// ============ MAIN PAGE ============

export default function BudgetCalculatorFunnel() {
  const formRef = useRef<HTMLElement>(null);
  const [activeTab, setActiveTab] = useState(0);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const videoRef = useRef<HTMLVideoElement>(null);

  const handleWatchDemo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.muted = false;
      videoRef.current.play();
    }
  };

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const services = [
    {
      icon: WebDevIcon,
      title: 'Web & Software Development',
      description: 'At Talentronaut, we design dynamic and scalable digital solutions tailored to your business needs. Our expertise in modern tech stacks enables us to build robust web applications, APIs, and enterprise software that drive efficiency and growth.'
    },
    {
      icon: MobileIcon,
      title: 'Mobile App Development',
      description: 'Experience seamless connectivity with our native and cross-platform mobile app solutions for iOS and Android. We transform visionary concepts into engaging, high-performance applications that keep your audience connected on the go.'
    },
    {
      icon: BlockchainIcon,
      title: 'Blockchain & Web3 Solutions',
      description: 'Step into the future with our Blockchain & Web3 offerings. We develop secure smart contracts, decentralized applications, NFT platforms, and comprehensive blockchain integrations, empowering your business with enhanced transparency and trust.'
    },
    {
      icon: AIIcon,
      title: 'AI-driven Solutions',
      description: 'Harness the potential of intelligent technology with our AI-driven solutions. Leveraging machine learning, natural language processing, and computer vision, we create smart applications that enable data-driven decisions and streamline your operations.'
    },
    {
      icon: SaasIcon,
      title: 'SaaS Development',
      description: 'Reimagine your service delivery with our end-to-end SaaS development. We build cloud-based products with advanced subscription management and insightful user analytics, ensuring scalable solutions that evolve alongside your business.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'CTO',
      company: 'TechVentures',
      content: 'The budget estimate was within 5% of our final project cost. This tool saved us weeks of back-and-forth.',
      rating: 5
    },
    {
      name: 'Marcus Johnson',
      role: 'Founder',
      company: 'StartupLab',
      content: 'As a non-technical founder, understanding project costs was a mystery. Talentronaut made everything crystal clear.',
      rating: 5
    },
    {
      name: 'Elena Rodriguez',
      role: 'Product Lead',
      company: 'Innovate Inc',
      content: 'We use this for every new project now. The regional pricing insights alone have saved us thousands.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden selection:bg-orange-500/30 selection:text-orange-900">

      {/* ============ HERO SECTION ============ */}
      <section className="relative min-h-[85vh] flex items-center pt-10 pb-20 overflow-hidden">
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-purple-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-70 animate-blob" />
          <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-orange-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-70 animate-blob animation-delay-2000" />
          <div className="absolute bottom-[-20%] left-[20%] w-[800px] h-[800px] bg-pink-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-70 animate-blob animation-delay-4000" />
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-32 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left Content */}
            <motion.div
              style={{ y: heroY, opacity: heroOpacity }}
              className="max-w-3xl"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/50 shadow-sm mb-6"
              >
                <div className="relative h-6 w-6">
                  <Image
                    src="/images/newlogo.png"
                    alt="Talentronaut Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-sm font-semibold text-gray-800 tracking-wide uppercase">Talentronaut Estimation Engine</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-gray-900 leading-[1.1] mb-6 tracking-tight"
              >
                Turn Your Vision Into <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">
                  Engineered Reality.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-xl text-gray-600 mb-8 max-w-xl leading-relaxed"
              >
                Stop the guesswork. Talentronaut analyzes your requirements to provide precision-engineered budget breakdowns and development timelines in seconds.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-5"
              >
                <button suppressHydrationWarning
                  onClick={scrollToForm}
                  className="group relative px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-gray900/30 overflow-hidden hover:scale-105 transition-transform duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative flex items-center gap-3">
                    Start Calculation
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
                <button
                  onClick={handleWatchDemo}
                  suppressHydrationWarning
                  className="flex items-center justify-center gap-3 px-8 py-4 bg-white/50 backdrop-blur-sm border border-white/60 text-gray-800 rounded-2xl font-bold text-lg hover:bg-white transition-colors duration-300"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Watch Demo
                </button>
              </motion.div>

            </motion.div>

            {/* Right Visual - Demo Video */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative block mt-16 lg:mt-0"
            >
              <div className="relative z-10 w-full aspect-video max-w-lg mx-auto bg-gradient-to-tr from-gray-900 via-gray-800 to-black rounded-[2rem] p-3 shadow-2xl shadow-orange-900/20 border border-gray-700/50">
                {/* Video Container */}
                <div className="w-full h-full bg-slate-950 rounded-[1.5rem] overflow-hidden relative group">
                  <div className="absolute inset-0 bg-black/20 z-10 group-hover:bg-transparent transition-colors duration-300 pointer-events-none" />

                  {/* Placeholder Video - Replace src with actual demo video */}
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover cursor-pointer"
                    poster="/images/dashboard-preview.jpg"
                    muted
                    loop
                    playsInline
                    onClick={handleVideoClick}
                  >
                    <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>

                  {/* Play Button Overlay (Optional) */}
                  <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Play className="w-6 h-6 text-white fill-current ml-1" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-16 right-6 bg-white p-4 rounded-2xl shadow-xl z-20"
              >
                <TrendingUp className="w-8 h-8 text-green-500" />
              </motion.div>
              <motion.div
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl z-20"
              >
                <Shield className="w-8 h-8 text-blue-500" />
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="fill-white" viewBox="0 0 1440 100">
            <path d="M0,32L80,37.3C160,43,320,53,480,58.7C640,64,800,64,960,53.3C1120,43,1280,21,1360,10.7L1440,0L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {/* ============ SERVICES SECTION ============ */}
      <section className="pt-16 pb-32 relative bg-white overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-32 relative z-10">
          <FadeIn className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">World-Class Expertise</h2>
            <p className="text-xl text-gray-500">
              We combine cutting-edge technology with deep industry knowledge to deliver solutions that drive real growth.
            </p>
          </FadeIn>

          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-8 md:overflow-visible md:pb-0 no-scrollbar">
            {services.map((service, idx) => (
              <div key={idx} className="min-w-[85vw] sm:min-w-[45vw] snap-center md:min-w-0">
                <ServiceCard
                  {...service}
                  delay={idx * 0.1}
                />
              </div>
            ))}
          </div>
        </div>
        {/* Decorative Blobs */}
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50 -translate-x-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-50 translate-x-1/2" />
      </section>

      {/* ============ CALCULATOR SECTION ============ */}
      <section ref={formRef} className="py-24 relative">
        <div className="absolute inset-0 bg-slate-900">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-32 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-start">

            {/* Form Info Left */}
            <div className="lg:col-span-4 lg:sticky lg:top-32 text-white">
              <FadeIn>
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-8 shadow-2xl shadow-orange-500/20">
                  <div className="relative w-10 h-10">
                    <Image
                      src="/images/newlogo.png"
                      alt="Talentronaut Logo"
                      fill
                      className="object-contain brightness-0 invert"
                    />
                  </div>
                </div>
                <h2 className="text-4xl font-bold mb-6 text-white">
                  Let's Build Something <span className="text-orange-400">Extraordinary</span>
                </h2>
                <p className="text-lg text-orange-100 max-w-2xl mx-auto">
                  Fill in the details below. Talentronaut makes budget calculation easy for you.
                </p>
                <div className="space-y-6">
                  {[
                    "Instant Quote Generation",
                    "Detailed Phase Breakdown",
                    "Market Rate Comparison",
                    "Timeline Estimation"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 text-gray-300">
                      <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </FadeIn>
            </div>

            {/* Form Container Right */}
            <div className="lg:col-span-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-1 shadow-2xl"
              >
                <div className="bg-white rounded-[1.25rem] overflow-hidden pt-10">
                  <ProjectForm />
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS SECTION ============ */}
      <section className="py-32 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-32">
          <FadeIn className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Loved by Innovators</h2>
            <p className="text-lg text-gray-500">Join trusted companies building the future with us.</p>
          </FadeIn>

          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-8 md:overflow-visible md:pb-0 no-scrollbar">
            {testimonials.map((t, i) => (
              <div key={i} className="min-w-[85vw] sm:min-w-[45vw] snap-center md:min-w-0">
                <TestimonialCard {...t} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="bg-gray-900 text-white pt-24 pb-12 overflow-hidden relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-orange-600/20 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-32 relative z-10">
          <div className="flex flex-col items-center justify-center pb-8 border-b border-gray-800">
            <a
              href="https://www.talentronaut.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="relative h-10 w-10">
                <Image
                  src="/images/newlogo.png"
                  alt="Talentronaut Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="font-bold text-2xl tracking-tight">Talentronaut Technologies Pvt. Ltd.</span>
            </a>
          </div>

          <div className="pt-8 text-center text-gray-500 text-sm">
            <p>© 2026 Talentronaut. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}