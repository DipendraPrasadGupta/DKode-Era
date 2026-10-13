import { Request, Response } from 'express';
import prisma from '../config/prisma';

// ── Helper: parse JSON field safely ──────────────────────────────────────────
function parseJson(raw: string, fallback: unknown = []) {
  try { return JSON.parse(raw); } catch { return fallback; }
}

// ── Helper: serialize project row for API response ────────────────────────────
function serializeProject(p: any) {
  return {
    ...p,
    sensors: parseJson(p.sensors, []),
    keyTakeaways: parseJson(p.keyTakeaways, []),
    pinConnections: parseJson(p.pinConnections, []),
  };
}

// ── Typed alias — IotProject not yet in generated Prisma client types ────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;


// ── GET all IoT projects (public) ─────────────────────────────────────────────
export async function getIotProjects(_req: Request, res: Response) {
  try {
    const projects = await db.iotProject.findMany({
      where: { published: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
    res.json(projects.map(serializeProject));
  } catch (err) {
    console.error('getIotProjects error:', err);
    res.status(500).json({ error: 'Failed to fetch IoT projects' });
  }
}

// ── GET all IoT projects (admin — includes unpublished) ───────────────────────
export async function getIotProjectsAdmin(_req: Request, res: Response) {
  try {
    const projects = await db.iotProject.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
    res.json(projects.map(serializeProject));
  } catch (err) {
    console.error('getIotProjectsAdmin error:', err);
    res.status(500).json({ error: 'Failed to fetch IoT projects' });
  }
}

// ── GET single IoT project by id or slug ─────────────────────────────────────
export async function getIotProjectById(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const where = isNaN(Number(id)) ? { slug: id } : { id: Number(id) };
    const project = await db.iotProject.findUnique({ where });
    if (!project) return res.status(404).json({ error: 'IoT project not found' });
    res.json(serializeProject(project));
  } catch (err) {
    console.error('getIotProjectById error:', err);
    res.status(500).json({ error: 'Failed to fetch IoT project' });
  }
}

// ── POST create IoT project (admin) ──────────────────────────────────────────
export async function createIotProject(req: Request, res: Response) {
  try {
    const data = req.body;
    const project = await db.iotProject.create({
      data: {
        title: data.title,
        slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        tagline: data.tagline || '',
        image: data.image || '',
        icon: data.icon || '⚡',
        level: data.level || 'Beginner',
        levelNum: data.levelNum || 1,
        levelSubtitle: data.levelSubtitle || '',
        badgeColor: data.badgeColor || '',
        accentGlow: data.accentGlow || '',
        difficulty: data.difficulty || 'Easy',
        estimatedHours: data.estimatedHours || '4 Hours',
        microcontroller: data.microcontroller || 'Arduino / ESP32',
        description: data.description || '',
        workingPrinciple: data.workingPrinciple || '',
        realWorldImpact: data.realWorldImpact || '',
        schematicSummary: data.schematicSummary || '',
        codeSnippet: data.codeSnippet || '',
        sensors: JSON.stringify(Array.isArray(data.sensors) ? data.sensors : []),
        keyTakeaways: JSON.stringify(Array.isArray(data.keyTakeaways) ? data.keyTakeaways : []),
        pinConnections: JSON.stringify(Array.isArray(data.pinConnections) ? data.pinConnections : []),
        published: data.published !== false,
        order: data.order || 0,
      },
    });
    res.status(201).json(serializeProject(project));
  } catch (err: any) {
    console.error('createIotProject error:', err);
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'A project with that slug already exists' });
    }
    res.status(500).json({ error: 'Failed to create IoT project' });
  }
}

// ── PUT update IoT project (admin) ───────────────────────────────────────────
export async function updateIotProject(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid project id' });
  try {
    const data = req.body;
    const project = await db.iotProject.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        tagline: data.tagline,
        image: data.image,
        icon: data.icon,
        level: data.level,
        levelNum: data.levelNum,
        levelSubtitle: data.levelSubtitle,
        badgeColor: data.badgeColor,
        accentGlow: data.accentGlow,
        difficulty: data.difficulty,
        estimatedHours: data.estimatedHours,
        microcontroller: data.microcontroller,
        description: data.description,
        workingPrinciple: data.workingPrinciple,
        realWorldImpact: data.realWorldImpact,
        schematicSummary: data.schematicSummary,
        codeSnippet: data.codeSnippet,
        sensors: JSON.stringify(Array.isArray(data.sensors) ? data.sensors : []),
        keyTakeaways: JSON.stringify(Array.isArray(data.keyTakeaways) ? data.keyTakeaways : []),
        pinConnections: JSON.stringify(Array.isArray(data.pinConnections) ? data.pinConnections : []),
        published: data.published,
        order: data.order,
      },
    });
    res.json(serializeProject(project));
  } catch (err: any) {
    console.error('updateIotProject error:', err);
    if (err.code === 'P2025') return res.status(404).json({ error: 'IoT project not found' });
    res.status(500).json({ error: 'Failed to update IoT project' });
  }
}

// ── DELETE IoT project (admin) ────────────────────────────────────────────────
export async function deleteIotProject(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid project id' });
  try {
    await db.iotProject.delete({ where: { id } });
    res.json({ success: true });
  } catch (err: any) {
    console.error('deleteIotProject error:', err);
    if (err.code === 'P2025') return res.status(404).json({ error: 'IoT project not found' });
    res.status(500).json({ error: 'Failed to delete IoT project' });
  }
}
