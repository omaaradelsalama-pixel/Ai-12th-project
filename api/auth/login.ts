import type { VercelRequest, VercelResponse } from "@vercel/node";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { supabase } from "../_lib/config";
import { setSessionCookie, signToken } from "../_lib/auth";

const schema = z.object({ email: z.string().trim().email().max(254), password: z.string().min(1).max(72) });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!supabase) return res.status(500).json({ error: "Server configuration is missing" });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Please provide a valid email and password" });
  try {
    const { data: user, error } = await supabase.from("users").select("id,email,password_hash,role").eq("email", parsed.data.email.toLowerCase()).maybeSingle();
    if (error) throw error;
    if (!user || !(await bcrypt.compare(parsed.data.password, user.password_hash))) return res.status(401).json({ error: "Email or password is incorrect" });
    const token = await signToken({ id: user.id, email: user.email, role: user.role });
    setSessionCookie(res, token);
    return res.status(200).json({ message: "Login successful", user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Could not log in" });
  }
}
