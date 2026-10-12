import { Request, Response } from "express";
import { createHash } from "crypto";
import prisma from "../config/prisma";

/**
 * Build a privacy-safe fingerprint from IP + User-Agent.
 * We never store raw IP or UA — just their SHA-256 hash.
 */
function buildFingerprint(req: Request): string {
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() ||
    req.socket?.remoteAddress ||
    "unknown";
  const ua = req.headers["user-agent"] || "unknown";
  return createHash("sha256").update(`${ip}::${ua}`).digest("hex");
}

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

/**
 * POST /api/visitors/ping
 * Called once per page load. Upserts a PageVisitor row keyed by
 * (fingerprint, day). If new for today → increments VisitorCounter.
 * Returns { total, today } counts.
 */
export async function pingVisitor(req: Request, res: Response) {
  try {
    const fingerprint = buildFingerprint(req);
    const day = todayUTC();

    // Upsert: create if first visit today, update lastSeenAt otherwise
    const existing = await prisma.pageVisitor.findUnique({
      where: { fingerprint_day: { fingerprint, day } },
    });

    if (!existing) {
      // New unique visitor today — insert row and bump cumulative counter atomically
      await prisma.$transaction([
        prisma.pageVisitor.create({ data: { fingerprint, day } }),
        prisma.visitorCounter.upsert({
          where: { id: 1 },
          create: { id: 1, total: 1 },
          update: { total: { increment: 1 } },
        }),
      ]);
    } else {
      // Refresh lastSeenAt so we know they are still "active"
      await prisma.pageVisitor.update({
        where: { fingerprint_day: { fingerprint, day } },
        data: { lastSeenAt: new Date() },
      });
    }

    // Counts
    const [counter, todayCount] = await Promise.all([
      prisma.visitorCounter.findUnique({ where: { id: 1 } }),
      prisma.pageVisitor.count({ where: { day } }),
    ]);

    return res.json({
      total: counter?.total ?? 1,
      today: todayCount,
    });
  } catch (err) {
    console.error("[visitors/ping]", err);
    return res.status(500).json({ error: "Failed to track visitor" });
  }
}

/**
 * GET /api/visitors
 * Returns visitor stats without registering a new visit.
 */
export async function getVisitorStats(_req: Request, res: Response) {
  try {
    const day = todayUTC();
    const [counter, todayCount] = await Promise.all([
      prisma.visitorCounter.findUnique({ where: { id: 1 } }),
      prisma.pageVisitor.count({ where: { day } }),
    ]);

    return res.json({
      total: counter?.total ?? 0,
      today: todayCount,
    });
  } catch (err) {
    console.error("[visitors/get]", err);
    return res.status(500).json({ error: "Failed to fetch visitor stats" });
  }
}
