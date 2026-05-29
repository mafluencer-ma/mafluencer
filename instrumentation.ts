export async function register() {
  // Only schedule in Node.js runtime, not Edge, and not during builds
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.NODE_ENV === "production") {
    const { scheduleMetricsTracking } = await import("./lib/track-metrics");
    scheduleMetricsTracking();
  }
}
