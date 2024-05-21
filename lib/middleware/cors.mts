import { Middleware, Context, Next } from 'oak';

// CORS options
const 
allowedMethods = [
  'POST', 
  // 'PUT', 'DELETE', 'GET', 
],
allowedHeaders = ['Content-Type', 'Authorization'];

export const cors: Middleware = async (ctx: Context, next: Next) => {
  /**
   * CORS option: Origin-based access restriction.
   * Value is space-separated origin URLs. 
   * @example 'https://www.example.com https://api.example.com'
   **/
  const allowedOriginsEnv = Deno.env.get('ALLOWED_ORIGINS'); 

  if (allowedOriginsEnv) {
    const
    allowedOrigins = allowedOriginsEnv.replaceAll(/\s+/g, ' ').split(' ').filter(s => s.length > 0),
    origin         = ctx.request.headers.get("Origin");

    if (origin && allowedOrigins.includes(origin)) {
      ctx.response.headers.set("Access-Control-Allow-Origin", origin);
    } else {
      ctx.response.status = 403; // Forbidden
      ctx.response.body = { message: `Forbidden request origin: ${origin}` };
      return;
    }
  } else {
    ctx.response.headers.set("Access-Control-Allow-Origin", '*');
  }

  ctx.response.headers.set("Access-Control-Allow-Methods", allowedMethods.join(", "));
  ctx.response.headers.set("Access-Control-Allow-Headers", allowedHeaders.join(", "));

  // Preflight request handling (optional)
  if (ctx.request.method === "OPTIONS") {
    ctx.response.status = 200;
    return;
  }

  await next();
};
