import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/hooks/use-auth";
import { User, Sun, Moon, Bell, Shield, Zap, ChevronRight, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

export default function ProfilePage() {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [, setLocation] = useLocation();
  const [signingOut, setSigningOut] = useState(false);

  const displayName = user?.user_metadata?.full_name
    ?? user?.user_metadata?.name
    ?? user?.email?.split("@")[0]
    ?? "Student";
  const email = user?.email ?? "";
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const initials = displayName.charAt(0).toUpperCase();

  const provider = user?.app_metadata?.provider ?? "email";
  const isGoogle = provider === "google";

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    setLocation("/");
  };

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-2xl font-black">Profile</h1>
        </div>
        <p className="text-sm text-muted-foreground ml-11">Manage your account and preferences</p>
      </motion.div>

      {/* Avatar card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex items-center gap-5 p-6 rounded-2xl border border-border bg-card mb-6"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-primary/20 shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-2xl font-black shrink-0">
            {initials}
          </div>
        )}
        <div className="min-w-0">
          <div className="font-bold text-lg truncate">{displayName}</div>
          <div className="text-sm text-muted-foreground truncate">{email}</div>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              <Zap className="w-3 h-3" /> Free Plan
            </div>
            {isGoogle && (
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold">
                Google Account
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
        {/* Account info (read-only — managed by Supabase) */}
        <motion.div variants={item} className="p-6 rounded-2xl border border-border bg-card">
          <h2 className="font-bold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Account Info</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Name</label>
              <div className="px-3 py-2.5 rounded-lg border border-input bg-muted/30 text-sm text-foreground">
                {displayName}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Email</label>
              <div className="px-3 py-2.5 rounded-lg border border-input bg-muted/30 text-sm text-foreground">
                {email}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Sign-in method</label>
              <div className="px-3 py-2.5 rounded-lg border border-input bg-muted/30 text-sm text-foreground capitalize">
                {isGoogle ? "Google" : "Email & Password"}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Account details are managed through your sign-in provider.</p>
          </div>
        </motion.div>

        {/* Preferences */}
        <motion.div variants={item} className="p-6 rounded-2xl border border-border bg-card">
          <h2 className="font-bold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Preferences</h2>
          <div className="space-y-1">
            <button
              onClick={toggleTheme}
              data-testid="button-profile-theme"
              className="flex items-center w-full px-3 py-3 rounded-lg hover:bg-muted/50 transition-all"
            >
              {theme === "dark" ? <Sun className="w-5 h-5 text-orange-400 mr-3" /> : <Moon className="w-5 h-5 text-purple-400 mr-3" />}
              <div className="flex-1 text-left">
                <div className="text-sm font-medium">Appearance</div>
                <div className="text-xs text-muted-foreground capitalize">{theme} mode active</div>
              </div>
              <div className={cn("w-10 h-5 rounded-full transition-all relative", theme === "dark" ? "bg-primary" : "bg-muted")}>
                <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all", theme === "dark" ? "left-5" : "left-0.5")} />
              </div>
            </button>

            {[
              { icon: Bell, label: "Notifications", desc: "Study reminders and updates" },
              { icon: Shield, label: "Privacy", desc: "Data and security settings" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center px-3 py-3 rounded-lg hover:bg-muted/50 transition-all cursor-pointer">
                <Icon className="w-5 h-5 text-muted-foreground mr-3" />
                <div className="flex-1">
                  <div className="text-sm font-medium">{label}</div>
                  <div className="text-xs text-muted-foreground">{desc}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Plan */}
        <motion.div variants={item} className="p-6 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold mb-1">Current Plan</h2>
              <div className="text-sm text-muted-foreground">Free — unlimited AI conversations</div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-primary to-secondary text-white text-sm font-bold cursor-pointer hover:opacity-90 transition-all">
              <Zap className="w-4 h-4" /> Upgrade
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {["AI Tutor Chat", "Notes Summarizer", "Quiz Generator", "Study Planner"].map((f) => (
              <div key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-3.5 h-3.5 rounded-full bg-primary/20 flex items-center justify-center">
                  <Zap className="w-2 h-2 text-primary" />
                </div>
                {f}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Sign out */}
        <motion.div variants={item}>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            data-testid="button-profile-signout"
            className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive text-sm font-semibold hover:bg-destructive/10 transition-all disabled:opacity-60"
          >
            {signingOut
              ? <div className="w-4 h-4 border-2 border-destructive/30 border-t-destructive rounded-full animate-spin" />
              : <LogOut className="w-4 h-4" />}
            {signingOut ? "Signing out..." : "Sign Out"}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
