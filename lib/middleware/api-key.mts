import { Middleware, Context, Next } from 'oak';

export const apiKeyChecker: Middleware = async (ctx: Context, next: Next) => {
  try {
    const apiKey = Deno.env.get('API_KEY');
    if(!apiKey){
      await next(); return;
    }

    const authorization = ctx.request.headers.get('Authorization');
    if(!authorization)throw new Error('Missing Authorization header');

    const
    bearerAuthRe = /^\s*Bearer\s+(?<apiKey>\S+)\s*$/,
    match = authorization.match(bearerAuthRe);
    
    if(!match)throw new Error('Missing API key');
    if(match?.groups?.apiKey !== apiKey)throw new Error('API keys do not match');

    await next();
  } catch (error) {
    ctx.response.status = 401;
    ctx.response.body = { message: `Unauthorized request: ${error}` };
  }
}