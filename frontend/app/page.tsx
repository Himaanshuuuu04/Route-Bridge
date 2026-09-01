"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, Zap, Shield, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans selection:bg-blue-100">
      {/* Background gradients for light theme */}
      <div className="absolute top-0 left-0 w-full h-[800px] overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-100/60 blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-100/60 blur-[120px]" />
      </div>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 md:py-32 max-w-5xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 mb-8 shadow-sm"
        >
          <span className="flex w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
          <span className="text-xs font-semibold tracking-wide text-slate-600 uppercase">v2.0 is now live</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.15] text-slate-900"
        >
          Intelligent routing <br />
          for your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">surveys.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg md:text-xl text-slate-600 mb-12 max-w-3xl leading-relaxed font-medium"
        >
          Capture, analyze, and redirect survey respondents seamlessly. Experience unparalleled insights wrapped in a stunningly clean, enterprise-grade interface.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <Link 
            href="/signin" 
            className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition-all flex items-center justify-center gap-2 group shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            Get Started
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link 
            href="/dashboard" 
            className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-full font-semibold hover:bg-slate-50 transition-all flex items-center justify-center group shadow-sm hover:shadow"
          >
            View Dashboard
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all ml-1" />
          </Link>
        </motion.div>
      </main>

      {/* Features Section */}
      <section className="relative py-32 px-6 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900"
            >
              Everything you need,<br />designed for clarity.
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-slate-500 mt-6 max-w-2xl mx-auto"
            >
              Built for speed, reliability, and unparalleled aesthetics inspired by the world's best enterprise software.
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Zap className="w-7 h-7 text-blue-600" />}
              title="Lightning Fast"
              description="Process thousands of callbacks per second with our highly optimized, globally distributed architecture."
              delay={0.1}
            />
            <FeatureCard 
              icon={<BarChart3 className="w-7 h-7 text-indigo-600" />}
              title="Deep Analytics"
              description="Visualize complete, terminated, and quota-full responses instantly on your clean dashboard."
              delay={0.2}
            />
            <FeatureCard 
              icon={<Shield className="w-7 h-7 text-teal-600" />}
              title="Secure by Design"
              description="Robust end-to-end encryption ensures your respondent data remains strictly confidential."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <img src="/logo.webp" alt="EvoGlobal Insight" className="w-8 h-8 object-contain" />
            <span className="font-bold text-slate-800 text-lg">EvoGlobal Insight</span>
          </div>
          <p className="text-sm text-slate-500 font-medium">
            © {new Date().getFullYear()} EvoGlobal Insight. Enterprise Grade Quality.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, delay }}
      whileHover={{ y: -5 }}
      className="flex flex-col p-8 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group"
    >
      <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </motion.div>
  );
}
