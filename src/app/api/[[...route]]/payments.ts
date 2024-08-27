import crypto from "crypto";

import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { verifyAuth } from "@hono/auth-js";
import { razorpay } from "@/lib/razorpay";
import { db } from "@/db/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const app = new Hono()
  .post(
    "/verify-payment",
    verifyAuth(),
    zValidator(
      "json",
      z.object({
        paymentId: z.string(),
        orderId: z.string(),
        signature: z.string(),
      })
    ),
    async (c) => {
      const session = c.get("authUser");

      if (!session.token?.email) return c.json({ error: "unauthorized" }, 401);

      //verify the payment
      const { paymentId, orderId, signature } = c.req.valid("json");

      const crypt = crypto.createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET!
      );
      crypt.update(`${orderId}|${paymentId}`);
      const digest = crypt.digest("hex");

      const isVerified = digest === signature;

      if (!isVerified)
        return c.json({ error: "payment verification failed" }, 400);

      await db
        .update(users)
        .set({ isPremium: true })
        .where(eq(users.email, session.token.email));

      return c.json({ data: isVerified }, 200);
    }
  )
  .post(
    "/create-order",
    verifyAuth(),
    zValidator(
      "json",
      z.object({
        planId: z.string(),
      })
    ),
    async (c) => {
      const session = c.get("authUser");

      if (!session.token?.email) return c.json({ error: "unauthorized" }, 401);

      let options = {
        amount: 999,
        currency: "INR",
        receipt: "order_rcptid_11",
      };

      const order = await razorpay.orders.create(options);

      if (!order) return c.json({ error: "order creation failed" }, 500);

      return c.json({ data: order }, 200);
    }
  );

export default app;
