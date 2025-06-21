import { RateLimiter } from './rate_limiter.js';

export default {
  async fetch(request, env, ctx) {
    const jwtHeader = request.headers.get("X-Test-RateLimit");

    if (!jwtHeader) {
      return fetch(request);
    }

    const jwt = jwtHeader.trim();
    const sub = getSubFromJwt(jwt);
    if (!sub) {
      return new Response("Unauthorized: Invalid JWT", { status: 401 });
    }

    const id = env.RateLimiter.idFromName(sub);
    const stub = env.RateLimiter.get(id);

    const response = await stub.fetch("https://ratelimiter/ratecheck");

    if (response.status === 429) {
      return response;
    }

    return fetch(request);
  }
};

function getSubFromJwt(jwt) {
  try {
    const [, payload] = jwt.split(".");
    if (!payload) return null;

    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const data = JSON.parse(json);
    return data.sub || null;
  } catch {
    return null;
  }
}

export { RateLimiter } from './rate_limiter.js';
