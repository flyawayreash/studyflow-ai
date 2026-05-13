import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, User, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

type Tab = "signin" | "signup";

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();

  const [tab, setTab] = useState<Tab>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      if (tab === "signin") {
        const { error } = await signInWithEmail(email, password);
        if (error) { setError(error.message); return; }
        setLocation("/dashboard");
      } else {
        const { error } = await signUpWithEmail(email, password);
        if (error) { setError(error.message); return; }
        setSuccessMsg("Check your email to confirm your account, then sign in.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
    // On success, Supabase redirects the browser — no setLocation needed
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-primary/20 via-background to-secondary/20 p-12 border-r border-border relative overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

        <Link href="/">
          <div className="flex items-center gap-2.5 relative cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">StudyFlow <span className="text-primary">AI</span></span>
          </div>
        </Link>

        <div className="relative">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-semibold mb-6">
              <Sparkles className="w-3 h-3" />
              AI-Powered Learning
            </div>
            <h2 className="text-4xl font-black leading-tight mb-4">
              Your AI study<br />companion<br />
              <span className="gradient-text">awaits you.</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Join 50,000+ students already studying smarter with AI tutoring, instant note summaries, and auto-generated quizzes.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 gap-4 relative">
          {[
            { value: "10x", label: "Faster comprehension" },
            { value: "98%", label: "Student satisfaction" },
            { value: "50K+", label: "Active learners" },
            { value: "1M+", label: "Concepts mastered" },
          ].map(({ value, label }) => (
            <div key={label} className="p-4 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm">
              <div className="text-2xl font-black gradient-text">{value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right auth panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <Link href="/">
            <div className="flex items-center gap-2 mb-8 lg:hidden cursor-pointer">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold">StudyFlow <span className="text-primary">AI</span></span>
            </div>
          </Link>

          {/* Tab switcher */}
          <div className="flex gap-1 p-1 rounded-xl bg-muted/50 border border-border mb-6">
            {(["signin", "signup"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); setSuccessMsg(""); }}
                data-testid={`tab-${t}`}
                className={cn(
                  "flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all",
                  tab === t
                    ? "bg-card text-foreground shadow-sm border border-border/50"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-6">
                <h1 className="text-2xl font-black mb-1">
                  {tab === "signin" ? "Welcome back" : "Create account"}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {tab === "signin"
                    ? "Sign in to continue your learning journey"
                    : "Start studying smarter with AI"}
                </p>
              </div>

              {/* Google button */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleGoogle}
                disabled={googleLoading}
                data-testid="button-google-signin"
                className="w-full flex items-center justify-center gap-3 border border-border bg-card hover:bg-muted/40 py-3 rounded-xl text-sm font-semibold transition-all mb-4 disabled:opacity-60"
              >
                {googleLoading
                  ? <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
                  : <GoogleIcon />}
                Continue with Google
              </motion.button>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Email form */}
              <form onSubmit={handleEmailAuth} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium mb-1.5" htmlFor="email">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      data-testid="input-email"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5" htmlFor="password">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={tab === "signup" ? "At least 6 characters" : "••••••••"}
                      data-testid="input-password"
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Error / success messages */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs"
                    >
                      <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      {error}
                    </motion.div>
                  )}
                  {successMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="flex items-start gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-xs"
                    >
                      <CheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      {successMsg}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  data-testid="button-submit-auth"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-60 mt-1"
                >
                  {isLoading
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : tab === "signin"
                      ? <><ArrowRight className="w-4 h-4" /> Sign In</>
                      : <><User className="w-4 h-4" /> Create Account</>
                  }
                </motion.button>
              </form>
            </motion.div>
          </AnimatePresence>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By continuing, you agree to our{" "}
            <span className="text-primary hover:underline cursor-pointer">Terms</span> and{" "}
            <span className="text-primary hover:underline cursor-pointer">Privacy Policy</span>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
