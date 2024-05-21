import { Application, Router, Context, Next } from 'oak';

import { PasswordDigest } from "./lib/password-digest.mts";
// import type { PasswordDigestKv } from "./lib/password-digest.mts";

// import { Timestamps } from "./lib/timestamps.mts";
// import type { TimestampsKv } from "./lib/timestamps.mts";

import {User} from './lib/user.mts';
import type {UserKv} from './lib/user.mts';

type UserCredentials = {
  username: string,
  password: string
};

type UserInfo = {
  username: string,
  id: string,
  urn: string,
}

const
port = parseInt(Deno.env.get('PORT') || '3000'),
kv = await Deno.openKv(),
app = new Application(),

apiKeyChecker = async (ctx: Context, next: Next) => {
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
},

router = new Router()
.post("/sign-up", async (ctx: Context) => {
  try {
    const
    { username, password } = await ctx.request.body.json() as UserCredentials,
    id = await User.idFromUsername(username),
    userKv = await kv.get(['user', id]);

    if(userKv.value)throw new TypeError('username already exists');

    const
    passwordDigest = await PasswordDigest.build(password),
    user = new User(username, passwordDigest);

    await kv.set(['user', id], user.toKv());

    const
    urn = await user.getUrn(),
    userInfo: UserInfo = {username, id, urn},
    body = { user: userInfo, message: 'User created successfully' };

    ctx.response.status = 201;
    ctx.response.body = body;
  } catch (error) {
    ctx.response.status = 400;
    ctx.response.body = { message: `Bad sign-up request: ${error}` };
  }
})
.post("/sign-in", async (ctx: Context) => {
  try {
    const
    { username, password } = await ctx.request.body.json() as UserCredentials,
    id = await User.idFromUsername(username),
    userKv = await kv.get(['user', id]);

    if(!userKv.value)throw new TypeError('unknown username');
    
    const
    user = User.fromKv(userKv.value as UserKv),
    passwordDigest = PasswordDigest.build(password, user.passwordDigest.hashFunction);
    
    if(user.passwordDigest.digest !== (await passwordDigest).digest)throw new TypeError("passwords don't match");

    const
    urn = await user.getUrn(),
    userInfo: UserInfo = {username, id, urn},
    body = { user: userInfo, message: 'User has signed in successfully' };

    ctx.response.status = 200;
    ctx.response.body = body;
  } catch (error) {
    ctx.response.status = 400;
    ctx.response.body = { message: `Bad sign-in request: ${error}` };
  }
});

app.use(apiKeyChecker);

app.use(router.routes());

await app.listen({ port });

// Deno.serve(async (_request: Request) => {
//   const 
//   username = 'user_User.',
//   password = await PasswordDigest.build('Aa9$Aa9$'),
//   user = new User(username, password),
//   userKv = user.toKv(),
//   userId = await user.getId();

//   // set
//   await kv.set(['user', userId], userKv);

//   // get
//   const
//   idToRead = await User.idFromUsername(username),
//   value = await kv.get(['user', idToRead]),
//   user2 = User.fromKv((value.value as unknown) as UserKv),
//   userId2 = await user2.getId(),
//   urn = await user2.getUrn()
//   ;
//   console.debug(value.value);

//   return new Response(`
//     username: ${username}
//     id: ${userId2}
//     urn: ${urn}
//     value read:
//       ${JSON.stringify(value.value as UserKv)}!`);
// });
