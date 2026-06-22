"use client";

import { use, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import api from "../../lib/api";

type ScreenerConfig = Record<string, string | number>;

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
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
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
          setConfig(res.data.eligibilityRules);
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

  if (loading && !config) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-slate-100 p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Survey Qualification</h1>
          <p className="text-slate-500 mt-2 text-sm">Please answer a few questions to see if you qualify.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        {!error && config && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {Object.keys(config).map((key) => (
              <div key={key} className="space-y-2">
                <label className="text-sm font-medium text-slate-900 capitalize">
                  {key}
                </label>
                <input
                  type={key === 'age' ? 'number' : 'text'}
                  required
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  onChange={e => setAnswers({ ...answers, [key]: key === 'age' ? Number(e.target.value) : e.target.value })}
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white rounded-md py-2.5 text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Continue to Survey"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
