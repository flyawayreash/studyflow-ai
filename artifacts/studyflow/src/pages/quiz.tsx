import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useListQuizzes, useGenerateQuiz, useGetQuiz, useDeleteQuiz,
  getListQuizzesQueryKey, getGetQuizQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Brain, Plus, Trash2, Play, CheckCircle, XCircle, Trophy, RotateCcw, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Quiz {
  id: number;
  title: string;
  subject?: string | null;
  questionCount: number;
  createdAt: string;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string | null;
}

export default function QuizPage() {
  const queryClient = useQueryClient();
  const { data: quizzes = [], isLoading } = useListQuizzes();
  const generateQuiz = useGenerateQuiz();
  const deleteQuiz = useDeleteQuiz();

  const [topic, setTopic] = useState("");
  const [numQ, setNumQ] = useState(5);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [showGenForm, setShowGenForm] = useState(false);
  const [activeQuizId, setActiveQuizId] = useState<number | null>(null);
  const [playMode, setPlayMode] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const { data: activeQuiz } = useGetQuiz(activeQuizId!, {
    query: { enabled: !!activeQuizId, queryKey: getGetQuizQueryKey(activeQuizId!) },
  });

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    const quiz = await generateQuiz.mutateAsync({ data: { topic: topic.trim(), numQuestions: numQ, difficulty } });
    queryClient.invalidateQueries({ queryKey: getListQuizzesQueryKey() });
    setShowGenForm(false);
    setTopic("");
    setActiveQuizId(quiz.id);
    setPlayMode(false);
    setAnswers({});
    setSubmitted(false);
  };

  const handleStartQuiz = () => {
    setPlayMode(true);
    setAnswers({});
    setSubmitted(false);
  };

  const handleAnswer = (qIdx: number, optIdx: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const score = activeQuiz
    ? (activeQuiz as any).questions?.filter((q: QuizQuestion, i: number) => answers[i] === q.correctAnswer).length ?? 0
    : 0;
  const total = (activeQuiz as any)?.questions?.length ?? 0;

  return (
    <div className="flex h-full">
      {/* Quiz list */}
      <div className="w-64 shrink-0 border-r border-border bg-card/50 flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-bold">Quizzes</span>
            <button
              onClick={() => setShowGenForm(true)}
              data-testid="button-new-quiz"
              className="w-7 h-7 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center"
            >
              <Plus className="w-3.5 h-3.5 text-primary" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isLoading ? (
            <div className="space-y-2 p-2">{[1,2,3].map(i => <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />)}</div>
          ) : quizzes.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-foreground">No quizzes yet. Generate one!</div>
          ) : (
            (quizzes as Quiz[]).map((quiz) => (
              <motion.div
                key={quiz.id}
                whileHover={{ x: 2 }}
                onClick={() => { setActiveQuizId(quiz.id); setPlayMode(false); setAnswers({}); setSubmitted(false); }}
                data-testid={`quiz-item-${quiz.id}`}
                className={cn(
                  "group p-3 rounded-lg cursor-pointer transition-all",
                  activeQuizId === quiz.id ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50"
                )}
              >
                <div className="flex items-start justify-between gap-1">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold truncate">{quiz.title}</div>
                    {quiz.subject && <div className="text-xs text-primary mt-0.5">{quiz.subject}</div>}
                    <div className="text-xs text-muted-foreground mt-1">{quiz.questionCount} questions</div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteQuiz.mutate({ id: quiz.id }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListQuizzesQueryKey() }); if (activeQuizId === quiz.id) setActiveQuizId(null); } }); }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-destructive transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Quiz content */}
      <div className="flex-1 overflow-auto p-6">
        {/* Generate form */}
        <AnimatePresence>
          {showGenForm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-5 rounded-2xl border border-secondary/20 bg-secondary/5"
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-secondary" />
                <h3 className="font-bold">Generate Quiz with AI</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Topic (e.g. Photosynthesis)"
                  data-testid="input-quiz-topic"
                  className="sm:col-span-3 px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-secondary"
                />
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Questions</label>
                  <select value={numQ} onChange={(e) => setNumQ(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm">
                    {[3,5,8,10].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Difficulty</label>
                  <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as "easy"|"medium"|"hard")} data-testid="select-difficulty" className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm">
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleGenerate}
                  disabled={generateQuiz.isPending || !topic.trim()}
                  data-testid="button-generate-quiz"
                  className="flex items-center gap-2 bg-secondary text-secondary-foreground px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
                >
                  {generateQuiz.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                  {generateQuiz.isPending ? "Generating..." : "Generate"}
                </motion.button>
                <button onClick={() => setShowGenForm(false)} className="px-4 py-2.5 rounded-lg border border-border text-sm hover:bg-muted/50 transition-all">Cancel</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!activeQuizId ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center mb-4">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-2">Quiz Generator</h2>
            <p className="text-muted-foreground text-sm max-w-xs mb-6">Generate AI-powered quizzes on any topic and test your knowledge interactively.</p>
            <button onClick={() => setShowGenForm(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-all">
              <Sparkles className="w-4 h-4" /> Generate a Quiz
            </button>
          </div>
        ) : !playMode ? (
          activeQuiz && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold">{activeQuiz.title}</h2>
                  {activeQuiz.subject && <div className="text-sm text-primary mt-0.5">{activeQuiz.subject}</div>}
                  <div className="text-sm text-muted-foreground mt-1">{(activeQuiz as any).questions?.length} questions</div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleStartQuiz}
                  data-testid="button-start-quiz"
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-all"
                >
                  <Play className="w-4 h-4" /> Start Quiz
                </motion.button>
              </div>
              <div className="space-y-3">
                {(activeQuiz as any).questions?.map((q: QuizQuestion, i: number) => (
                  <div key={q.id} className="p-4 rounded-xl border border-border bg-card">
                    <div className="text-sm font-medium mb-1">Q{i + 1}. {q.question}</div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {q.options.map((opt, j) => (
                        <span key={j} className={cn("px-2 py-1 rounded-lg text-xs border", j === q.correctAnswer ? "border-green-500/30 bg-green-500/10 text-green-500" : "border-border text-muted-foreground")}>
                          {String.fromCharCode(65 + j)}. {opt}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )
        ) : submitted ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-12 text-center">
            <div className={cn("w-20 h-20 rounded-2xl flex items-center justify-center mb-4", score >= total * 0.7 ? "bg-gradient-to-br from-green-500 to-green-400" : "bg-gradient-to-br from-orange-500 to-orange-400")}>
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-black mb-2">{score}/{total}</h2>
            <p className="text-muted-foreground mb-2">{score >= total * 0.7 ? "Excellent work!" : score >= total * 0.5 ? "Good effort — keep studying!" : "Keep practicing — you've got this!"}</p>
            <div className="text-sm text-muted-foreground mb-8">{Math.round((score / total) * 100)}% correct</div>
            <button onClick={() => { setPlayMode(false); setAnswers({}); setSubmitted(false); }} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-all">
              <RotateCcw className="w-4 h-4" /> Try Again
            </button>
          </motion.div>
        ) : (
          activeQuiz && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">{activeQuiz.title}</h2>
                <span className="text-sm text-muted-foreground">{Object.keys(answers).length}/{total} answered</span>
              </div>
              <div className="space-y-5">
                {(activeQuiz as any).questions?.map((q: QuizQuestion, i: number) => (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="p-5 rounded-xl border border-border bg-card"
                  >
                    <div className="text-sm font-semibold mb-3">Q{i + 1}. {q.question}</div>
                    <div className="space-y-2">
                      {q.options.map((opt, j) => (
                        <button
                          key={j}
                          onClick={() => handleAnswer(i, j)}
                          data-testid={`option-${i}-${j}`}
                          className={cn(
                            "w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-all",
                            answers[i] === j ? "border-primary bg-primary/10 text-primary font-medium" : "border-border hover:border-primary/40 hover:bg-muted/30"
                          )}
                        >
                          <span className="font-bold mr-2">{String.fromCharCode(65 + j)}.</span> {opt}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSubmitted(true)}
                  disabled={Object.keys(answers).length < total}
                  data-testid="button-submit-quiz"
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-40 transition-all"
                >
                  <CheckCircle className="w-4 h-4" /> Submit Quiz
                </motion.button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
