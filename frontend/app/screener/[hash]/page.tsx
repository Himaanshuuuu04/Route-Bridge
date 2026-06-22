"use client";

import { use, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ShieldCheck, ChevronRight, AlertCircle, Loader2 } from "lucide-react";
import api from "../../lib/api";

interface EligibilityRule {
  question: string;
  options: string[];
  acceptedAnswers: string[];
}

type ScreenerConfig = EligibilityRule[];

interface AxiosErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export default function ScreenerPage({ params }: { params: Promise<{ hash: string }> }) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const vendor_rid = searchParams.get('vendor_rid');

  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<ScreenerConfig | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem(`screener_token_${resolvedParams.hash}`);
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // Fetch GET /api/screener/config/:hash
    api.get(`/api/screener/config/${resolvedParams.hash}`, { headers })
      .then(res => {
        if (res.data.status === 'rejected') {
          setError(res.data.message || "Sorry, you do not qualify for this survey.");
          setLoading(false);
        } else if (res.data.status === 'qualified' && res.data.redirectUrl) {
          // If the user already qualified and is visiting again, forward them
          window.location.href = res.data.redirectUrl;
        } else {
          setConfig(res.data.eligibilityRules || []);
          setLoading(false);
        }
      })
      .catch(err => {
        const errorMsg = err && typeof err === 'object' && 'response' in err
          ? (err as AxiosErrorResponse).response?.data?.message
          : null;
        setError(errorMsg || "Failed to load screener");
        setLoading(false);
      });
  }, [resolvedParams.hash]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post(`/api/screener/submit`, {
        hash: resolvedParams.hash,
        vendor_rid,
        answers
      });

      if (res.data.token) {
        localStorage.setItem(`screener_token_${resolvedParams.hash}`, res.data.token);
      }

      if (res.data.status === 'qualified') {
        window.location.href = res.data.redirectUrl;
      } else {
        setError("Sorry, you do not qualify for this survey.");
      }
    } catch (err: unknown) {
      const errorMsg = err && typeof err === 'object' && 'response' in err
        ? (err as AxiosErrorResponse).response?.data?.message
        : null;
      setError(errorMsg || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !config) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center space-y-6">
          <div className="animate-pulse">
            <img src="https://i.postimg.cc/KvwKr1L2/full-logo.webp" alt="EvoGlobalinsight Logo" className="h-22 mx-auto object-contain" />
          </div>
          <div className="flex flex-col items-center space-y-3">
            <Loader2 className="w-8 h-8 text-slate-900 animate-spin" />
            <p className="text-slate-500 text-sm font-medium">Securing connection and loading survey...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-slate-100 flex flex-col items-center justify-center p-4 sm:p-8 font-sans antialiased text-slate-800">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Company Branding Header */}
        <div className="flex flex-col items-center justify-center pt-8 pb-6 border-b border-slate-100 bg-slate-50/50 px-6 sm:px-10">
          <img 
            src="https://i.postimg.cc/KvwKr1L2/full-logo.webp" 
            alt="EvoGlobalinsight Logo" 
            className="h-22 w-auto object-contain max-w-[280px]"
          />
         
        </div>

        <div className="p-6 sm:p-10">
          {error ? (
            <div className="text-center py-6 px-4 space-y-5">
              <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-900">Survey Qualification Status</h2>
                <p className="text-slate-600 text-sm sm:text-base max-w-sm mx-auto leading-relaxed">
                  {error}
                </p>
              </div>
              <div className="pt-6 border-t border-slate-100 flex flex-col gap-2">
                <p className="text-xs text-slate-400">
                  Thank you for your time. EvoGlobalinsight requires specific profiles for each survey.
                </p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-2 text-xs font-semibold text-slate-900 hover:text-slate-700 underline underline-offset-4 cursor-pointer"
                >
                  Reload Page
                </button>
              </div>
            </div>
          ) : config && config.length === 0 ? (
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <ShieldCheck className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-900">Pre-Qualified for Study</h2>
                <p className="text-slate-500 text-sm sm:text-base max-w-sm mx-auto leading-relaxed">
                  You are eligible to participate in this study. Click the button below to proceed to the survey.
                </p>
              </div>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-slate-900 text-white rounded-xl py-4 text-sm font-semibold hover:bg-slate-800 active:scale-[0.99] transition-all duration-200 disabled:opacity-50 shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Redirecting...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to Survey</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          ) : config && config.length > 0 ? (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Survey Qualification</h1>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Please answer these quick eligibility questions to proceed to the main study.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 pt-2">
                {config.map((rule, index) => (
                  <div key={index} className="space-y-4 bg-slate-50/40 p-5 rounded-2xl border border-slate-100/80 shadow-sm/5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Question {index + 1} of {config.length}
                      </span>
                    </div>
                    <label className="block text-base font-semibold text-slate-900 leading-snug">
                      {rule.question}
                    </label>
                    <div className="space-y-2.5">
                      {rule.options.map((opt, optIdx) => {
                        const isSelected = answers[rule.question] === opt;
                        return (
                          <label 
                            key={optIdx} 
                            className={`flex items-center p-3.5 border rounded-xl cursor-pointer transition-all duration-200 ${
                              isSelected 
                                ? 'border-slate-900 bg-white ring-1 ring-slate-900 shadow-sm' 
                                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                            }`}
                          >
                            <div className="relative flex items-center justify-center">
                              <input
                                type="radio"
                                name={rule.question}
                                value={opt}
                                checked={isSelected}
                                onChange={(e) => setAnswers({ ...answers, [rule.question]: e.target.value })}
                                className="sr-only"
                                required
                              />
                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-150 ${
                                isSelected ? 'border-slate-950 bg-slate-950 ring-2 ring-slate-950/15' : 'border-slate-300 bg-white'
                              }`}>
                                <div className={`w-2 h-2 rounded-full bg-white transition-transform duration-150 ${
                                  isSelected ? 'scale-100' : 'scale-0'
                                }`} />
                              </div>
                            </div>
                            <span className={`ml-3 text-sm sm:text-base font-medium transition-colors ${
                              isSelected ? 'text-slate-900' : 'text-slate-600'
                            }`}>
                              {opt}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 text-white rounded-xl py-4 text-sm font-semibold hover:bg-slate-800 active:scale-[0.99] transition-all duration-200 disabled:opacity-50 shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 cursor-pointer mt-8"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue to Survey</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : null}
        </div>
      </div>

      {/* Branded Footer */}
      <footer className="w-full max-w-xl text-center space-y-4 px-4 mt-6">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-slate-400 text-xs">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Secure Connection
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> GDPR Compliant
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Confidential & Anonymous
          </span>
        </div>

        <div className="text-[11px] text-slate-400/80 leading-relaxed max-w-md mx-auto">
          EvoGlobalinsight conducts professional demographic research to match participants with corporate research projects. We value and secure your data.
        </div>

        <div className="flex items-center justify-center gap-4 text-[11px] font-semibold text-slate-500">
          <a href="#" className="hover:text-slate-800 transition-colors">Privacy Policy</a>
          <span className="text-slate-300">•</span>
          <a href="#" className="hover:text-slate-800 transition-colors">Terms of Service</a>
          <span className="text-slate-300">•</span>
          <a href="#" className="hover:text-slate-800 transition-colors">Contact Support</a>
        </div>

        <div className="text-[10px] text-slate-400 tracking-wider uppercase font-bold">
          © {new Date().getFullYear()} EvoGlobalinsight. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

