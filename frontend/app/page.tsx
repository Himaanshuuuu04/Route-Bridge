import Link from "next/link";
import { ArrowRight, BarChart3, Zap, Shield, LayoutDashboard } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      {/* Navigation */}
      <nav className="w-full flex items-center justify-between px-6 py-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-zinc-900 dark:bg-zinc-100 rounded-lg flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-white dark:text-zinc-900" />
          </div>
          <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">SurveyRouter</span>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href="/signin" 
            className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            Sign in
          </Link>
          <Link 
            href="/signup" 
            className="text-sm font-medium px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 rounded-full hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 md:py-32 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="flex w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">v1.0 is now live</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 mb-6 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-150 fill-mode-both">
          Intelligent routing for your <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-500 to-zinc-900 dark:from-zinc-400 dark:to-zinc-100">surveys.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 mb-10 max-w-2xl animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300 fill-mode-both">
          Capture, analyze, and redirect survey respondents seamlessly. Experience unparalleled insights wrapped in a stunningly minimalist interface.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-7 duration-700 delay-500 fill-mode-both">
          <Link 
            href="/signup" 
            className="w-full sm:w-auto px-8 py-3.5 bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 rounded-full font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 group"
          >
            Start Routing Free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link 
            href="/dashboard" 
            className="w-full sm:w-auto px-8 py-3.5 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 border border-zinc-200 dark:border-zinc-800 rounded-full font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all flex items-center justify-center"
          >
            View Dashboard
          </Link>
        </div>
      </main>

      {/* Features Section */}
      <section className="bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Everything you need, nothing you don't.</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mt-4">Built for speed, reliability, and unparalleled aesthetics.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <FeatureCard 
              icon={<Zap className="w-6 h-6" />}
              title="Lightning Fast Webhooks"
              description="Process thousands of callbacks per second with our optimized Node.js backend architecture."
            />
            <FeatureCard 
              icon={<BarChart3 className="w-6 h-6" />}
              title="Deep Analytics"
              description="Visualize complete, terminated, and quota-full responses instantly on your monochromatic dashboard."
            />
            <FeatureCard 
              icon={<Shield className="w-6 h-6" />}
              title="Secure by Design"
              description="Robust OTP-based authentication ensures your data remains visible only to you."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8 px-6 text-center">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          © {new Date().getFullYear()} SurveyRouter. Designed with absolute minimalism.
        </p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:shadow-lg transition-shadow">
      <div className="w-12 h-12 bg-white dark:bg-zinc-900 rounded-xl flex items-center justify-center text-zinc-900 dark:text-zinc-100 shadow-sm mb-6 border border-zinc-200 dark:border-zinc-800">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">{title}</h3>
      <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">{description}</p>
    </div>
  );
}
