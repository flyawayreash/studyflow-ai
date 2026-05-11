import { Link } from "wouter";
import { motion } from "framer-motion";
import { useGetDashboardStats } from "@workspace/api-client-react";
import { MessageSquare, FileText, Brain, Calendar, CheckCircle, Clock, BookOpen, TrendingUp, ArrowRight, Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const activityIcons: Record<string, React.ElementType> = {
  note: FileText, quiz: Brain, task: Calendar, conversation: MessageSquare,
};
const activityColors: Record<string, string> = {
  note: "text-orange-400 bg-orange-400/10",
  quiz: "text-purple-400 bg-purple-400/10",
  task: "text-blue-400 bg-blue-400/10",
  conversation: "text-green-400 bg-green-400/10",
};

export default function DashboardPage() {
  const { data: stats, isLoading } = useGetDashboardStats();

  const statCards = [
    { label: "AI Conversations", value: stats?.totalConversations ?? 0, icon: MessageSquare, color: "text-orange-400", bg: "bg-orange-400/10", href: "/tutor" },
    { label: "Notes Created", value: stats?.totalNotes ?? 0, icon: FileText, color: "text-purple-400", bg: "bg-purple-400/10", href: "/notes" },
    { label: "Quizzes Generated", value: stats?.totalQuizzes ?? 0, icon: Brain, color: "text-blue-400", bg: "bg-blue-400/10", href: "/quiz" },
    { label: "Tasks Completed", value: `${stats?.completedTasks ?? 0}/${stats?.totalTasks ?? 0}`, icon: CheckCircle, color: "text-green-400", bg: "bg-green-400/10", href: "/planner" },
  ];

  const quickActions = [
    { label: "Ask AI Tutor", icon: MessageSquare, href: "/tutor", color: "bg-gradient-to-br from-orange-500 to-orange-400" },
    { label: "Summarize Notes", icon: FileText, href: "/notes", color: "bg-gradient-to-br from-purple-600 to-purple-400" },
    { label: "Generate Quiz", icon: Brain, href: "/quiz", color: "bg-gradient-to-br from-blue-600 to-blue-400" },
    { label: "Add Task", icon: Calendar, href: "/planner", color: "bg-gradient-to-br from-green-600 to-green-400" },
  ];

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-2xl font-black">Dashboard</h1>
        </div>
        <p className="text-muted-foreground text-sm ml-11">Your learning overview at a glance</p>
      </motion.div>

      {/* Stat cards */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color, bg, href }) => (
          <motion.div key={label} variants={item}>
            <Link href={href}>
              <motion.div
                whileHover={{ y: -3, transition: { duration: 0.15 } }}
                data-testid={`card-stat-${label.toLowerCase().replace(/ /g, "-")}`}
                className="p-5 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all duration-200 cursor-pointer group"
              >
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div className="text-2xl font-black mb-0.5">
                  {isLoading ? <div className="w-10 h-7 bg-muted animate-pulse rounded" /> : value}
                </div>
                <div className="text-xs text-muted-foreground">{label}</div>
                <ArrowRight className="w-3 h-3 text-muted-foreground/0 group-hover:text-muted-foreground mt-2 transition-all" />
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-1"
        >
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {quickActions.map(({ label, icon: Icon, href, color }) => (
              <Link key={label} href={href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  data-testid={`action-${label.toLowerCase().replace(/ /g, "-")}`}
                  className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-card hover:border-primary/30 cursor-pointer transition-all"
                >
                  <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center shrink-0`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">{label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground ml-auto" />
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Recent activity */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Recent Activity</h2>
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-muted animate-pulse" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 bg-muted animate-pulse rounded w-3/4" />
                      <div className="h-3 bg-muted animate-pulse rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : stats?.recentActivity.length === 0 ? (
              <div className="p-12 text-center">
                <TrendingUp className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No activity yet — start learning!</p>
                <Link href="/tutor">
                  <button className="mt-4 text-sm text-primary hover:underline">Open AI Tutor</button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {stats?.recentActivity.map((activity, i) => {
                  const Icon = activityIcons[activity.type] ?? BookOpen;
                  const colorClass = activityColors[activity.type] ?? "text-muted-foreground bg-muted";
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 p-4"
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{activity.title}</div>
                        <div className="text-xs text-muted-foreground capitalize">{activity.type}</div>
                      </div>
                      <div className="text-xs text-muted-foreground shrink-0">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
