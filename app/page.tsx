"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Users, Mail, Sparkles, Search, MapPin, TrendingUp, ArrowRight } from "lucide-react";
import CountryBarChart from "@/components/dashboard/CountryBarChart";
import WorldHeatMap from "@/components/dashboard/WorldHeatMap";
import StatusIndicator from "@/components/dashboard/StatusIndicator";
import LeadQualityBar from "@/components/dashboard/LeadQualityBar";
import RecentActivity from "@/components/dashboard/RecentActivity";
import ExportMenu from "@/components/ui/export-menu";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardLayout from "@/components/DashboardLayout";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://leadconnect-pro-backend-production-0edb.up.railway.app/api";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subtext?: string;
  gradient: string;
  trend?: string;
}

function StatCard({ icon: Icon, label, value, subtext, gradient, trend }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-card border border-border p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all"
    >
      <div className={`absolute -right-6 -top-6 w-28 h-28 rounded-full opacity-10 bg-gradient-to-br ${gradient}`} />
      <div className="flex items-start justify-between relative">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
          {subtext && <p className="text-xs text-muted-foreground pt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1 text-xs font-medium text-emerald-600">
          <TrendingUp className="h-3 w-3" />
          {trend}
        </div>
      )}
    </motion.div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({ totalLeads: 0, emailsFound: 0 });
  const [countryData, setCountryData] = useState<any[]>([]);
  const [geoData, setGeoData] = useState<any>({});
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [statsRes, countryRes, geoRes, leadsRes] = await Promise.all([
        fetch(`${API}/dashboard/stats`).then((r) => r.json()),
        fetch(`${API}/dashboard/country-stats`).then((r) => r.json()),
        fetch(`${API}/dashboard/geo-data`).then((r) => r.json()),
        fetch(`${API}/leads`).then((r) => r.json()),
      ]);
      setStats({
        totalLeads: statsRes?.totalLeads || 0,
        emailsFound: statsRes?.emailsFound || 0,
      });
      setCountryData(Array.isArray(countryRes) ? countryRes : []);
      setGeoData(geoRes || {});
      setLeads(Array.isArray(leadsRes) ? leadsRes : []);
    } catch (e) {
      console.error("Dashboard load error:", e);
    }
    setLoading(false);
  };

  const content = loading ? (
    <div className="space-y-8">
      <Skeleton className="h-24 w-full rounded-2xl" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  ) : (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      {/* ═══════════ HEADER ═══════════ */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              {getGreeting()} <span className="inline-block">👋</span>
            </h1>
            <StatusIndicator />
          </div>
          <p className="text-sm text-muted-foreground">
            Your leads at a glance — updated live as you grow.
          </p>
        </div>
        <Link
          href="/finder"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition shadow-lg shadow-primary/20"
        >
          <Search className="h-4 w-4" />
          Find Leads
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* ═══════════ STAT CARDS ═══════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={Users}
          label="Total Leads"
          value={stats.totalLeads}
          subtext="In your pipeline"
          gradient="from-indigo-500 to-indigo-600"
        />
        <StatCard
          icon={Mail}
          label="Emails Found"
          value={stats.emailsFound}
          subtext="Verified contacts"
          gradient="from-emerald-500 to-emerald-600"
        />
        <StatCard
          icon={Sparkles}
          label="Lead Quality"
          value="28%"
          subtext="Outreach-ready score"
          gradient="from-amber-500 to-orange-600"
        />
      </div>

      {/* ═══════════ QUICK ACTIONS (ADVANCED) ═══════════ */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/finder"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700 p-6 text-white hover:shadow-xl hover:shadow-indigo-500/20 transition-all hover:-translate-y-0.5"
          >
            <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10 group-hover:bg-white/15 transition-colors" />
            <div className="absolute -right-2 -bottom-8 w-24 h-24 rounded-full bg-white/5" />
            <div className="relative">
              <div className="inline-flex p-2.5 rounded-xl bg-white/15 mb-3">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold">Find New Leads</h3>
              <p className="text-sm text-white/85 mt-1 max-w-[90%]">
                Discover verified business and consumer prospects by niche and country.
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-white/95 group-hover:gap-2.5 transition-all">
                Get started <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </Link>

          <Link
            href="/local-insights"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 p-6 text-white hover:shadow-xl hover:shadow-emerald-500/20 transition-all hover:-translate-y-0.5"
          >
            <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10 group-hover:bg-white/15 transition-colors" />
            <div className="absolute -right-2 -bottom-8 w-24 h-24 rounded-full bg-white/5" />
            <div className="relative">
              <div className="inline-flex p-2.5 rounded-xl bg-white/15 mb-3">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold">Local Insights</h3>
              <p className="text-sm text-white/85 mt-1 max-w-[90%]">
                Find local businesses on Google Maps with verified contact details.
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-white/95 group-hover:gap-2.5 transition-all">
                Explore now <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* ═══════════ CHARTS ═══════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CountryBarChart data={countryData} />
        <LeadQualityBar />
      </div>

      {/* ═══════════ ACTIVITY + EXPORT ═══════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900/50 p-6 flex flex-col items-center justify-center gap-3 text-center">
          <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-950/50">
            <Sparkles className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Export All Leads</p>
            <p className="text-xs text-muted-foreground mt-1">{leads.length} leads available</p>
          </div>
          <ExportMenu data={leads} filename="all-leads" />
        </div>
      </div>

      {/* ═══════════ WORLD MAP ═══════════ */}
      <WorldHeatMap data={geoData} />
    </motion.div>
  );

  return <DashboardLayout>{content}</DashboardLayout>;
}
