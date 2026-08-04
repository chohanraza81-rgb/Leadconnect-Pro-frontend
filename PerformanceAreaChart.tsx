import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

function mergeData(whatsapp: { _id: string; count: number }[], emails: { _id: string; count: number }[]) {
  const map: Record<string, { date: string; whatsapp: number; emails: number }> = {};
  whatsapp.forEach(w => { map[w._id] = { date: w._id, whatsapp: w.count, emails: 0 }; });
  emails.forEach(e => {
    if (map[e._id]) map[e._id].emails = e.count;
    else map[e._id] = { date: e._id, whatsapp: 0, emails: e.count };
  });
  return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
}

export default function PerformanceAreaChart({ data }: { data: { whatsapp: any[]; emails: any[] } }) {
  const merged = mergeData(data.whatsapp, data.emails);
  return (
    <Card className="bg-black/40 backdrop-blur-xl border-white/10">
      <CardHeader>
        <CardTitle className="text-lg">Email vs WhatsApp (last 30 days)</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={merged} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="date" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "none" }} />
            <Legend />
            <Area type="monotone" dataKey="emails" stroke="#6366F1" fill="#6366F1" fillOpacity={0.2} />
            <Area type="monotone" dataKey="whatsapp" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
            }
