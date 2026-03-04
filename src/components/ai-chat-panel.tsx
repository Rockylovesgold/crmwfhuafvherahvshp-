"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Sparkles, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const mockResponses: Record<string, string> = {
  "summarize my leads": "You have 4 active leads in your pipeline worth a combined $285,000. The highest-value lead is 'Enterprise Platform License' at $120,000 with Quantum Dynamics. Two leads were added this week.",
  "what is my win rate": "Your current win rate is approximately 50%. You've closed 3 out of 6 total deals. This is above the industry average of 35% for B2B SaaS companies.",
  "top deals": "Your top 3 deals by value are:\n1. Enterprise Platform License — $120,000 (Qualified)\n2. Cloud Migration Project — $95,000 (Proposal)\n3. AI Analytics Suite — $85,000 (Lead)\n\nTotal pipeline value: $680,000",
};

function getMockResponse(prompt: string): string {
  const lower = prompt.toLowerCase();
  for (const [key, response] of Object.entries(mockResponses)) {
    if (lower.includes(key)) return response;
  }
  return `I'd be happy to help with "${prompt}". As a CRM AI assistant, I can help you analyze deals, summarize contacts, forecast revenue, and provide pipeline insights. Try asking me to "summarize my leads" or "top deals".`;
}

export function AiChatPanel() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm your Rock Mount AI assistant. Ask me anything about your CRM — deals, contacts, pipeline insights, and more.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSend() {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    await new Promise((r) => setTimeout(r, 1000 + Math.random() * 1000));

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: getMockResponse(userMsg.content),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, aiMsg]);
    setTyping(false);
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-screen w-[380px] flex-col border-l border-border bg-background shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary glow-blue">
                  <Sparkles className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">AI Assistant</h3>
                  <p className="text-xs text-muted-foreground">Powered by Rock Mount AI</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex gap-2",
                      msg.role === "user" ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                        msg.role === "user" ? "bg-primary/20" : "bg-neon-purple/20"
                      )}
                    >
                      {msg.role === "user" ? (
                        <User className="h-3.5 w-3.5 text-primary" />
                      ) : (
                        <Bot className="h-3.5 w-3.5 text-neon-purple" />
                      )}
                    </div>
                    <div
                      className={cn(
                        "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {typing && (
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neon-purple/20">
                      <Bot className="h-3.5 w-3.5 text-neon-purple" />
                    </div>
                    <div className="flex items-center gap-1 rounded-lg bg-muted px-3 py-2">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="border-t border-border p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your CRM..."
                  className="flex-1"
                  disabled={typing}
                />
                <Button type="submit" size="icon" disabled={!input.trim() || typing}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!open && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <Button
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg glow-blue"
            onClick={() => setOpen(true)}
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
        </motion.div>
      )}
    </>
  );
}
