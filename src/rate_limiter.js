export class RateLimiter {
    constructor(state, env) {
      this.state = state;
      this.env = env;
      this.windowMs = 60_000; // 1 minute
      this.limit = 5;
    }
  
    async fetch(request) {
      const now = Date.now();
      const data = await this.state.storage.get("rate") || {
        count: 0,
        windowStart: now
      };
  
      if (now - data.windowStart > this.windowMs) {
        data.count = 1;
        data.windowStart = now;
      } else {
        data.count += 1;
      }
  
      await this.state.storage.put("rate", data);
  
      if (data.count > this.limit) {
        return new Response("Too Many Requests", { status: 429 });
      }
  
      return new Response("OK", { status: 200 });
    }
  }
  