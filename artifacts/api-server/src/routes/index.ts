import { Router, type IRouter } from "express";
import healthRouter from "./health";
import notesRouter from "./notes";
import quizzesRouter from "./quizzes";
import tasksRouter from "./tasks";
import dashboardRouter from "./dashboard";
import geminiRouter from "./gemini/index";

const router: IRouter = Router();

router.use(healthRouter);
router.use(geminiRouter);
router.use(notesRouter);
router.use(quizzesRouter);
router.use(tasksRouter);
router.use(dashboardRouter);

export default router;
