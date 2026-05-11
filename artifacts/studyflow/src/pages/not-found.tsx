import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Zap } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-6">
          <Zap className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-6xl font-black gradient-text mb-4">404</h1>
        <h2 className="text-xl font-bold mb-2">Page Not Found</h2>
        <p className="text-muted-foreground text-sm mb-8 max-w-xs">Looks like this page took a detour. Let's get you back on track.</p>
        <Link href="/">
          <button className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-all mx-auto">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
        </Link>
      </motion.div>
    </div>
  );
}
