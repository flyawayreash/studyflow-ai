import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useListTasks, useCreateTask, useUpdateTask, useDeleteTask,
  getListTasksQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Calendar, Plus, Trash2, CheckCircle, Circle, Flag, Clock, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isToday, isPast } from "date-fns";

interface Task {
  id: number;
  title: string;
  subject?: string | null;
  dueDate?: string | null;
  completed: boolean;
  priority: "low" | "medium" | "high";
  createdAt: string;
}

const priorityConfig = {
  high: { label: "High", color: "text-red-400", bg: "bg-red-400/10 border-red-400/20" },
  medium: { label: "Medium", color: "text-orange-400", bg: "bg-orange-400/10 border-orange-400/20" },
  low: { label: "Low", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
};

export default function PlannerPage() {
  const queryClient = useQueryClient();
  const { data: tasks = [], isLoading } = useListTasks();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newDue, setNewDue] = useState("");
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high">("medium");
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    await createTask.mutateAsync({
      data: {
        title: newTitle.trim(),
        subject: newSubject || undefined,
        dueDate: newDue ? new Date(newDue).toISOString() : undefined,
        priority: newPriority,
      },
    });
    queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
    setNewTitle(""); setNewSubject(""); setNewDue(""); setNewPriority("medium");
    setShowForm(false);
  };

  const handleToggle = async (task: Task) => {
    await updateTask.mutateAsync({ id: task.id, data: { completed: !task.completed } });
    queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
  };

  const handleDelete = async (id: number) => {
    await deleteTask.mutateAsync({ id });
    queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
  };

  const filtered = (tasks as Task[]).filter((t) => {
    if (filter === "pending") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  const pending = (tasks as Task[]).filter(t => !t.completed).length;
  const completed = (tasks as Task[]).filter(t => t.completed).length;
  const progress = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-600 to-green-400 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl font-black">Study Planner</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-10">{pending} tasks pending · {completed} completed</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          data-testid="button-add-task"
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      {/* Progress */}
      {tasks.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium">Overall Progress</span>
            <span className="font-bold text-primary">{progress}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
            />
          </div>
        </motion.div>
      )}

      {/* Create form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-5"
          >
            <div className="p-5 rounded-xl border border-primary/20 bg-primary/5">
              <h3 className="font-bold text-sm mb-4">New Task</h3>
              <div className="space-y-3">
                <input
                  autoFocus
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setShowForm(false); }}
                  placeholder="Task title..."
                  data-testid="input-task-title"
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input value={newSubject} onChange={(e) => setNewSubject(e.target.value)} placeholder="Subject" className="px-3 py-2 rounded-lg border border-input bg-background text-sm" />
                  <input type="datetime-local" value={newDue} onChange={(e) => setNewDue(e.target.value)} data-testid="input-task-due" className="px-3 py-2 rounded-lg border border-input bg-background text-sm" />
                </div>
                <select value={newPriority} onChange={(e) => setNewPriority(e.target.value as "low"|"medium"|"high")} data-testid="select-priority" className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm">
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
                <div className="flex gap-2">
                  <button onClick={handleCreate} data-testid="button-create-task" className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-all">Add Task</button>
                  <button onClick={() => setShowForm(false)} className="px-4 py-2.5 border border-border rounded-lg text-sm hover:bg-muted/50 transition-all">Cancel</button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex gap-2 mb-5">
        {(["all", "pending", "completed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            data-testid={`filter-${f}`}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize",
              filter === f ? "bg-primary/15 text-primary border border-primary/20" : "border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <Filter className="w-3 h-3" /> {f}
          </button>
        ))}
      </div>

      {/* Tasks */}
      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center">
          <Calendar className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">
            {filter === "all" ? "No tasks yet. Add one to get started!" : `No ${filter} tasks.`}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map((task) => {
              const p = priorityConfig[task.priority as keyof typeof priorityConfig] ?? priorityConfig.medium;
              const overdue = task.dueDate && !task.completed && isPast(new Date(task.dueDate));
              const dueToday = task.dueDate && isToday(new Date(task.dueDate));
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10, height: 0 }}
                  layout
                  className={cn(
                    "group flex items-center gap-3 p-4 rounded-xl border transition-all",
                    task.completed ? "border-border/50 bg-card/50 opacity-60" : "border-border bg-card hover:border-primary/30"
                  )}
                >
                  <button
                    onClick={() => handleToggle(task)}
                    data-testid={`button-toggle-task-${task.id}`}
                    className="shrink-0"
                  >
                    {task.completed
                      ? <CheckCircle className="w-5 h-5 text-primary" />
                      : <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                    }
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className={cn("text-sm font-medium", task.completed && "line-through text-muted-foreground")}>{task.title}</div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {task.subject && <span className="text-xs text-muted-foreground">{task.subject}</span>}
                      {task.dueDate && (
                        <span className={cn("flex items-center gap-0.5 text-xs", overdue ? "text-red-400" : dueToday ? "text-orange-400" : "text-muted-foreground")}>
                          <Clock className="w-3 h-3" />
                          {overdue ? "Overdue · " : dueToday ? "Due today · " : ""}
                          {format(new Date(task.dueDate), "MMM d, h:mm a")}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className={cn("shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold border", p.bg, p.color)}>
                    <Flag className="w-2.5 h-2.5 inline mr-0.5" />{p.label}
                  </span>

                  <button
                    onClick={() => handleDelete(task.id)}
                    data-testid={`button-delete-task-${task.id}`}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
