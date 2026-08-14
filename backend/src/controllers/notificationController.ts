import { Response, NextFunction } from 'express';
import nodemailer from 'nodemailer';
import prisma from '../config/prisma';
import { env } from '../config/env';
import { AuthenticatedRequest } from '../middleware/auth';

// ─── Nodemailer Transporter ────────────────────────────────────────────────────
function createTransporter() {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
}

// ─── GET /admin/api/notifications ─────────────────────────────────────────────
export const getNotifications = async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const notifications = await (prisma as any).notification.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        recipients: { select: { id: true, email: true, name: true, status: true, sentAt: true } },
      },
    });
    res.json(notifications);
  } catch (err) { next(err); }
};

// ─── GET /admin/api/subscribers ───────────────────────────────────────────────
export const getSubscribers = async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const subscribers = await (prisma as any).subscriber.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(subscribers);
  } catch (err) { next(err); }
};

// ─── POST /admin/api/subscribers ──────────────────────────────────────────────
export const addSubscriber = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { email, name, source } = req.body;
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({ error: 'Valid email is required.' });
      return;
    }
    const sub = await (prisma as any).subscriber.upsert({
      where: { email: email.trim().toLowerCase() },
      update: { name: name?.trim() || '', active: true, source: source || 'manual' },
      create: { email: email.trim().toLowerCase(), name: name?.trim() || '', source: source || 'manual' },
    });
    res.status(201).json(sub);
  } catch (err) { next(err); }
};

// ─── PATCH /admin/api/subscribers/:id ─────────────────────────────────────────
export const updateSubscriber = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const { active, name } = req.body;
    const sub = await (prisma as any).subscriber.update({
      where: { id },
      data: {
        ...(active !== undefined ? { active: Boolean(active) } : {}),
        ...(name !== undefined ? { name: String(name).trim() } : {}),
      },
    });
    res.json(sub);
  } catch (err) { next(err); }
};

// ─── DELETE /admin/api/subscribers/:id ────────────────────────────────────────
export const deleteSubscriber = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    await (prisma as any).subscriber.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) { next(err); }
};

// ─── POST /admin/api/notifications/send ───────────────────────────────────────
export const sendNotification = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { subject, body, channel, targetType, recipientEmails } = req.body;
    const adminUsername = req.admin?.username || 'admin';

    if (!subject?.trim() || !body?.trim()) {
      res.status(400).json({ error: 'Subject and body are required.' });
      return;
    }
    if (!['email', 'in-app', 'both'].includes(channel)) {
      res.status(400).json({ error: 'Invalid channel. Use "email", "in-app", or "both".' });
      return;
    }

    // Determine recipients
    let emails: { email: string; name: string }[] = [];
    if (targetType === 'all') {
      const subs = await (prisma as any).subscriber.findMany({ where: { active: true } });
      emails = subs.map((s: any) => ({ email: s.email, name: s.name || '' }));
    } else if (targetType === 'selected' && Array.isArray(recipientEmails)) {
      emails = recipientEmails.map((e: string) => ({
        email: e.trim().toLowerCase(),
        name: '',
      })).filter((r: { email: string }) => r.email.includes('@'));
    }

    if (emails.length === 0) {
      res.status(400).json({ error: 'No valid recipients. Add subscribers first.' });
      return;
    }

    // Create the notification record
    const notification = await (prisma as any).notification.create({
      data: {
        subject: subject.trim(),
        body: body.trim(),
        channel,
        targetType: targetType || 'all',
        sentBy: adminUsername,
        status: 'sent',
        recipients: {
          create: emails.map((r) => ({
            email: r.email,
            name: r.name,
            status: 'pending',
          })),
        },
      },
      include: { recipients: true },
    });

    // Send emails if channel is "email" or "both" and SMTP is configured
    let sentCount = 0;
    let failedCount = 0;

    if (channel === 'email' || channel === 'both') {
      const transporter = createTransporter();
      if (transporter) {
        for (const recipient of notification.recipients) {
          try {
            await transporter.sendMail({
              from: env.SMTP_FROM,
              to: recipient.email,
              subject: subject.trim(),
              html: buildEmailHtml(subject.trim(), body.trim(), recipient.name),
            });

            await (prisma as any).notificationRecipient.update({
              where: { id: recipient.id },
              data: { status: 'sent', sentAt: new Date() },
            });
            sentCount++;
          } catch {
            await (prisma as any).notificationRecipient.update({
              where: { id: recipient.id },
              data: { status: 'failed' },
            });
            failedCount++;
          }
        }
      } else {
        // SMTP not configured — mark as "simulated sent"
        await (prisma as any).notificationRecipient.updateMany({
          where: { notificationId: notification.id },
          data: { status: 'sent', sentAt: new Date() },
        });
        sentCount = emails.length;
      }
    } else {
      // in-app only: mark all as sent
      await (prisma as any).notificationRecipient.updateMany({
        where: { notificationId: notification.id },
        data: { status: 'sent', sentAt: new Date() },
      });
      sentCount = emails.length;
    }

    res.status(201).json({
      success: true,
      notification,
      summary: { total: emails.length, sent: sentCount, failed: failedCount },
    });
  } catch (err) { next(err); }
};

// ─── DELETE /admin/api/notifications/:id ──────────────────────────────────────
export const deleteNotification = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    await (prisma as any).notification.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) { next(err); }
};

// ─── Email HTML Builder ────────────────────────────────────────────────────────
function buildEmailHtml(subject: string, body: string, name?: string): string {
  const greeting = name ? `Hi ${name},` : 'Hello,';
  const bodyHtml = body.replace(/\n/g, '<br/>');
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#0d0e18;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#111320;border-radius:16px;overflow:hidden;border:1px solid rgba(6,182,212,0.2);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0d0e18 0%,#141627 100%);padding:32px 40px;border-bottom:1px solid rgba(6,182,212,0.15);text-align:center;">
      <div style="font-size:22px;font-weight:900;color:#f4f4f5;letter-spacing:-0.03em;">
        D-Kode <span style="background:linear-gradient(135deg,#06b6d4,#00e5a0);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">Era</span>
      </div>
      <div style="font-size:10px;color:#06b6d4;letter-spacing:0.14em;margin-top:4px;font-weight:700;">NOTIFICATION</div>
    </div>
    <!-- Body -->
    <div style="padding:36px 40px;">
      <p style="color:#a1a1aa;font-size:14px;margin:0 0 8px;">${greeting}</p>
      <h2 style="color:#f4f4f5;font-size:20px;font-weight:800;margin:0 0 20px;line-height:1.3;">${subject}</h2>
      <div style="color:#d4d4d8;font-size:15px;line-height:1.8;border-left:3px solid #06b6d4;padding-left:16px;">${bodyHtml}</div>
    </div>
    <!-- Footer -->
    <div style="background:#0d0e18;padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
      <p style="color:#52525b;font-size:12px;margin:0;">© ${new Date().getFullYear()} D-Kode Era. Building the Future of Digital Innovation.</p>
      <p style="color:#3f3f46;font-size:11px;margin:6px 0 0;">You are receiving this because you are subscribed to D-Kode Era notifications.</p>
    </div>
  </div>
</body>
</html>`;
}
