"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "../context/ToastContext";
import api from "../lib/api";
import { Loader2, ArrowRight, Mail, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const { showToast } = useToast();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast("Please enter your email", "error");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/user/signIn", { email });
      showToast("OTP sent to your email", "success");
      setStep(2);
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to send OTP";
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      showToast("Please enter a valid OTP", "error");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/user/verifyOtp", { email, otp });
      showToast("Successfully signed in", "success");
      router.push("/dashboard");
    } catch (error: any) {
      const message = error.response?.data?.message || "Invalid OTP";
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans selection:bg-blue-100">
      {/* Left pane - Sign In Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 md:px-24 lg:px-32 max-w-2xl w-full relative z-10 bg-white shadow-[20px_0_40px_rgba(0,0,0,0.02)]">
        
        <Link href="/" className="absolute top-8 left-8 sm:top-12 sm:left-12 flex items-center gap-3 group">
          <div className="relative w-8 h-8 group-hover:scale-110 transition-transform">
            <img src="/logo.webp" alt="EvoGlobal Insight" className="w-8 h-8 object-contain" />
          </div>
          <span className="font-bold text-slate-800 text-xl tracking-tight">EvoGlobal Insight</span>
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm mx-auto mt-20"
        >
          <div className="mb-10">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
              {step === 1 ? "Welcome back" : "Verify your email"}
            </h1>
            <p className="text-slate-500 font-medium">
              {step === 1 ? "Enter your work email to access your dashboard." : `We sent a code to ${email}`}
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleRequestOtp} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700">Email address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 placeholder:text-slate-400"
                    placeholder="name@company.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 group shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Continue with Email <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="otp" className="block text-sm font-semibold text-slate-700">Verification Code</label>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Wrong email?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ShieldCheck className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 tracking-widest text-lg font-medium"
                    placeholder="000000"
                    required
                    maxLength={6}
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify and Sign In"}
              </button>
            </form>
          )}

          <div className="mt-10 text-center">
            <p className="text-sm text-slate-500">
              By continuing, you agree to our <a href="#" className="font-medium text-slate-700 hover:text-blue-600 underline underline-offset-4">Terms of Service</a> and <a href="#" className="font-medium text-slate-700 hover:text-blue-600 underline underline-offset-4">Privacy Policy</a>.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right pane - Aesthetic Background */}
      <div className="hidden lg:flex flex-1 relative bg-slate-50 items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-slate-50 to-slate-100 opacity-80" />
        
        {/* Abstract shapes */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-indigo-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-teal-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />

        <div className="relative z-10 max-w-lg p-12 backdrop-blur-sm bg-white/30 border border-white/40 rounded-3xl shadow-2xl">
          <div className="flex gap-4 mb-8">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4 leading-snug">
            "EvoGlobal Insight handles millions of redirects flawlessly. The analytics are instantaneous."
          </h2>
          <div className="flex items-center gap-4 mt-8">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xl shadow-inner">
              JD
            </div>
            <div>
              <p className="font-bold text-slate-900">Jane Doe</p>
              <p className="text-sm text-slate-600 font-medium">Head of Research, DataCorp</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
