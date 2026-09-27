"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

function mergeData(whatsapp: any[], emails: any[]) {
  const map: Record<string, { date: string; whatsapp: number; emails: number }> = {};

  (whatsapp || []).forEach(w => {
    const key = w._id || w.date || '';
    if (key) map[key] = { date: key, whatsapp: w.count || 0, emails: 0 };
  });

  (emails || []).forEach(e => {
    const key = e._id || e.date || '';
    if (key) {
      if (map[key]) map[key].emails = e.count || 0;
      else map[key] = { date: key, whatsapp: 0, emails: e.count || 0 };
    }
  });

  const result = Object.values(map).sort((a, b) => a.date.localeCompare(b.date));

  // If no data, create placeholder for last 30 days
  if (result.length === 0) {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        date: d.toISOString().split('T')[0],
        whatsapp: 0,
        emails: 0,
      });
    }
    return days;
  }

  return result;
}

export default function PerformanceAreaChart({ data }: { data: { whatsapp: any[]; emails: any[] } }) {
  const merged = mergeData(data?.whatsapp || [], data?.emails || []);
  const hasData = merged.some(d => d.whatsapp > 0 || d.emails > 0);

  return (
    <Card className="bg-black/40 backdrop-blur-xl border-white/10 hover:border-[#6366F1]/30 transition-all">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          📈 Email vs WhatsApp (30 days)
        </CardTitle>
      </CardHeader>
      <CardContent className="h-80 relative">
        {!hasData && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <p className="text-gray-500 text-sm text-center px-4">
              No activity yet.<br />Send outreach or click WhatsApp to see data.
            </p>
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={merged} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="emailGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="waGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="date"
              stroke="#888"
              tick={{ fill: '#ccc', fontSize: 11 }}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="#888"
              tick={{ fill: '#ccc', fontSize: 11 }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1a1a1a",
                border: "1px solid #333",
                borderRadius: 8,
              }}
              labelStyle={{ color: "#fff" }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="emails"
              stroke="#6366F1"
              strokeWidth={2}
              fill="url(#emailGradient)"
              name="Emails Sent"
            />
            <Area
              type="monotone"
              dataKey="whatsapp"
              stroke="#22c55e"
              strokeWidth={2}
              fill="url(#waGradient)"
              name="WhatsApp Clicks"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
