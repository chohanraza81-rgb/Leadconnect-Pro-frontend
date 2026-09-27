"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

function buildData(whatsapp: any[], emails: any[]) {
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

  // Build last 30 days timeline
  const days: { date: string; whatsapp: number; emails: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const existing = map[key];
    days.push({
      date: formatDate(key),
      whatsapp: existing?.whatsapp || 0,
      emails: existing?.emails || 0,
    });
  }

  return days;
}

export default function PerformanceAreaChart({ data }: { data: { whatsapp: any[]; emails: any[] } }) {
  const chartData = buildData(data?.whatsapp || [], data?.emails || []);
  const hasData = chartData.some(d => d.whatsapp > 0 || d.emails > 0);

  return (
    <Card className="bg-black/40 backdrop-blur-xl border-white/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">📈 Email vs WhatsApp (30 days)</CardTitle>
      </CardHeader>
      <CardContent className="h-80 relative">
        {!hasData && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <p className="text-gray-500 text-sm">No activity yet. Send outreach to see data.</p>
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="emailGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="waGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
            <XAxis
              dataKey="date"
              stroke="#888"
              tick={{ fill: '#aaa', fontSize: 10 }}
              interval={4}
              angle={-20}
              textAnchor="end"
              height={50}
            />
            <YAxis
              stroke="#888"
              tick={{ fill: '#aaa', fontSize: 11 }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#111",
                border: "1px solid #333",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "#fff" }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area
              type="monotone"
              dataKey="emails"
              stroke="#6366F1"
              strokeWidth={2}
              fill="url(#emailGradient)"
              name="Emails Sent"
              dot={{ r: 3, fill: "#6366F1" }}
              activeDot={{ r: 5 }}
            />
            <Area
              type="monotone"
              dataKey="whatsapp"
              stroke="#22c55e"
              strokeWidth={2}
              fill="url(#waGradient)"
              name="WhatsApp Clicks"
              dot={{ r: 3, fill: "#22c55e" }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
