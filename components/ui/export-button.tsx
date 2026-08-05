"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, Copy, FileSpreadsheet, FileJson, FileText, Mail, Phone, ClipboardList, CheckCircle2 } from "lucide-react";

interface ExportButtonProps {
  data: any[];
  filename?: string;
}

export default function ExportButton({ data, filename = "leads" }: ExportButtonProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const markCopied = (type: string) => {
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyEmails = () => {
    const emails = data.filter(l => l.email).map(l => l.email).join(", ");
    if (!emails) return toast({ title: "No emails found", variant: "destructive" });
    navigator.clipboard.writeText(emails);
    markCopied("emails");
    toast({ title: `📋 ${data.filter(l => l.email).length} emails copied!` });
  };

  const copyPhones = () => {
    const phones = data.filter(l => l.phone).map(l => l.phone).join(", ");
    if (!phones) return toast({ title: "No phones found", variant: "destructive" });
    navigator.clipboard.writeText(phones);
    markCopied("phones");
    toast({ title: `📋 ${data.filter(l => l.phone).length} phones copied!` });
  };

  const copyAll = () => {
    const text = data.map(l => `${l.name} | ${l.company} | ${l.email} | ${l.phone}`).join("\n");
    if (!text) return toast({ title: "No data", variant: "destructive" });
    navigator.clipboard.writeText(text);
    markCopied("all");
    toast({ title: "📋 All data copied!" });
  };

  const downloadFile = (content: string, name: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadCSV = () => {
    if (!data.length) return toast({ title: "No data", variant: "destructive" });
    const headers = ["Name", "Company", "Email", "Phone", "Country", "Niche", "Status", "Address", "Rating"];
    const rows = data.map(l => [
      l.name || "", l.company || "", l.email || "", l.phone || "",
      l.country || "", l.niche || "", l.status || "", l.address || "", l.rating || ""
    ]);
    let csv = "\uFEFF" + headers.join(",") + "\n";
    rows.forEach(r => csv += r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",") + "\n");
    downloadFile(csv, `${filename}.csv`, "text/csv;charset=utf-8");
    toast({ title: "📥 Excel/CSV downloaded!" });
  };

  const downloadJSON = () => {
    if (!data.length) return toast({ title: "No data", variant: "destructive" });
    downloadFile(JSON.stringify(data, null, 2), `${filename}.json`, "application/json");
    toast({ title: "📥 JSON downloaded!" });
  };

  const downloadTXT = () => {
    if (!data.length) return toast({ title: "No data", variant: "destructive" });
    const text = data.map(l => 
      `Name: ${l.name}\nCompany: ${l.company}\nEmail: ${l.email}\nPhone: ${l.phone}\n---`
    ).join("\n\n");
    downloadFile(text, `${filename}.txt`, "text/plain");
    toast({ title: "📥 Text file downloaded!" });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="border-white/20 gap-2 hover:bg-white/5">
          <Download className="h-4 w-4" /> Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-[#111] border-white/10 text-white">
        <DropdownMenuLabel>📤 Export & Copy</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />

        <DropdownMenuItem onClick={copyEmails} className="cursor-pointer hover:bg-white/5 gap-2">
          {copied === "emails" ? <CheckCircle2 className="h-4 w-4 text-green-400" /> : <Mail className="h-4 w-4 text-blue-400" />}
          Copy All Emails
        </DropdownMenuItem>

        <DropdownMenuItem onClick={copyPhones} className="cursor-pointer hover:bg-white/5 gap-2">
          {copied === "phones" ? <CheckCircle2 className="h-4 w-4 text-green-400" /> : <Phone className="h-4 w-4 text-green-400" />}
          Copy All Phones
        </DropdownMenuItem>

        <DropdownMenuItem onClick={copyAll} className="cursor-pointer hover:bg-white/5 gap-2">
          {copied === "all" ? <CheckCircle2 className="h-4 w-4 text-green-400" /> : <ClipboardList className="h-4 w-4 text-yellow-400" />}
          Copy Complete Table
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-white/10" />

        <DropdownMenuItem onClick={downloadCSV} className="cursor-pointer hover:bg-white/5 gap-2">
          <FileSpreadsheet className="h-4 w-4 text-green-500" /> Excel / CSV
        </DropdownMenuItem>

        <DropdownMenuItem onClick={downloadJSON} className="cursor-pointer hover:bg-white/5 gap-2">
          <FileJson className="h-4 w-4 text-yellow-500" /> JSON Format
        </DropdownMenuItem>

        <DropdownMenuItem onClick={downloadTXT} className="cursor-pointer hover:bg-white/5 gap-2">
          <FileText className="h-4 w-4 text-gray-400" /> Text File
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
