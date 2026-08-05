"use client";
import { useEffect, useState } from "react";
import { Wifi, WifiOff } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function StatusIndicator() {
  const [status, setStatus] = useState<"online" | "offline" | "checking">("checking");
  const [ping, setPing] = useState<number>(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const check = async () => {
      const start = Date.now();
      try {
        const res = await fetch(`${API}/dashboard/stats`);
        if (res.ok) {
          setPing(Date.now() - start);
          setStatus("online");
        } else {
          setStatus("offline");
        }
      } catch {
        setStatus("offline");
      }
    };
    check();
    interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 text-xs">
      {status === "online" ? (
        <>
          <span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-green-400">Live</span>
          <span className="text-gray-500">{ping}ms</span>
        </>
      ) : status === "offline" ? (
        <>
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
          <span className="text-red-400">Offline</span>
        </>
      ) : (
        <>
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500 animate-pulse" />
          <span className="text-yellow-400">Checking...</span>
        </>
      )}
    </div>
  );
}
