import type { VercelRequest, VercelResponse } from "@vercel/node";
import { jwtVerify, SignJWT } from "jose";
import { jwtSecret } from "./config";

const cookieName = "gofish_session";
const secret = () => {
  if (!jwtSecret || jwtSecret.length < 32) throw new Error("JWT_SECRET must be at least 32 characters");
  return new TextEncoder().encode(jwtSecret);
};

export async function signToken(user: { id: string; email: string; role: string }) {
  return new SignJWT({ email: user.email, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(secret());
}

export function setSessionCookie(res: VercelResponse, token: string) {
  res.setHeader("Set-Cookie", `${cookieName}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=900`);
}

export function clearSessionCookie(res: VercelResponse) {
  res.setHeader("Set-Cookie", `${cookieName}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`);
}

export async function requireUser(req: VercelRequest, res: VercelResponse) {
  const raw = req.headers.cookie?.split(";").map(v => v.trim()).find(v => v.startsWith(cookieName + "="));
  const token = raw?.slice(cookieName.length + 1);
  if (!token) { res.status(401).json({ error: "Authentication required" }); return null; }
  try {
    const { payload } = await jwtVerify(token, secret());
    return { id: String(payload.sub), email: String(payload.email), role: String(payload.role) };
  } catch {
    res.status(401).json({ error: "Session expired or invalid" });
    return null;
  }
}
