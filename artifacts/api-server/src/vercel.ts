// Vercel serverless entry — exports the Express app without starting a server.
// The api/index.js bundle (built by build.vercel.mjs) re-exports this default.
import app from "./app";

export default app;
