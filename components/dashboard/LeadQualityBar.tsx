"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, ShieldCheck, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://leadconnect-pro-backend-production-0edb.up.railway.app/api";

export default function LeadQualityBar() {
  const [stats, setStats] = useState({ total: 0, withEmail: 0, withPhone: 0, withBoth: 0 });

  useEffect(() => {
    fetch(`${API}/leads`)
      .then((r) => r.json())
      .then((data) => {
        const total = data.length;
        const withEmail = data.filter((l: any) => l.email).length;
        const withPhone = data.filter((l: any) => l.phone).length;
        const withBoth = data.filter((l: any) => l.email && l.phone).length;
        setStats({ total, withEmail, withPhone, withBoth });
      })
      .catch(() => {});
  }, []);

  if (stats.total === 0) return null;

  const emailPercent = Math.round((stats.withEmail / stats.total) * 100);
  const phonePercent = Math.round((stats.withPhone / stats.total) * 100);
  const bothPercent = Math.round((stats.withBoth / stats.total) * 100);

  const items = [
    {
      label: "Have Email",
      value: emailPercent,
      icon: Mail,
      barColor: "bg-indigo-500",
      iconColor: "text-indigo-600",
      bg: "bg-indigo-50 dark:bg-indigo-950/40",
    },
    {
      label: "Have Phone",
      value: phonePercent,
      icon: Phone,
      barColor: "bg-emerald-500",
      iconColor: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
    },
    {
      label: "Have Both",
      value: bothPercent,
      icon: ShieldCheck,
      barColor: "bg-amber-500",
      iconColor: "text-amber-600",
      bg: "bg-amber-50 dark:bg-amber-950/40",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="overflow-hidden h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2 font-semibold">
            <TrendingUp className="h-5 w-5 text-primary" />
            Contact Coverage
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            How complete is your lead contact data
          </p>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {items.map((item) => (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-md ${item.bg}`}>
                    <item.icon className={`h-3.5 w-3.5 ${item.iconColor}`} />
                  </div>
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <span className="text-sm font-bold tabular-nums">{item.value}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.value}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`h-full rounded-full ${item.barColor}`}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}
