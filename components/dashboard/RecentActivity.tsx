"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollText, Mail, Phone, UserPlus } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function RecentActivity() {
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API}/leads?sort=newest`).then(r => r.json()).then(data => {
      const recent = (data || []).slice(0, 5).map((l: any) => ({
        icon: l.whatsappClicks > 0 ? Phone : l.email ? Mail : UserPlus,
        text: l.whatsappClicks > 0 
          ? `WhatsApp clicked for ${l.name}`
          : l.email 
            ? `Email found: ${l.email}`
            : `New lead: ${l.name}`,
        time: l.createdAt ? new Date(l.createdAt).toLocaleDateString() : 'Recently',
        color: l.whatsappClicks > 0 ? 'text-green-400' : l.email ? 'text-blue-400' : 'text-gray-400',
      }));
      setActivities(recent);
    }).catch(() => {});
  }, []);

  if (activities.length === 0) return null;

  return (
    <Card className="bg-black/40 backdrop-blur-xl border-white/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <ScrollText className="h-4 w-4" /> Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {activities.map((a, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <a.icon className={`h-3 w-3 ${a.color}`} />
              <span className="text-gray-300 truncate">{a.text}</span>
              <span className="text-gray-500 ml-auto whitespace-nowrap">{a.time}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
