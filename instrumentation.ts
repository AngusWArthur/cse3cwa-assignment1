// instrumentation.ts
export async function register() {
  // This runs once on the server at startup (dev/production)
  console.log("[instrumentation] Server boot at", new Date().toISOString());
}
