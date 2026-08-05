"use client";
import { Button } from "@/components/ui/button";
import { Download, Copy, FileJson } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useState } from "react";

interface ExportButtonProps {
  data: any[];
  filename?: string;
}

export default function ExportButton({ data, filename = "leads" }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  const copyAllEmails = () => {
    const emails = data
      .filter(l => l.email)
      .map(l => l.email)
      .join(", ");
    
    if (!emails) {
      toast({ title: "No emails to copy", variant: "destructive" });
      return;
    }
    
    navigator.clipboard.writeText(emails);
    toast({ title: `📋 Copied ${data.filter(l => l.email).length} emails!` });
  };

  const copyAllPhones = () => {
    const phones = data
      .filter(l => l.phone)
      .map(l => l.phone)
      .join(", ");
    
    if (!phones) {
      toast({ title: "No phones to copy", variant: "destructive" });
      return;
    }
    
    navigator.clipboard.writeText(phones);
    toast({ title: `📋 Copied ${data.filter(l => l.phone).length} phones!` });
  };

  const downloadCSV = () => {
    if (data.length === 0) {
      toast({ title: "No data to download", variant: "destructive" });
      return;
    }
    
    setExporting(true);
    
    const headers = ["Name", "Company", "Email", "Phone", "Country", "Status"];
    const rows = data.map(l => [
      l.name || "",
      l.company || "",
      l.email || "",
      l.phone || "",
      l.country || "",
      l.status || "",
    ]);
    
    let csv = headers.join(",") + "\n";
    rows.forEach(row => {
      csv += row.map(cell => `"${(cell || "").replace(/"/g, '""')}"`).join(",") + "\n";
    });
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({ title: `📥 Downloaded ${data.length} leads as CSV!` });
    setExporting(false);
  };

  const downloadJSON = () => {
    if (data.length === 0) {
      toast({ title: "No data to download", variant: "destructive" });
      return;
    }
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({ title: `📥 Downloaded ${data.length} leads as JSON!` });
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="outline" onClick={copyAllEmails} className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 text-xs">
        <Copy className="h-3 w-3 mr-1" /> Copy All Emails
      </Button>
      <Button size="sm" variant="outline" onClick={copyAllPhones} className="border-green-500/30 text-green-400 hover:bg-green-500/10 text-xs">
        <Copy className="h-3 w-3 mr-1" /> Copy All Phones
      </Button>
      <Button size="sm" variant="outline" onClick={downloadCSV} className="border-white/20 text-gray-300 hover:bg-white/5 text-xs">
        <Download className="h-3 w-3 mr-1" /> CSV
      </Button>
      <Button size="sm" variant="outline" onClick={downloadJSON} className="border-white/20 text-gray-300 hover:bg-white/5 text-xs">
        <FileJson className="h-3 w-3 mr-1" /> JSON
      </Button>
    </div>
  );
      }
