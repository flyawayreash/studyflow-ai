import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, quizzesTable, quizQuestionsTable } from "@workspace/db";
import {
  CreateQuizBody,
  GetQuizParams,
  DeleteQuizParams,
  GenerateQuizBody,
} from "@workspace/api-zod";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

router.get("/quizzes", async (_req, res): Promise<void> => {
  const quizzes = await db
    .select()
    .from(quizzesTable)
    .orderBy(quizzesTable.createdAt);

  const quizzesWithCount = await Promise.all(
    quizzes.map(async (quiz) => {
      const questions = await db
        .select()
        .from(quizQuestionsTable)
        .where(eq(quizQuestionsTable.quizId, quiz.id));
      return { ...quiz, questionCount: questions.length };
    })
  );

  res.json(quizzesWithCount);
});

router.post("/quizzes", async (req, res): Promise<void> => {
  const parsed = CreateQuizBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [quiz] = await db
    .insert(quizzesTable)
    .values(parsed.data)
    .returning();
  res.status(201).json({ ...quiz, questionCount: 0 });
});

router.get("/quizzes/:id", async (req, res): Promise<void> => {
  const params = GetQuizParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [quiz] = await db
    .select()
    .from(quizzesTable)
    .where(eq(quizzesTable.id, params.data.id));
  if (!quiz) {
    res.status(404).json({ error: "Quiz not found" });
    return;
  }
  const questions = await db
    .select()
    .from(quizQuestionsTable)
    .where(eq(quizQuestionsTable.quizId, quiz.id));

  res.json({ ...quiz, questionCount: questions.length, questions });
});

router.delete("/quizzes/:id", async (req, res): Promise<void> => {
  const params = DeleteQuizParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [quiz] = await db
    .delete(quizzesTable)
    .where(eq(quizzesTable.id, params.data.id))
    .returning();
  if (!quiz) {
    res.status(404).json({ error: "Quiz not found" });
    return;
  }
  res.sendStatus(204);
});

router.post("/quizzes/generate", async (req, res): Promise<void> => {
  const parsed = GenerateQuizBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { topic, numQuestions = 5, difficulty = "medium" } = parsed.data;

  const completion = await openai.chat.completions.create({
    model: "gpt-5-mini",
    max_completion_tokens: 8192,
    messages: [
      {
        role: "system",
        content: `You are an expert educator. Generate a quiz with exactly ${numQuestions} multiple choice questions about the given topic at ${difficulty} difficulty. 
Return ONLY a valid JSON object with this structure:
{
  "title": "Quiz title",
  "questions": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Brief explanation"
    }
  ]
}
correctAnswer is a 0-based index into options.`,
      },
      {
        role: "user",
        content: `Generate a ${difficulty} quiz about: ${topic}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed2 = JSON.parse(raw) as {
    title: string;
    questions: Array<{
      question: string;
      options: string[];
      correctAnswer: number;
      explanation?: string;
    }>;
  };

  const [quiz] = await db
    .insert(quizzesTable)
    .values({ title: parsed2.title, subject: topic })
    .returning();

  const questions = await db
    .insert(quizQuestionsTable)
    .values(
      parsed2.questions.map((q) => ({
        quizId: quiz.id,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation ?? null,
      }))
    )
    .returning();

  res.status(201).json({ ...quiz, questionCount: questions.length, questions });
});

export default router;
