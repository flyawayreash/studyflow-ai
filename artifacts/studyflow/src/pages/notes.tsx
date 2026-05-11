import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useListNotes, useCreateNote, useUpdateNote, useDeleteNote,
  getListNotesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, FileText, Trash2, Sparkles, Save, X, Loader2, BookOpen } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface Note {
  id: number;
  title: string;
  content: string;
  subject?: string | null;
  summary?: string | null;
  updatedAt: string;
}

export default function NotesPage() {
  const queryClient = useQueryClient();
  const { data: notes = [], isLoading } = useListNotes();
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();

  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [summary, setSummary] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSubject, setNewSubject] = useState("");

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditSubject(note.subject ?? "");
    setSummary(note.summary ?? "");
    setIsEditing(false);
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    const note = await createNote.mutateAsync({ data: { title: newTitle.trim(), content: "", subject: newSubject } });
    queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
    setShowCreateForm(false);
    setNewTitle(""); setNewSubject("");
    handleSelectNote(note as Note);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!selectedNote) return;
    const updated = await updateNote.mutateAsync({
      id: selectedNote.id,
      data: { title: editTitle, content: editContent, subject: editSubject },
    });
    queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
    setSelectedNote(updated as Note);
    setIsEditing(false);
  };

  const handleDelete = async (id: number) => {
    await deleteNote.mutateAsync({ id });
    queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
    if (selectedNote?.id === id) setSelectedNote(null);
  };

  const handleSummarize = async () => {
    if (!selectedNote) return;
    setIsSummarizing(true);
    setSummary("");
    try {
      const res = await fetch(`/api/notes/${selectedNote.id}/summarize`, { method: "POST" });
      if (!res.body) return;
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
              if (data.content) { full += data.content; setSummary(full); }
            } catch {}
          }
        }
      }
      queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="flex h-full">
      {/* Notes list */}
      <div className="w-64 shrink-0 border-r border-border bg-card/50 flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-bold">Notes</span>
            <button
              onClick={() => setShowCreateForm(true)}
              data-testid="button-new-note"
              className="w-7 h-7 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center"
            >
              <Plus className="w-3.5 h-3.5 text-primary" />
            </button>
          </div>
          <AnimatePresence>
            {showCreateForm && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mt-2">
                <input autoFocus value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setShowCreateForm(false); }} placeholder="Note title..." className="w-full px-2.5 py-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary mb-1.5" />
                <input value={newSubject} onChange={(e) => setNewSubject(e.target.value)} placeholder="Subject (optional)" className="w-full px-2.5 py-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary mb-2" />
                <div className="flex gap-1.5">
                  <button onClick={handleCreate} className="flex-1 py-1.5 bg-primary text-primary-foreground text-xs rounded-lg font-medium">Create</button>
                  <button onClick={() => setShowCreateForm(false)} className="flex-1 py-1.5 border border-border text-xs rounded-lg">Cancel</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isLoading ? (
            <div className="space-y-2 p-2">{[1,2,3].map(i => <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />)}</div>
          ) : notes.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-foreground">No notes yet. Create one!</div>
          ) : (
            (notes as Note[]).map((note) => (
              <motion.div
                key={note.id}
                whileHover={{ x: 2 }}
                onClick={() => handleSelectNote(note)}
                data-testid={`note-item-${note.id}`}
                className={cn(
                  "group p-3 rounded-lg cursor-pointer transition-all",
                  selectedNote?.id === note.id ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50"
                )}
              >
                <div className="flex items-start justify-between gap-1">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold truncate">{note.title}</div>
                    {note.subject && <div className="text-xs text-primary mt-0.5 truncate">{note.subject}</div>}
                    <div className="text-xs text-muted-foreground mt-1">{formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}</div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-destructive transition-all shrink-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Note editor */}
      <div className="flex-1 flex flex-col min-w-0">
        {!selectedNote ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center mb-4">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-2">Your Notes</h2>
            <p className="text-muted-foreground text-sm max-w-xs mb-6">Select a note to view or create a new one. Use AI to summarize any note instantly.</p>
            <button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-all">
              <Plus className="w-4 h-4" /> New Note
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            {/* Toolbar */}
            <div className="px-6 py-4 border-b border-border flex items-center gap-3">
              {isEditing ? (
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="flex-1 text-lg font-bold bg-transparent border-b border-primary focus:outline-none"
                  data-testid="input-note-title"
                />
              ) : (
                <h1 className="flex-1 text-lg font-bold truncate">{selectedNote.title}</h1>
              )}
              <div className="flex items-center gap-2 shrink-0">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSummarize}
                  disabled={isSummarizing || !editContent}
                  data-testid="button-summarize"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/15 text-secondary border border-secondary/20 text-xs font-semibold hover:bg-secondary/25 transition-all disabled:opacity-50"
                >
                  {isSummarizing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  {isSummarizing ? "Summarizing..." : "AI Summary"}
                </motion.button>
                {isEditing ? (
                  <>
                    <button onClick={handleSave} data-testid="button-save-note" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all">
                      <Save className="w-3.5 h-3.5" /> Save
                    </button>
                    <button onClick={() => setIsEditing(false)} className="p-1.5 rounded-lg hover:bg-muted transition-all">
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <button onClick={() => setIsEditing(true)} data-testid="button-edit-note" className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted/50 transition-all">
                    Edit
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-auto p-6 flex flex-col gap-4">
              {/* Subject */}
              {isEditing && (
                <input
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  placeholder="Subject / topic..."
                  className="px-3 py-2 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-1 focus:ring-primary w-48"
                />
              )}
              {!isEditing && selectedNote.subject && (
                <span className="inline-flex px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium w-fit">{selectedNote.subject}</span>
              )}

              {/* Content */}
              {isEditing ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Start writing your notes here..."
                  data-testid="textarea-note-content"
                  className="flex-1 min-h-48 p-0 bg-transparent text-sm leading-relaxed focus:outline-none resize-none"
                />
              ) : (
                <div className="flex-1 text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                  {selectedNote.content || <span className="text-muted-foreground italic">No content yet. Click Edit to start writing.</span>}
                </div>
              )}

              {/* Summary */}
              <AnimatePresence>
                {(summary || selectedNote.summary) && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl border border-secondary/20 bg-secondary/5"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-secondary" />
                      <span className="text-xs font-bold text-secondary uppercase tracking-wider">AI Summary</span>
                    </div>
                    <div className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                      {summary || selectedNote.summary}
                      {isSummarizing && <span className="inline-block w-1 h-3.5 bg-secondary ml-0.5 animate-pulse" />}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
