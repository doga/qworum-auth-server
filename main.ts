
import { Application, Router, Context } from 'oak';
import { cors } from './lib/cors.mts';
import { apiKeyChecker } from './lib/api-key.mts';

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

app.use(cors);
app.use(apiKeyChecker);

app.use(router.routes());

await app.listen({ port });
