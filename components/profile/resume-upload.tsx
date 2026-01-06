"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FileText, Wand2, Check } from "lucide-react";

type ResumeUploadProps = {
  onParsed: (data: any) => void;
};

export default function ResumeUpload({ onParsed }: ResumeUploadProps) {
  const [text, setText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parsedData, setParsedData] = useState<any | null>(null);

  const handleParse = async () => {
    if (!text || text.length < 50) return;
    setParsing(true);
    try {
      const response = await fetch("/api/profile/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const payload = await response.json();
      if (response.ok) {
        setParsedData(payload.data);
      }
    } catch (err) {
      console.error("Parsing failed", err);
    } finally {
      setParsing(false);
    }
  };

  const handleApply = async () => {
    if (!parsedData) return;
    
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline: parsedData.suggestedHeadline,
          skills: parsedData.skills
        }),
      });
      
      if (response.ok) {
        onParsed(parsedData);
        setParsedData(null);
        setText("");
      }
    } catch (err) {
      console.error("Apply failed", err);
    }
  };

  return (
    <div className="rounded-[2rem] border border-navy-100 bg-white p-8 shadow-premium">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-navy-600">
          <FileText className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-bold text-navy-950">Smart Resume Sync</h3>
          <p className="text-xs text-slate-500">Paste your resume to auto-fill your profile.</p>
        </div>
      </div>

      <Textarea
        placeholder="Paste your resume text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="min-h-[200px] rounded-2xl border-slate-200 focus:border-navy-400"
      />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <Button 
          onClick={handleParse} 
          disabled={parsing || text.length < 50}
          className="bg-navy-950 hover:bg-navy-800 text-white rounded-xl gap-2"
        >
          {parsing ? "Analyzing..." : (
            <>
              <Wand2 className="h-4 w-4" />
              Extract Skills
            </>
          )}
        </Button>

        {parsedData && (
          <div className="flex-1 rounded-xl bg-gold-50 p-4 border border-gold-100">
            <p className="text-xs font-black uppercase tracking-widest text-gold-700 mb-2">Detected Profile</p>
            <p className="text-sm font-bold text-navy-950 mb-3">{parsedData.suggestedHeadline}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {parsedData.skills.slice(0, 5).map((skill: string) => (
                <Badge key={skill} variant="featured">{skill}</Badge>
              ))}
            </div>
            <Button onClick={handleApply} size="sm" className="bg-gold-500 hover:bg-gold-600 text-white rounded-lg gap-2">
              <Check className="h-3 w-3" /> Apply to Profile
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
