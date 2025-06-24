import { RateLimiter } from './rate_limiter.js';

export default {
  async fetch(request, env, ctx) {
    /*const jwtHeader = request.headers.get("X-Test-RateLimit");

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

    return fetch(request);*/

   
const url = new URL(request.url);

    if (request.method === 'POST' && url.pathname.endsWith('/RequestInvoice')) {
      const contentType = request.headers.get('content-type') || '';
      if (contentType.includes('application/x-www-form-urlencoded')) {
        const bodyText = await request.clone().text(); // Clone before reading
        const params = new URLSearchParams(bodyText);

        const facilityID = params.get('TeeTime.FacilityID');
        const amount = parseFloat(params.get('TeeTime.Amount'));

        if (facilityID === '9092' && amount < 2.0) {
          return new Response('Bad Request: Invalid FacilityID and Amount', { status: 400 });
        }

        // Rebuild the request with the original body
        const newRequest = new Request(request.url, {
          method: request.method,
          headers: request.headers,
          body: bodyText,
          redirect: request.redirect,
        });

        return fetch(newRequest);
      }
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
