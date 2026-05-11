import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useListOpenaiConversations,
  useCreateOpenaiConversation,
  useGetOpenaiConversation,
  useDeleteOpenaiConversation,
  getListOpenaiConversationsQueryKey,
  getGetOpenaiConversationQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Plus, Send, Trash2, Bot, User, Zap, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface StreamMessage {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

export default function TutorPage() {
  const queryClient = useQueryClient();
  const [activeConvoId, setActiveConvoId] = useState<number | null>(null);
  const [streamMessages, setStreamMessages] = useState<StreamMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: conversations = [], isLoading: loadingConvos } = useListOpenaiConversations();
  const { data: activeConvo } = useGetOpenaiConversation(activeConvoId!, {
    query: { enabled: !!activeConvoId, queryKey: getGetOpenaiConversationQueryKey(activeConvoId!) },
  });
  const createConvo = useCreateOpenaiConversation();
  const deleteConvo = useDeleteOpenaiConversation();

  useEffect(() => {
    if (activeConvo?.messages) {
      setStreamMessages(
        activeConvo.messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content }))
      );
    }
  }, [activeConvo?.messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [streamMessages]);

  const handleNewConvo = async () => {
    if (!newTitle.trim()) return;
    const convo = await createConvo.mutateAsync({ data: { title: newTitle.trim() } });
    queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
    setActiveConvoId(convo.id);
    setStreamMessages([]);
    setNewTitle("");
    setShowNewForm(false);
  };

  const handleSend = async () => {
    if (!input.trim() || !activeConvoId || isStreaming) return;
    const userMsg = input.trim();
    setInput("");
    setStreamMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsStreaming(true);

    const assistantIdx = streamMessages.length + 1;
    setStreamMessages((prev) => [...prev, { role: "assistant", content: "", streaming: true }]);

    try {
      const res = await fetch(`/api/openai/conversations/${activeConvoId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: userMsg }),
      });
      if (!res.body) throw new Error("No body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                full += data.content;
                setStreamMessages((prev) => {
                  const next = [...prev];
                  next[next.length - 1] = { role: "assistant", content: full, streaming: true };
                  return next;
                });
              }
              if (data.done) {
                setStreamMessages((prev) => {
                  const next = [...prev];
                  next[next.length - 1] = { role: "assistant", content: full };
                  return next;
                });
              }
            } catch {}
          }
        }
      }
    } finally {
      setIsStreaming(false);
      setStreamMessages((prev) => {
        const next = [...prev];
        if (next[next.length - 1]?.streaming) {
          next[next.length - 1] = { ...next[next.length - 1], streaming: false };
        }
        return next;
      });
    }
  };

  return (
    <div className="flex h-full">
      {/* Conversation sidebar */}
      <div className="hidden md:flex flex-col w-60 shrink-0 border-r border-border bg-card/50">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold">Conversations</span>
            <button
              onClick={() => setShowNewForm(true)}
              data-testid="button-new-conversation"
              className="w-7 h-7 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-primary" />
            </button>
          </div>
          <AnimatePresence>
            {showNewForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <input
                  autoFocus
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleNewConvo(); if (e.key === "Escape") setShowNewForm(false); }}
                  placeholder="Chat title..."
                  data-testid="input-conversation-title"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary mb-2"
                />
                <div className="flex gap-1.5">
                  <button onClick={handleNewConvo} className="flex-1 py-1.5 bg-primary text-primary-foreground text-xs rounded-lg font-medium">Create</button>
                  <button onClick={() => setShowNewForm(false)} className="flex-1 py-1.5 border border-border text-xs rounded-lg">Cancel</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loadingConvos ? (
            <div className="space-y-2 p-2">
              {[1,2,3].map(i => <div key={i} className="h-9 bg-muted animate-pulse rounded-lg" />)}
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-foreground">
              No conversations yet.<br />Create one to start!
            </div>
          ) : (
            conversations.map((c) => (
              <motion.div
                key={c.id}
                whileHover={{ x: 2 }}
                onClick={() => setActiveConvoId(c.id)}
                data-testid={`conversation-item-${c.id}`}
                className={cn(
                  "group flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-all text-xs",
                  activeConvoId === c.id
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "hover:bg-muted/50 text-muted-foreground"
                )}
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                <span className="flex-1 truncate font-medium">{c.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConvo.mutate({ id: c.id }, {
                      onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
                        if (activeConvoId === c.id) { setActiveConvoId(null); setStreamMessages([]); }
                      },
                    });
                  }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-destructive transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {!activeConvoId ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-2">StudyFlow AI Tutor</h2>
            <p className="text-muted-foreground text-sm max-w-sm mb-6">
              Your personal AI tutor is ready to help. Ask questions, get explanations, and learn anything.
            </p>
            <button
              onClick={() => setShowNewForm(true)}
              data-testid="button-start-chat"
              className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-all"
            >
              <Plus className="w-4 h-4" /> Start a Conversation
            </button>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
              <AnimatePresence initial={false}>
                {streamMessages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className={cn("flex gap-3 max-w-3xl", msg.role === "user" ? "ml-auto flex-row-reverse" : "")}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                      msg.role === "user" ? "bg-primary/20" : "bg-gradient-to-br from-primary to-secondary"
                    )}>
                      {msg.role === "user" ? <User className="w-4 h-4 text-primary" /> : <Bot className="w-4 h-4 text-white" />}
                    </div>
                    <div className={cn(
                      "flex-1 px-4 py-3 rounded-2xl text-sm leading-relaxed",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-card border border-border rounded-tl-sm"
                    )}>
                      {msg.content}
                      {msg.streaming && (
                        <span className="inline-block w-1 h-4 bg-current ml-0.5 animate-pulse" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-3 items-end max-w-3xl mx-auto">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Ask anything... (Enter to send)"
                  data-testid="input-chat-message"
                  rows={1}
                  className="flex-1 resize-none px-4 py-3 rounded-xl border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all max-h-32 overflow-y-auto"
                />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSend}
                  disabled={!input.trim() || isStreaming}
                  data-testid="button-send-message"
                  className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-all disabled:opacity-40 shrink-0"
                >
                  {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </motion.button>
              </div>
              <p className="text-center text-xs text-muted-foreground mt-2">Shift+Enter for new line</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
