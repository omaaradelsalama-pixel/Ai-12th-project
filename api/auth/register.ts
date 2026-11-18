import type { VercelRequest, VercelResponse } from "@vercel/node";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { supabase } from "../_lib/config";

const schema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(72)
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!supabase) return res.status(500).json({ error: "Server configuration is missing" });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid registration information", details: parsed.error.issues.map(i => ({ field: i.path.join("."), message: i.message })) });
  try {
    const email = parsed.data.email.toLowerCase();
    const password_hash = await bcrypt.hash(parsed.data.password, 12);
    const { data, error } = await supabase.from("users")
      .insert({ email, password_hash, role: "player" })
      .select("id,email,role,created_at").single();
    if (error?.code === "23505") return res.status(409).json({ error: "An account with this email already exists" });
    if (error) { console.error("Register database error:", error.message); return res.status(500).json({ error: "Could not create account" }); }
    return res.status(201).json({ message: "Account created successfully", user: data });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ error: "An unexpected error occurred" });
  }
}
