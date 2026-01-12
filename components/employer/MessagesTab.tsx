"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Send, 
  Loader2, 
  Check, 
  CheckCheck, 
  AlertCircle,
  Mail
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type Message = {
  id: string;
  body: string;
  created_at: string;
  sender_role: 'EMPLOYER' | 'CANDIDATE';
  status: 'sent' | 'delivered' | 'failed';
};

type MessagesTabProps = {
  messages: Message[];
  onSendMessage: (body: string) => Promise<void>;
  isSending: boolean;
};

export default function MessagesTab({ messages, onSendMessage, isSending }: MessagesTabProps) {
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || isSending) return;
    await onSendMessage(newMessage);
    setNewMessage("");
  };

  const renderStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'sent': return <Check className="h-3 w-3" />;
      case 'delivered': return <CheckCheck className="h-3 w-3 text-secondary" />;
      case 'failed': return <AlertCircle className="h-3 w-3 text-rose-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      <Card className="rounded-3xl border-border bg-card shadow-sm overflow-hidden">
        <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center shadow-sm text-brand">
              <Mail className="h-4 w-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-tight">Direct Conversation</h3>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Messages are visible to the candidate.</p>
        </div>
        
        <CardContent className="p-0">
          <div ref={scrollRef} className="h-[450px] overflow-y-auto p-6 space-y-6 flex flex-col scroll-smooth">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full opacity-30 text-center space-y-4">
                <MessageSquare className="h-12 w-12 text-slate-400" />
                <p className="text-sm font-bold uppercase tracking-widest">No messages exchanged yet</p>
              </div>
            ) : (
              messages.map(msg => (
                <div 
                  key={msg.id} 
                  className={`flex flex-col ${msg.sender_role === 'EMPLOYER' ? 'items-end' : 'items-start'}`}
                >
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium ${
                    msg.sender_role === 'EMPLOYER' 
                      ? 'bg-brand text-white rounded-tr-none' 
                      : 'bg-slate-100 text-slate-700 rounded-tl-none'
                  }`}>
                    <p className="leading-relaxed">{msg.body}</p>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2 px-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                    </span>
                    {msg.sender_role === 'EMPLOYER' && (
                      <span className="flex items-center gap-1 opacity-60">
                        {renderStatusIcon(msg.status)}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-6 bg-white border-t border-slate-100">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <Input 
                placeholder="Type your message to the candidate..." 
                className="flex-1 rounded-xl h-12 border-slate-200 focus:border-brand transition-all"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                disabled={isSending}
              />
              <Button 
                type="submit"
                disabled={isSending || !newMessage.trim()}
                className="rounded-xl h-12 w-12 bg-brand text-white p-0 shadow-cta border-none hover:opacity-90 transition-all"
              >
                {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
