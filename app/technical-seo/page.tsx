'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Sparkles, Gauge, ArrowLeft, ChevronRight, Loader2, Search, Globe } from 'lucide-react';
import LiveStatus from '@/components/LiveStatus';

const countries = [
  { code: 'us', name: 'United States', flag: '🇺🇸' },
  { code: 'gb', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'ca', name: 'Canada', flag: '🇨🇦' },
  { code: 'au', name: 'Australia', flag: '🇦🇺' },
  { code: 'de', name: 'Germany', flag: '🇩🇪' },
  { code: 'sg', name: 'Singapore', flag: '🇸🇬' },
  { code: 'sa', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'ae', name: 'UAE', flag: '🇦🇪' },
  { code: 'pk', name: 'Pakistan', flag: '🇵🇰' },
  { code: 'in', name: 'India', flag: '🇮🇳' },
  { code: 'tr', name: 'Turkey', flag: '🇹🇷' },
  { code: 'my', name: 'Malaysia', flag: '🇲🇾' },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://marketmuse-pro-backend-production.up.railway.app/api';

export default function TechnicalSEOPage() {
  const router = useRouter();
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [country, setCountry] = useState('us');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!websiteUrl.trim()) {
      toast.error('Please enter a website URL');
      return;
    }
    setLoading(true);

    try {
      // Note: Backend endpoint '/technical-seo' aapko banana hoga
      const res = await fetch(`${API_URL}/technical-seo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteUrl: websiteUrl.trim(), country }),
      });

      if (!res.ok) throw new Error('Failed to run technical audit');

      const report = await res.json();
      toast.success('Technical SEO audit completed successfully', { icon: '✅' });
      setTimeout(() => router.push(`/report/${report._id}`), 500);
    } catch (err: any) {
      toast.error(err.message || 'Audit failed', { icon: '❌' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white font-['Inter'] relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-indigo-600/20 blur-3xl pointer-events-none" />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-neutral-800/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">Muse<span className="text-indigo-400">PRO</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/history" className="text-sm text-neutral-400 hover:text-white">History</Link>
            <Link href="/seo-report" className="text-sm px-4 py-2 rounded-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700">SEO</Link>
            <Link href="/product-research" className="text-sm px-4 py-2 rounded-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700">Product</Link>
            <Link href="/technical-seo" className="text-sm px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 border border-indigo-600 text-white">Tech SEO</Link>
            <LiveStatus />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-6 py-16 relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white text-sm mb-6 transition-colors">
          <ArrowLeft size={16} /> Back
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <Gauge size={28} className="text-indigo-400" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">Technical SEO Audit</h1>
        </div>
        <p className="text-neutral-400 text-sm mb-8">
          Run comprehensive site health checks, Core Web Vitals, crawlability, schema validation, and mobile-friendliness.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* URL Input */}
          <div className="p-6 rounded-2xl bg-[#0F0F14] border border-neutral-800/50">
            <label className="block text-sm font-medium mb-2">Website URL / Domain</label>
            <div className="relative">
              <Globe size={18} className="absolute left-4 top-3.5 text-neutral-500" />
              <input
                type="text"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="e.g. https://example.com"
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-[#0A0A0A] border border-neutral-700 focus:border-indigo-500 outline-none text-white transition-colors placeholder:text-neutral-500"
                disabled={loading}
              />
            </div>
          </div>

          {/* Country Selection */}
          <div className="p-6 rounded-2xl bg-[#0F0F14] border border-neutral-800/50">
            <label className="block text-sm font-medium mb-3">Target Country</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {countries.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setCountry(c.code)}
                  className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl border transition-all ${
                    country === c.code
                      ? 'border-indigo-500 bg-indigo-500/10 text-white'
                      : 'border-neutral-800 bg-[#0A0A0A] hover:bg-neutral-800 text-neutral-400'
                  }`}
                  disabled={loading}
                >
                  <span className="text-xl">{c.flag}</span>
                  <span className="text-[10px] font-medium uppercase">{c.code}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !websiteUrl.trim()}
            className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Running Technical Audit...
              </>
            ) : (
              <>
                Run Technical Audit <ChevronRight size={20} />
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
