import { db } from "@/db/db";
import { users } from "@/db/schema";
import { signStreamUrl } from "@/lib/sign-stream-url";
import { verifyAuth } from "@hono/auth-js";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

const app = new Hono().get(
  "/get-signed-url",
  verifyAuth(),
  zValidator(
    "query",
    z.object({
      iFrameUrl: z.string(),
    })
  ),
  async (c) => {
    const session = c.get("authUser");
    const { iFrameUrl } = c.req.valid("query");

    if (!session.token?.email) return c.json({ error: "unauthorized" }, 401);

    // check if user is premium
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, session.token.email));

    if (user.length === 0) return c.json({ error: "user not found" }, 404);

    if (!user[0].isPremium)
      return c.json({ error: "user is not premium" }, 403);

    // logic for signed url
    const signedUrl = signStreamUrl(iFrameUrl, process.env.BUNNY_SECURITY_KEY!);

    if (!signedUrl) return c.json({ error: "error signing url" }, 400);

    return c.json({ data: signedUrl }, 200);
  }
);

export default app;
