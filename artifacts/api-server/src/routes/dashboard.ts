import { Router, type IRouter } from "express";
import { db, notesTable, quizzesTable, tasksTable } from "@workspace/db";
import { conversations } from "@workspace/db";
import { count, eq, desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/dashboard/stats", async (_req, res): Promise<void> => {
  const [notesCount] = await db.select({ count: count() }).from(notesTable);
  const [quizzesCount] = await db.select({ count: count() }).from(quizzesTable);
  const [totalTasks] = await db.select({ count: count() }).from(tasksTable);
  const [completedTasks] = await db
    .select({ count: count() })
    .from(tasksTable)
    .where(eq(tasksTable.completed, true));
  const [convoCount] = await db.select({ count: count() }).from(conversations);

  // Recent notes
  const recentNotes = await db
    .select({ title: notesTable.title, createdAt: notesTable.createdAt })
    .from(notesTable)
    .orderBy(desc(notesTable.createdAt))
    .limit(3);

  // Recent quizzes
  const recentQuizzes = await db
    .select({ title: quizzesTable.title, createdAt: quizzesTable.createdAt })
    .from(quizzesTable)
    .orderBy(desc(quizzesTable.createdAt))
    .limit(2);

  // Recent tasks
  const recentTasks = await db
    .select({ title: tasksTable.title, createdAt: tasksTable.createdAt })
    .from(tasksTable)
    .orderBy(desc(tasksTable.createdAt))
    .limit(2);

  const recentActivity = [
    ...recentNotes.map((n) => ({ type: "note" as const, title: n.title, createdAt: n.createdAt.toISOString() })),
    ...recentQuizzes.map((q) => ({ type: "quiz" as const, title: q.title, createdAt: q.createdAt.toISOString() })),
    ...recentTasks.map((t) => ({ type: "task" as const, title: t.title, createdAt: t.createdAt.toISOString() })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  res.json({
    totalNotes: notesCount?.count ?? 0,
    totalQuizzes: quizzesCount?.count ?? 0,
    totalTasks: totalTasks?.count ?? 0,
    completedTasks: completedTasks?.count ?? 0,
    pendingTasks: (totalTasks?.count ?? 0) - (completedTasks?.count ?? 0),
    totalConversations: convoCount?.count ?? 0,
    recentActivity,
  });
});

export default router;
