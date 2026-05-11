import { Link } from "wouter";
import { motion } from "framer-motion";
import { Zap, Brain, FileText, Calendar, MessageSquare, ArrowRight, Star, CheckCircle, Sparkles, BookOpen, Target, TrendingUp } from "lucide-react";

const features = [
  { icon: MessageSquare, title: "AI Tutor Chat", desc: "Chat with your personal AI tutor — explain concepts, answer questions, and guide your learning in real time.", color: "from-orange-500 to-orange-400" },
  { icon: FileText, title: "Notes Summarizer", desc: "Paste your notes and get an AI-generated summary that extracts key concepts and main takeaways instantly.", color: "from-purple-600 to-purple-400" },
  { icon: Brain, title: "Quiz Generator", desc: "Turn any topic into an interactive quiz. Practice, test yourself, and track what you know.", color: "from-orange-500 to-purple-500" },
  { icon: Calendar, title: "Study Planner", desc: "Organize your study sessions, set deadlines, and stay on top of your goals with smart task management.", color: "from-purple-500 to-purple-400" },
];

const stats = [
  { value: "10x", label: "Faster Learning" },
  { value: "98%", label: "Student Satisfaction" },
  { value: "50K+", label: "Active Learners" },
  { value: "1M+", label: "Concepts Mastered" },
];

const testimonials = [
  { name: "Sarah K.", role: "Medical Student", text: "StudyFlow AI helped me pass my boards. The AI tutor explains complex topics like a brilliant professor.", stars: 5 },
  { name: "Marcus T.", role: "Computer Science", text: "The quiz generator is incredible. I went from failing to top of my class in one semester.", stars: 5 },
  { name: "Priya M.", role: "Law Student", text: "I summarize 100-page case notes in seconds. This is the future of studying.", stars: 5 },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base">StudyFlow <span className="gradient-text">AI</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#stats" className="hover:text-foreground transition-colors">Results</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Reviews</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <button className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5">Sign in</button>
            </Link>
            <Link href="/login">
              <button data-testid="button-get-started-nav" className="text-sm font-semibold bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-all">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 relative overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-semibold mb-8"
          >
            <Sparkles className="w-3 h-3" />
            Powered by GPT — Your AI Learning Partner
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tight leading-[1.05] mb-6"
          >
            Learn Smarter.<br />
            <span className="gradient-text">Score Higher.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            The AI-powered study platform that tutors you, summarizes your notes, 
            generates quizzes, and keeps you on schedule. Study like the top 1%.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/dashboard">
              <button data-testid="button-start-free" className="group flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold text-base hover:opacity-90 transition-all glow-orange">
                Start Studying Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link href="/tutor">
              <button data-testid="button-try-tutor" className="flex items-center gap-2 border border-border bg-card px-8 py-4 rounded-xl font-semibold text-base hover:bg-muted/50 transition-all">
                <MessageSquare className="w-4 h-4 text-primary" />
                Try AI Tutor
              </button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground"
          >
            {["Free to start", "No credit card", "AI-powered"].map((t) => (
              <div key={t} className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-primary" />
                {t}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-16 px-6 border-y border-border/50 bg-card/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          >
            {stats.map(({ value, label }) => (
              <motion.div key={label} variants={item}>
                <div className="text-4xl font-black gradient-text mb-1">{value}</div>
                <div className="text-sm text-muted-foreground">{label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-secondary/30 bg-secondary/5 text-secondary text-xs font-semibold mb-4">
              <BookOpen className="w-3 h-3" />
              Everything You Need
            </div>
            <h2 className="text-4xl font-black mb-4">AI Tools Built for Serious Students</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Four powerful AI tools designed to accelerate your learning and keep you ahead of the curve.</p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-6"
          >
            {features.map(({ icon: Icon, title, desc, color }) => (
              <motion.div
                key={title}
                variants={item}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group p-6 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all duration-300"
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 bg-card/30 border-y border-border/50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-black mb-4">How StudyFlow Works</h2>
            <p className="text-muted-foreground">Three steps to accelerate your learning.</p>
          </motion.div>
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              { step: "01", icon: Target, title: "Set Your Goals", desc: "Tell StudyFlow what you're studying and what you want to achieve." },
              { step: "02", icon: Brain, title: "Let AI Work", desc: "Your AI tutor explains, quizzes you, and summarizes — all in real time." },
              { step: "03", icon: TrendingUp, title: "Track Progress", desc: "Watch your dashboard fill up as you complete tasks and master concepts." },
            ].map(({ step, icon: Icon, title, desc }) => (
              <motion.div key={step} variants={item} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-xs font-bold text-primary mb-1 tracking-widest">{step}</div>
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-black mb-4">Students Love StudyFlow</h2>
            <p className="text-muted-foreground">Join thousands of students who study smarter every day.</p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {testimonials.map(({ name, role, text, stars }) => (
              <motion.div
                key={name}
                variants={item}
                className="p-6 rounded-2xl border border-border bg-card"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">"{text}"</p>
                <div>
                  <div className="font-semibold text-sm">{name}</div>
                  <div className="text-xs text-muted-foreground">{role}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gradient-to-br from-primary/10 via-background to-secondary/10 border-t border-border/50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-5xl font-black mb-6">
            Ready to <span className="gradient-text">Level Up?</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-10">Start studying smarter today. Your AI study companion is ready.</p>
          <Link href="/dashboard">
            <button data-testid="button-cta-final" className="group inline-flex items-center gap-2 bg-primary text-primary-foreground px-10 py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-all glow-orange">
              Start for Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Zap className="w-3 h-3 text-white" />
          </div>
          <span className="font-bold">StudyFlow AI</span>
        </div>
        <p>&copy; 2026 StudyFlow AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
