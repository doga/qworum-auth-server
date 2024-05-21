import { Middleware } from 'oak';

// Define CORS options (customize as needed)
// const allowedOrigins = ["https://www.example.com", "https://api.example.com"];
const allowedMethods = [
  'POST', 
  // 'PUT', 'DELETE', 'GET', 
];
const allowedHeaders = ['Content-Type', 'Authorization'];

export const corsMiddleware: Middleware = async (ctx, next) => {
  // const origin = ctx.request.headers.get("Origin");

  // if (origin && allowedOrigins.includes(origin)) {
  //   ctx.response.headers.set("Access-Control-Allow-Origin", origin);
  // }
  ctx.response.headers.set("Access-Control-Allow-Origin", '*');

  ctx.response.headers.set("Access-Control-Allow-Methods", allowedMethods.join(", "));
  ctx.response.headers.set("Access-Control-Allow-Headers", allowedHeaders.join(", "));

  // Preflight request handling (optional)
  if (ctx.request.method === "OPTIONS") {
    ctx.response.status = 200;
    return;
  }

  await next();
};
