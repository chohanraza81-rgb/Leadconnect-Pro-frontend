"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollText, Mail, Phone, UserPlus } from "lucide-react";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://leadconnect-pro-backend-production-0edb.up.railway.app/api";

export default function RecentActivity() {
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API}/leads?sort=newest`)
      .then((r) => r.json())
      .then((data) => {
        const recent = (data || []).slice(0, 6).map((l: any) => {
          let icon = UserPlus;
          let text = `New lead: ${l.name}`;
          let iconColor = "text-muted-foreground";
          let bg = "bg-muted";

          if (l.whatsappClicks > 0) {
            icon = Phone;
            text = `WhatsApp clicked for ${l.name}`;
            iconColor = "text-emerald-600";
            bg = "bg-emerald-50 dark:bg-emerald-950/40";
          } else if (l.email) {
            icon = Mail;
            text = `Email found: ${l.email}`;
            iconColor = "text-indigo-600";
            bg = "bg-indigo-50 dark:bg-indigo-950/40";
          }

          return {
            icon,
            text,
            iconColor,
            bg,
            time: l.createdAt ? new Date(l.createdAt).toLocaleDateString() : "Recently",
          };
        });
        setActivities(recent);
      })
      .catch(() => {});
  }, []);

  if (activities.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2 font-semibold">
            <ScrollText className="h-5 w-5 text-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground py-8 text-center">
            No activity yet. Start finding leads to see updates.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2 font-semibold">
          <ScrollText className="h-5 w-5 text-primary" />
          Recent Activity
        </CardTitle>
        <p className="text-xs text-muted-foreground">Latest updates from your lead pipeline</p>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="divide-y divide-border">
          {activities.map((a, i) => (
            <div
              key={i}
              className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0 hover:bg-muted/40 -mx-2 px-2 rounded-md transition-colors"
            >
              <div className={`p-1.5 rounded-md ${a.bg} shrink-0`}>
                <a.icon className={`h-3.5 w-3.5 ${a.iconColor}`} />
              </div>
              <span className="text-sm text-foreground truncate flex-1">{a.text}</span>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {a.time}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
