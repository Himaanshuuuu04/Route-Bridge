"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, Zap, Shield, LayoutDashboard, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#09090b] text-zinc-50 overflow-hidden font-sans selection:bg-emerald-500/30">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-screen overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px]" />
      </div>

      {/* Navigation */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full fixed top-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl"
      >
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">SurveyRouter</span>
          </div>
          <div className="flex items-center gap-6">
            <Link 
              href="/signin" 
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link 
              href="/signup" 
              className="text-sm font-medium px-5 py-2.5 bg-white text-black rounded-full hover:bg-zinc-200 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              Get Started
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-40 pb-20 md:py-48 max-w-5xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md"
        >
          <span className="flex w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
          <span className="text-xs font-semibold tracking-wide text-zinc-300 uppercase">v2.0 is now live</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 leading-[1.1]"
        >
          Intelligent routing <br />
          for your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-indigo-400">surveys.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg md:text-2xl text-zinc-400 mb-12 max-w-3xl leading-relaxed font-medium"
        >
          Capture, analyze, and redirect survey respondents seamlessly. Experience unparalleled insights wrapped in a stunningly premium interface.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <Link 
            href="/signup" 
            className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black rounded-full font-bold transition-all flex items-center justify-center gap-2 group hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]"
          >
            Start Routing Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link 
            href="/dashboard" 
            className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white rounded-full font-semibold hover:bg-white/10 transition-all flex items-center justify-center group backdrop-blur-sm"
          >
            View Dashboard
            <ChevronRight className="w-5 h-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all ml-1" />
          </Link>
        </motion.div>
      </main>

      {/* Features Section */}
      <section className="relative py-32 px-6 border-t border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold tracking-tight text-white"
            >
              Everything you need,<br />nothing you don't.
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-zinc-400 mt-6"
            >
              Built for speed, reliability, and unparalleled aesthetics.
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Zap className="w-8 h-8 text-emerald-400" />}
              title="Lightning Fast"
              description="Process thousands of callbacks per second with our highly optimized, globally distributed architecture."
              delay={0.1}
            />
            <FeatureCard 
              icon={<BarChart3 className="w-8 h-8 text-indigo-400" />}
              title="Deep Analytics"
              description="Visualize complete, terminated, and quota-full responses instantly on your premium dashboard."
              delay={0.2}
            />
            <FeatureCard 
              icon={<Shield className="w-8 h-8 text-teal-400" />}
              title="Secure by Design"
              description="Robust end-to-end encryption ensures your respondent data remains strictly confidential."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-zinc-500" />
            <span className="font-bold text-zinc-400">SurveyRouter</span>
          </div>
          <p className="text-sm text-zinc-500 font-medium">
            © {new Date().getFullYear()} SurveyRouter. Crafted with precision.
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
      className="flex flex-col p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-colors group"
    >
      <div className="w-16 h-16 bg-black/50 rounded-2xl flex items-center justify-center mb-8 border border-white/5 group-hover:scale-110 transition-transform duration-500">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
      <p className="text-zinc-400 leading-relaxed text-lg">{description}</p>
    </motion.div>
  );
}
