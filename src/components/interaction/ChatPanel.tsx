import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, Bot, Wrench, CheckCircle2, RotateCcw, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { classNames } from "@/utils/format";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  pushLocalUserMessage,
  resetChat,
  sendMessage,
} from "@/redux/slices/chatSlice";

const SUGGESTIONS = [
  "Met Dr. Sharma today. Discussed OncoBoost efficacy. Shared brochure. Doctor was interested. Follow-up in 2 weeks.",
  "Call with Dr. Mehta about CardioPlus dosing. He wants more clinical evidence.",
  "Sample drop at Dr. Rao — 20 units of PediaCough Syrup, positive reception.",
];

export function ChatPanel() {
  const dispatch = useAppDispatch();
  const { messages, sending } = useAppSelector((s) => s.chat);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, sending]);

  const submit = () => {
    const text = input.trim();
    if (!text || sending) return;
    dispatch(pushLocalUserMessage(text));
    dispatch(sendMessage(text));
    setInput("");
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-start justify-between p-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 grid place-items-center text-primary-foreground">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-sm flex items-center gap-1.5">
              AI Assistant
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            </div>
            <div className="text-[11px] text-muted-foreground">
              Log interaction via chat · LangGraph + Groq
            </div>
          </div>
        </div>
        <button
          onClick={() => dispatch(resetChat())}
          className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-4"
      >
        {messages.map((m) => {
          if (m.role === "tool") {
            return (
              <div key={m.id} className="flex justify-start">
                <div className="max-w-[85%] rounded-lg border border-border bg-muted/40 text-[11px] font-mono px-3 py-2">
                  <div className="flex items-center gap-1.5 text-xs font-sans font-medium text-foreground mb-1">
                    <Wrench className="w-3.5 h-3.5 text-primary" />
                    <span>Tool: {m.toolName}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                  </div>
                  <pre className="whitespace-pre-wrap text-muted-foreground">
                    {m.content}
                  </pre>
                </div>
              </div>
            );
          }
          const isUser = m.role === "user";
          return (
            <div
              key={m.id}
              className={classNames(
                "flex gap-2",
                isUser ? "justify-end" : "justify-start",
              )}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary grid place-items-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                className={classNames(
                  "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  isUser
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted text-foreground rounded-bl-sm",
                )}
              >
                <div className="prose prose-sm max-w-none prose-p:my-1 prose-strong:text-current dark:prose-invert">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              </div>
              {isUser && (
                <div className="w-7 h-7 rounded-full bg-muted text-muted-foreground grid place-items-center shrink-0">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {sending && (
          <div className="flex gap-2 justify-start">
            <div className="w-7 h-7 rounded-full bg-primary/10 text-primary grid place-items-center shrink-0">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce" />
              <span
                className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce"
                style={{ animationDelay: "0.15s" }}
              />
              <span
                className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce"
                style={{ animationDelay: "0.3s" }}
              />
            </div>
          </div>
        )}
      </div>

      {messages.length <= 1 && (
        <div className="px-5 pb-3">
          <div className="text-[11px] text-muted-foreground mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Try one:
          </div>
          <div className="space-y-1.5">
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                onClick={() => setInput(s)}
                className="w-full text-left text-xs rounded-lg border border-border bg-background hover:bg-muted transition-colors px-3 py-2 text-muted-foreground"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 border-t border-border">
        <div className="flex items-end gap-2 rounded-2xl border border-input bg-background focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/20 transition-all p-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={1}
            placeholder="Describe interaction…"
            className="flex-1 bg-transparent px-2 py-1.5 text-sm outline-none resize-none max-h-32"
          />
          <button
            onClick={submit}
            disabled={!input.trim() || sending}
            className="h-9 w-9 rounded-lg bg-primary text-primary-foreground grid place-items-center disabled:opacity-40 hover:opacity-90 transition-opacity"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}