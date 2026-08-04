import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function QuickActions() {
  return (
    <div className="flex flex-wrap gap-3">
      <Link href="/finder">
        <Button className="bg-[#6366F1] hover:bg-[#4f46e5]">Find Leads</Button>
      </Link>
      <Link href="/outreach">
        <Button
          variant="outline"
          className="border-[#6366F1] text-[#6366F1] hover:bg-[#6366F1]/10"
        >
          Run Campaign
        </Button>
      </Link>
      <Link href="/settings">
        <Button variant="ghost">Settings</Button>
      </Link>
    </div>
  );
}
