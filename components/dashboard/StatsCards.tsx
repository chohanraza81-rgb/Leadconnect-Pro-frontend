import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function StatsCards({ data }: { data: any }) {
  const stats = [
    { title: "Total Leads", value: data.totalLeads, icon: "👥" },
    { title: "Emails Found", value: data.emailsFound, icon: "📧" },
    { title: "WhatsApp Clicks", value: data.whatsappClicks, icon: "💬" },
    { title: "Campaigns Sent", value: data.campaignsSent, icon: "🚀" },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s, i) => (
        <motion.div
          key={s.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <Card className="bg-black/40 backdrop-blur-xl border-white/10 shadow-xl hover:border-[#6366F1]/40 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                {s.title}
              </CardTitle>
              <span className="text-2xl">{s.icon}</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
    }
