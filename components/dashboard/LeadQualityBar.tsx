"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, AlertCircle, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function LeadQualityBar() {
  const [stats, setStats] = useState({ total: 0, withEmail: 0, withPhone: 0, withBoth: 0 });

  useEffect(() => {
    fetch(`${API}/leads`).then(r => r.json()).then(data => {
      const total = data.length;
      const withEmail = data.filter((l: any) => l.email).length;
      const withPhone = data.filter((l: any) => l.phone).length;
      const withBoth = data.filter((l: any) => l.email && l.phone).length;
      setStats({ total, withEmail, withPhone, withBoth });
    }).catch(() => {});
  }, []);

  if (stats.total === 0) return null;

  const emailPercent = Math.round((stats.withEmail / stats.total) * 100);
  const phonePercent = Math.round((stats.withPhone / stats.total) * 100);
  const bothPercent = Math.round((stats.withBoth / stats.total) * 100);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="bg-black/40 backdrop-blur-xl border-white/10">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-5 w-5 text-[#6366F1]" />
            <h3 className="text-sm font-semibold">Lead Quality Score</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-blue-400">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-2xl font-bold">{emailPercent}%</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Have Email</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-2xl font-bold">{phonePercent}%</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Have Phone</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-purple-400">
                <AlertCircle className="h-4 w-4" />
                <span className="text-2xl font-bold">{bothPercent}%</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Have Both</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
