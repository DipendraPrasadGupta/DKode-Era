'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { pageTokens as tk } from '@/lib/pageTokens';
import {
  Sparkles,
  Wand2,
  Copy,
  Check,
  ExternalLink,
  Code2,
  GraduationCap,
  Image as ImageIcon,
  Briefcase,
  Cpu,
  Terminal,
  Bookmark,
  Search,
  Zap,
  SlidersHorizontal,
  ShieldCheck,
  Plus,
  Trash2,
  ArrowRight,
  Bot,
  Lightbulb,
  Layers,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

// ─── Data Definitions ────────────────────────────────────────────────────────

type StudioMode = 'builder' | 'enhancer' | 'library' | 'image';
type FrameworkType = 'rtf' | 'create' | 'cot';

interface LibraryPrompt {
  id: string;
  category: 'students' | 'coding' | 'image' | 'business';
  title: string;
  tag: string;
  description: string;
  template: string;
  placeholders: Record<string, string>;
  isCustom?: boolean;
}

const PRESET_PROMPTS: LibraryPrompt[] = [
  // ── Students & Learning ──
  {
    id: 'feynman-explainer',
    category: 'students',
    title: 'The Feynman Concept Explainer',
    tag: 'Academic Mastery',
    description: 'Deconstructs dense academic concepts into intuitive analogies with zero unnecessary jargon.',
    placeholders: {
      TOPIC: 'Quantum Computing and Superposition',
      LEVEL: 'First-Year Computer Science Student',
    },
    template: `Act as a world-renowned university professor famed for teaching via the Feynman Technique.

Objective: Explain [TOPIC] to someone with a [LEVEL] background.

Rigorous Guidelines:
1. Ground the explanation in an intuitive, physical real-world analogy before introducing any formal notation.
2. If technical terms are mandatory, define them immediately in plain English.
3. Formulate the concept into 3 core foundational pillars.
4. Pinpoint the single most common misconception learners have, explaining precisely why it is flawed.
5. End with a 2-question conceptual quiz to verify my understanding (do not reveal answers until I respond).`,
  },
  {
    id: 'exam-cram-quizzer',
    category: 'students',
    title: 'Socratic Active Recall Exam Crammer',
    tag: 'Study & Revision',
    description: 'Quizzes you one rigorous question at a time, grades your response from 1–10, and targets knowledge gaps.',
    placeholders: {
      SUBJECT: 'Database Normalization (1NF through BCNF) and Indexing',
      DIFFICULTY: 'Final Undergraduate Exam',
    },
    template: `Act as a demanding exam tutor specializing in [SUBJECT]. We are conducting an intense Socratic active-recall revision session for a [DIFFICULTY] level exam.

Rules of Engagement:
1. Ask me ONE challenging, scenario-based question at a time. Never provide the answer upfront.
2. Wait for my reply.
3. Once I reply, critique my answer:
   - Assign an honest score from 1 to 10.
   - Point out what was accurate.
   - Highlight missing edge cases or theoretical flaws.
4. Immediately present the next question, calibrated to challenge my weakest area.
5. Begin now with Question #1.`,
  },
  {
    id: 'thesis-defense-prep',
    category: 'students',
    title: 'Thesis Defense Panel Griller',
    tag: 'Research',
    description: 'Simulates a skeptical academic committee grilling your research methodology and limitations.',
    placeholders: {
      THESIS_TOPIC: 'Microservice Latency Benchmarking Under High-Concurrency in South Asia',
      METHODOLOGY: 'Simulated 50,000 concurrent WebSocket sessions comparing NestJS vs Go Gin on AWS AP-South',
    },
    template: `Act as an adversarial PhD committee chair reviewing a Master's thesis defense.

Thesis Topic: [THESIS_TOPIC]
Proposed Methodology: [METHODOLOGY]

Your directives:
1. Interrogate the core theoretical assumptions of this research.
2. Attack potential sampling bias, hardware throttling, and statistical significance flaws in the methodology.
3. Ask 3 piercing, technical questions designed to expose edge cases where this approach would collapse.
4. Require mathematically sound, literature-backed defenses.`,
  },

  // ── Coding & Developers ──
  {
    id: 'senior-code-review',
    category: 'coding',
    title: 'Staff / Principal Engineer Code Review',
    tag: 'Code Quality',
    description: 'Scans your snippet for security flaws, race conditions, memory leaks, and architectural antipatterns.',
    placeholders: {
      STACK: 'TypeScript / Node.js Express / Prisma',
      CODE_SNIPPET: `async function transferFunds(req, res) {\n  const { fromId, toId, amount } = req.body;\n  const sender = await db.user.findUnique({ where: { id: fromId } });\n  if (sender.balance >= amount) {\n    await db.user.update({ where: { id: fromId }, data: { balance: sender.balance - amount } });\n    await db.user.update({ where: { id: toId }, data: { balance: { increment: amount } } });\n    res.json({ success: true });\n  }\n}`,
    },
    template: `Act as a Staff / Principal Software Engineer conducting a strict production code review.

Tech Stack: [STACK]

Analyze the following implementation:
\`\`\`
[CODE_SNIPPET]
\`\`\`

Evaluate across these strict dimensions:
1. Security & Exploits (Reentrancy, race conditions, SQL/NoSQL injection, authorization bypass, idempotency issues).
2. Concurrency & ACID Integrity (Database transactions, locking mechanisms, rollback handling).
3. Performance & Memory Bottlenecks.
4. Refactored Code: Output the production-hardened code snippet with inline comments explaining critical architectural choices.`,
  },
  {
    id: 'unit-test-generator',
    category: 'coding',
    title: 'Zero-Flake Automated Test Architect',
    tag: 'Unit Testing',
    description: 'Writes 100% branch-coverage unit tests with boundary fuzzing and AAA structure.',
    placeholders: {
      TEST_RUNNER: 'Vitest with TypeScript and MSW (Mock Service Worker)',
      COMPONENT: 'A multi-currency checkout engine calculating VAT, coupon discounts, and eSewa payment callbacks',
    },
    template: `Act as a Senior Test Automation Architect specializing in [TEST_RUNNER].

Construct an exhaustive, zero-flake test suite for:
[COMPONENT]

Strict Testing Mandates:
- Comprehensive Happy Path verification.
- Malicious & Boundary Edge Cases: Negative numbers, precision roundoff errors, expired voucher timestamps, concurrent duplicate submissions.
- Strict Arrange-Act-Assert (AAA) pattern.
- Mock all third-party external APIs cleanly.
- Include descriptive test titles describing behavioral contracts.`,
  },

  // ── Midjourney & Design ──
  {
    id: 'midjourney-cinematic-glass',
    category: 'image',
    title: '3D Glassmorphic SaaS Hero Render',
    tag: 'Midjourney v6',
    description: 'Photorealistic translucent glassmorphism UI mockups with optical caustic reflections for web headers.',
    placeholders: {
      SCENE: 'Futuristic AI orchestration floating holographic dashboard',
      ACCENTS: 'electric cyan and ultraviolet volumetric neon rim light, midnight obsidian slate backdrop',
    },
    template: `A photorealistic 3D render of [SCENE], frosted glassmorphism interface panels, optical refraction, prismatic chromatic dispersion, [ACCENTS], dramatic studio lighting, soft neon caustics, Octane Render, 8k resolution, ray tracing reflections, ultra-clean modern luxury tech aesthetic --ar 16:9 --v 6.0 --style raw --q 2`,
  },
  {
    id: 'midjourney-cyberpunk-portrait',
    category: 'image',
    title: 'Cyberpunk Cinematic Street Photography',
    tag: 'Photorealism',
    description: 'Moody anamorphic photography with rain-soaked asphalt and neon reflections.',
    placeholders: {
      PROTAGONIST: 'A young female AI robotics engineer in tactical cybernetic techwear',
      CITY_LOCATION: 'a rain-slicked alleyway in night-time Kathmandu, glowing neon signs in Devanagari reflecting in puddles',
    },
    template: `Cinematic street photograph of [PROTAGONIST], in [CITY_LOCATION], shot on 35mm Hasselblad X2D, 80mm f/1.2 lens, shallow depth of field, anamorphic bokeh, subtle atmospheric vapor haze, dramatic chiaroscuro lighting, natural skin texture with rain droplets, hyper-detailed --ar 16:9 --v 6.0 --q 2`,
  },

  // ── Business & Growth ──
  {
    id: 'cold-outreach-email',
    category: 'business',
    title: 'Executive B2B Pattern-Interrupt Email',
    tag: 'Sales & Growth',
    description: 'Generates sub-90-word cold emails modeled after Chris Voss hostage-negotiation psychology.',
    placeholders: {
      OFFERING: 'Custom Next.js 15 enterprise SaaS web engineering and AI agent development by D-Kode Era',
      RECIPIENT_TITLE: 'Founder & CTO of a high-growth hospitality or logistics brand in Nepal',
      PROBLEM: 'Their legacy web system is slow, lacks offline ordering, and fails during peak traffic',
    },
    template: `Act as a master B2B sales copywriter trained on Chris Voss negotiation frameworks and modern anti-spam cold outreach.

Offering: [OFFERING]
Target Decision-Maker: [RECIPIENT_TITLE]
Core Business Bottleneck: [PROBLEM]

Draft a high-conversion 3-stage sequence:
1. Email #1 (The Pattern Interrupt): Strictly under 85 words. No cheesy flattery. Focuses entirely on the cost of inaction. Ends with a low-friction, interest-based ask (not a calendar invite).
2. Email #2 (The Proof Point): 4 days later. Shares an exact quantifiable outcome from a similar engagement.
3. Email #3 (The Polite Graceful Breakup): 7 days later. Removes all pressure, preserving brand dignity.`,
  },
];

const PERSONAS = [
  { id: 'architect', label: 'Staff / Principal Software Architect', icon: Code2, desc: 'Prioritizes distributed scalability, zero-debt architecture, and battle-tested patterns' },
  { id: 'professor', label: 'Distinguished University Professor', icon: GraduationCap, desc: 'Uses Socratic inquiry, rigorous mathematical intuition, and foundational principles' },
  { id: 'cmo', label: 'B2B Growth Strategist & Copywriter', icon: Briefcase, desc: 'High-conversion, punchy, conversion-rate optimized, and psychologically calibrated' },
  { id: 'designer', label: 'Principal UI/UX & Visual Designer', icon: Layers, desc: 'Focuses on typography, micro-interactions, WCAG contrast, and glassmorphic aesthetics' },
  { id: 'security', label: 'Application Security Engineer (AppSec)', icon: ShieldCheck, desc: 'Zero-trust mindset, defensive coding, OWASP Top 10 mitigation, and threat modeling' },
];

export default function AIPromptStudioPage() {
  const [activeMode, setActiveMode] = useState<StudioMode>('builder');
  const [framework, setFramework] = useState<FrameworkType>('rtf');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // ── Mode 1 Builder State ──
  const [selectedPersona, setSelectedPersona] = useState<string>('architect');
  const [taskInput, setTaskInput] = useState<string>(
    'Architect a resilient rate-limiting and DDoS-mitigation middleware for a Next.js 15 and Node.js REST API using Redis token buckets.'
  );
  const [contextInput, setContextInput] = useState<string>(
    'High-traffic e-commerce & SaaS backend deployed in Docker, handling sudden traffic spikes during flash sales.'
  );
  const [constraints, setConstraints] = useState<string[]>([
    'Enforce atomic sliding-window algorithm to prevent burst vulnerabilities',
    'Include structured TypeScript interfaces and clean inline comments',
    'No conversational filler or fluff — output production code and direct explanations only',
  ]);
  const [newConstraint, setNewConstraint] = useState<string>('');
  const [tone, setTone] = useState<string>('Technical & Direct');
  const [outputFormat, setOutputFormat] = useState<string>('Production Markdown with TypeScript Code Fences');

  // ── Mode 2 Enhancer State ──
  const [roughPrompt, setRoughPrompt] = useState<string>(
    'Help me study for my computer network final exam on TCP vs UDP and congestion control algorithms'
  );
  const [enhancedResult, setEnhancedResult] = useState<string>('');
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [enhancerFocus, setEnhancerFocus] = useState<'reasoning' | 'code' | 'academic' | 'copy'>('academic');

  // ── Mode 3 Library State ──
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [libCategory, setLibCategory] = useState<'all' | 'students' | 'coding' | 'image' | 'business'>('all');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('feynman-explainer');
  const [activePlaceholders, setActivePlaceholders] = useState<Record<string, string>>({});
  const [customPrompts, setCustomPrompts] = useState<LibraryPrompt[]>([]);

  // ── Mode 4 Image Studio State ──
  const [imageSubject, setImageSubject] = useState<string>(
    'Futuristic high-tech Himalayan coffee research laboratory in Nepal with floating holographic interfaces'
  );
  const [imageStyle, setImageStyle] = useState<string>('Cyberpunk Sci-Fi Realism with Optical Caustics');
  const [imageLighting, setImageLighting] = useState<string>('Volumetric Neon & Moody Blue Hour Studio Light');
  const [imageLens, setImageLens] = useState<string>('35mm Prime Lens, f/1.4, Shallow Depth of Field, Anamorphic Bokeh');
  const [imageAspect, setImageAspect] = useState<string>('16:9');
  const [imageEngine, setImageEngine] = useState<string>('v 6.0');
  const [imageStylize, setImageStylize] = useState<number>(250);

  // Initialize library placeholders
  useEffect(() => {
    const all = [...PRESET_PROMPTS, ...customPrompts];
    const found = all.find(p => p.id === selectedPresetId);
    if (found) {
      setActivePlaceholders(found.placeholders);
    }
  }, [selectedPresetId, customPrompts]);

  // Load custom prompts from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('dkode_custom_prompts');
      if (stored) setCustomPrompts(JSON.parse(stored));
    } catch {
      // fallback
    }
  }, []);

  // ── Live Generated Builder Prompt ──
  const generatedBuilderPrompt = useMemo(() => {
    const personaObj = PERSONAS.find(p => p.id === selectedPersona) || PERSONAS[0];

    if (framework === 'cot') {
      return `### System Persona & Authority:
Act as a world-class ${personaObj.label}. ${personaObj.desc}.

### High-Impact Objective:
${taskInput.trim()}

${contextInput.trim() ? `### Context & System Topology:\n${contextInput.trim()}\n` : ''}
### Step-by-Step Chain-of-Thought Protocol:
1. **First-Principles Decomposition**: Analyze the underlying assumptions, dependencies, and critical edge cases.
2. **Formulate Solution Strategy**: Outline the architectural design before implementing.
3. **Execution & Implementation**: Produce the solution adhering to the specified format.
4. **Self-Correction & Threat Assessment**: Scrutinize your own output for 2 subtle bugs or failure modes, and mitigate them.

### Strict Operational Guardrails:
${constraints.map(c => `- ${c}`).join('\n')}

### Communication Tone:
${tone}

### Deliverable Format:
${outputFormat}`;
    }

    if (framework === 'create') {
      return `### Character (Role):
You are an elite ${personaObj.label} (${personaObj.desc}).

### Request (Task):
${taskInput.trim()}

${contextInput.trim() ? `### Context & Environment:\n${contextInput.trim()}\n` : ''}
### Adjustments (Negative Guardrails & Constraints):
${constraints.map(c => `- ${c}`).join('\n')}

### Tone & Style:
${tone}

### Exact Output Type:
${outputFormat}`;
    }

    // Default RTF Framework
    return `### Role:
Act as an elite ${personaObj.label}. ${personaObj.desc}.

### Task:
${taskInput.trim()}

${contextInput.trim() ? `### Context:\n${contextInput.trim()}\n` : ''}
### Guardrails & Constraints:
${constraints.map(c => `- ${c}`).join('\n')}

### Tone:
${tone}

### Format:
${outputFormat}`;
  }, [framework, selectedPersona, taskInput, contextInput, constraints, tone, outputFormat]);

  // ── Live Generated Image Prompt ──
  const generatedImagePrompt = useMemo(() => {
    return `${imageSubject.trim()}, ${imageStyle}, ${imageLighting}, ${imageLens}, Octane render, 8K resolution, cinematic composition, ray tracing reflections, hyper-detailed --ar ${imageAspect} --${imageEngine} --s ${imageStylize} --q 2`;
  }, [imageSubject, imageStyle, imageLighting, imageLens, imageAspect, imageEngine, imageStylize]);

  // ── Live Library Output ──
  const allLibraryPrompts = useMemo(() => [...PRESET_PROMPTS, ...customPrompts], [customPrompts]);
  const activeLibraryPrompt = useMemo(() => {
    const found = allLibraryPrompts.find(p => p.id === selectedPresetId);
    if (!found) return '';

    let res = found.template;
    Object.entries(activePlaceholders).forEach(([k, v]) => {
      res = res.split(`[${k}]`).join(v || `[${k}]`);
    });
    return res;
  }, [allLibraryPrompts, selectedPresetId, activePlaceholders]);

  // Filtered library
  const filteredLibrary = useMemo(() => {
    return allLibraryPrompts.filter(p => {
      const matchCat = libCategory === 'all' || p.category === libCategory;
      const matchSearch =
        !searchQuery.trim() ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tag.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [allLibraryPrompts, libCategory, searchQuery]);

  // ── One-Click Enhancer ──
  const handleEnhance = () => {
    if (!roughPrompt.trim()) return;
    setIsEnhancing(true);

    setTimeout(() => {
      const clean = roughPrompt.trim();
      let personaTitle = 'Staff Enterprise Architect and Strategic Lead';
      let guidelines = 'Prioritize scalable production patterns, edge-case mitigation, and zero-fluff conciseness.';

      if (enhancerFocus === 'academic') {
        personaTitle = 'Distinguished University Professor and Socratic Academic Tutor';
        guidelines = 'Deconstruct into first principles, explain intuition using analogies, and provide active recall self-tests.';
      } else if (enhancerFocus === 'code') {
        personaTitle = 'Principal Software Engineer & Systems Architect';
        guidelines = 'Provide complete, typed, robust code with zero placeholder comments, handling race conditions and error boundaries.';
      } else if (enhancerFocus === 'copy') {
        personaTitle = 'Elite Direct-Response Copywriter and Behavioral Strategist';
        guidelines = 'Use psychological pattern interrupts, eliminate fluff, and craft compelling low-friction calls to action.';
      }

      const enhanced = `### System Persona & Authority:
Act as a world-class ${personaTitle}. Apply deep domain expertise to deliver a high-yield, zero-hallucination solution.

### Primary Objective:
${clean}

### Chain-of-Thought Execution Framework:
1. **Deconstruct the Core Problem**: Pinpoint the underlying challenge, key stakeholders, and hidden constraints.
2. **Step-by-Step Methodical Execution**: Formulate a structured, chronologically ordered solution.
3. **Proactive Failure Mode Mitigation**: Identify 3 common pitfalls or bugs in typical implementations, and explicitly engineer around them.
4. **Concrete Actionable Output**: Supply ready-to-use artifacts (code, templates, or checklists) that require zero further prompting.

### Quality Guardrails:
- ${guidelines}
- Format strictly with clear Markdown headers, bullet points, and code fences.`;

      setEnhancedResult(enhanced);
      setIsEnhancing(false);
    }, 450);
  };

  // ── Clipboard Copy Helper ──
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2200);
  };

  // ── Deep Link Launcher ──
  const launchInAI = (text: string, platform: 'chatgpt' | 'claude' | 'gemini') => {
    const encoded = encodeURIComponent(text);
    let url = '';
    if (platform === 'chatgpt') url = `https://chatgpt.com/?q=${encoded}`;
    else if (platform === 'claude') url = `https://claude.ai/new?q=${encoded}`;
    else if (platform === 'gemini') url = `https://gemini.google.com/app`;

    window.open(url, '_blank');
  };

  // ── Save Current Prompt to Custom Library ──
  const handleSaveToCustom = () => {
    const newCustom: LibraryPrompt = {
      id: `custom-${Date.now()}`,
      category: 'coding',
      title: taskInput.slice(0, 40) + '...',
      tag: 'Custom Engineered',
      description: 'Saved custom prompt template from Prompt Architect Studio.',
      template: generatedBuilderPrompt,
      placeholders: {},
      isCustom: true,
    };

    const updated = [newCustom, ...customPrompts];
    setCustomPrompts(updated);
    try {
      localStorage.setItem('dkode_custom_prompts', JSON.stringify(updated));
    } catch {
      // ignore
    }
    handleCopy(generatedBuilderPrompt, 'saved-toast');
  };

  const currentPreset = allLibraryPrompts.find(p => p.id === selectedPresetId);

  return (
    <div style={{ background: tk.bg, color: tk.text, minHeight: '100vh', fontFamily: tk.fontBody }}>
      {/* ── Top Hero Banner ──────────────────────────────────────────────── */}
      <section
        style={{
          background: `radial-gradient(ellipse 900px 600px at 20% 20%, rgba(168,85,247,0.15), transparent 60%),
                       radial-gradient(ellipse 700px 500px at 85% 30%, rgba(0,212,255,0.12), transparent 60%),
                       ${tk.bg}`,
          padding: '48px 20px 36px',
          borderBottom: `1px solid ${tk.border}`,
          position: 'relative',
        }}
      >
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          {/* Breadcrumb */}
          <Link
            href="/pages/tools"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              fontFamily: tk.fontMono,
              color: tk.textDim,
              textDecoration: 'none',
              marginBottom: 24,
              letterSpacing: '0.05em',
            }}
          >
            ← Back to Tools
          </Link>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ maxWidth: 720 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'rgba(168,85,247,0.1)',
                  border: '1px solid rgba(168,85,247,0.3)',
                  borderRadius: 20,
                  padding: '6px 14px',
                  color: tk.purple,
                  fontSize: 11,
                  fontFamily: tk.fontMono,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginBottom: 18,
                }}
              >
                <Sparkles size={14} />
                <span>Next-Gen AI Prompt Engineering Studio</span>
              </div>

              <h1
                style={{
                  fontFamily: tk.fontDisplay,
                  fontSize: 'clamp(32px, 5vw, 56px)',
                  fontWeight: 900,
                  lineHeight: 1.15,
                  marginBottom: 16,
                  letterSpacing: '-0.03em',
                }}
              >
                AI Prompt{' '}
                <span
                  style={{
                    background: `linear-gradient(135deg, ${tk.purple}, ${tk.cyan})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Architect Studio
                </span>
              </h1>

              <p style={{ fontSize: 16, color: tk.textDim, lineHeight: 1.7, maxWidth: 640, margin: 0 }}>
                Construct structured, zero-hallucination Mega-Prompts for ChatGPT, Claude 3.5, Gemini 1.5, and Midjourney. Built with industry frameworks (RTF, CREATE & CoT) for students, engineers, and creators.
              </p>
            </div>

            {/* Platform Compatibility Matrix Card */}
            <div
              style={{
                background: `linear-gradient(135deg, ${tk.surface}ee, ${tk.surfaceMuted}aa)`,
                border: `1px solid ${tk.border}`,
                borderRadius: 18,
                padding: '20px 22px',
                minWidth: 280,
                backdropFilter: 'blur(16px)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Cpu size={16} color={tk.cyan} />
                <span style={{ fontSize: 12, fontFamily: tk.fontMono, color: tk.cyan, fontWeight: 700, textTransform: 'uppercase' }}>
                  Engine Calibration
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { name: 'GPT-4o', badge: '128k' },
                  { name: 'Claude 3.5', badge: '200k' },
                  { name: 'Gemini 1.5', badge: '1M+' },
                  { name: 'Midjourney', badge: 'v6.0' },
                ].map(item => (
                  <div
                    key={item.name}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: `1px solid ${tk.border}`,
                      borderRadius: 8,
                      padding: '6px 10px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 600, color: tk.text }}>{item.name}</span>
                    <span style={{ fontSize: 10, fontFamily: tk.fontMono, color: tk.green }}>{item.badge}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Interactive Studio ──────────────────────────────────────── */}
      <main style={{ maxWidth: 1180, margin: '0 auto', padding: '36px 20px 80px' }}>
        {/* Modern Studio Navigation Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 12,
            marginBottom: 36,
          }}
        >
          {[
            { id: 'builder', label: 'Prompt Architect', sub: 'Role, Task, Rules & Guardrails', icon: Terminal, color: tk.purple },
            { id: 'enhancer', label: '1-Click Neural Enhancer', sub: 'Auto-upgrade raw prompts', icon: Wand2, color: tk.cyan },
            { id: 'library', label: 'Curated Template Vault', sub: 'Students, Coding & Growth', icon: Bookmark, color: tk.green },
            { id: 'image', label: 'Midjourney v6 Synthesizer', sub: 'Optics, Lighting & Ratios', icon: ImageIcon, color: tk.gold },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeMode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveMode(tab.id as StudioMode)}
                style={{
                  background: isActive ? `${tab.color}15` : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${isActive ? tab.color : tk.border}`,
                  borderRadius: 14,
                  padding: '14px 16px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.25s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  boxShadow: isActive ? `0 4px 20px ${tab.color}20` : 'none',
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: isActive ? `${tab.color}25` : 'rgba(255,255,255,0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isActive ? tab.color : tk.textDim,
                    flexShrink: 0,
                  }}
                >
                  <Icon size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: isActive ? tab.color : tk.text }}>
                    {tab.label}
                  </div>
                  <div style={{ fontSize: 11, color: tk.textDim, marginTop: 2, fontFamily: tk.fontMono }}>
                    {tab.sub}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* ── MODE 1: PROMPT ARCHITECT (BUILDER) ──────────────────────────── */}
        {activeMode === 'builder' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 28 }}>
            {/* Input Controls Card */}
            <div
              style={{
                background: `linear-gradient(135deg, ${tk.surface}ee, ${tk.surfaceMuted}aa)`,
                border: `1px solid ${tk.border}`,
                borderRadius: 20,
                padding: 28,
              }}
            >
              {/* Framework Selector Pills */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontFamily: tk.fontMono, color: tk.textDim, textTransform: 'uppercase' }}>
                    1. Select Architectural Framework:
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[
                    { id: 'rtf', label: 'RTF (Role-Task-Format)' },
                    { id: 'cot', label: 'Chain-of-Thought (CoT)' },
                    { id: 'create', label: 'CREATE Framework' },
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setFramework(f.id as FrameworkType)}
                      style={{
                        flex: 1,
                        background: framework === f.id ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${framework === f.id ? tk.purple : tk.border}`,
                        color: framework === f.id ? tk.purple : tk.textDim,
                        borderRadius: 8,
                        padding: '8px 10px',
                        fontSize: 11,
                        fontFamily: tk.fontMono,
                        fontWeight: framework === f.id ? 700 : 500,
                        cursor: 'pointer',
                      }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Persona Selector */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, color: tk.textDim, marginBottom: 8, fontFamily: tk.fontMono }}>
                  Target Domain Persona:
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {PERSONAS.map(p => {
                    const PIcon = p.icon;
                    const isSelected = selectedPersona === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedPersona(p.id)}
                        style={{
                          background: isSelected ? 'rgba(0,212,255,0.08)' : 'rgba(0,0,0,0.3)',
                          border: `1px solid ${isSelected ? tk.cyan : tk.border}`,
                          borderRadius: 10,
                          padding: '10px 14px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <PIcon size={18} color={isSelected ? tk.cyan : tk.textDim} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: isSelected ? tk.cyan : tk.text }}>
                            {p.label}
                          </div>
                          <div style={{ fontSize: 11, color: tk.textDim, marginTop: 1 }}>
                            {p.desc}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Core Objective Input */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, color: tk.textDim, marginBottom: 6, fontFamily: tk.fontMono }}>
                  Primary Objective / Mission:
                </label>
                <textarea
                  rows={3}
                  value={taskInput}
                  onChange={e => setTaskInput(e.target.value)}
                  placeholder="Define the specific task with measurable requirements..."
                  style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.4)',
                    border: `1px solid ${tk.border}`,
                    borderRadius: 12,
                    padding: '12px 14px',
                    color: tk.text,
                    fontSize: 14,
                    lineHeight: 1.6,
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* Context / System Background */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, color: tk.textDim, marginBottom: 6, fontFamily: tk.fontMono }}>
                  Context & Constraints Context (Optional):
                </label>
                <textarea
                  rows={2}
                  value={contextInput}
                  onChange={e => setContextInput(e.target.value)}
                  placeholder="e.g. Existing dependencies, runtime targets, user demographic..."
                  style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.4)',
                    border: `1px solid ${tk.border}`,
                    borderRadius: 12,
                    padding: '12px 14px',
                    color: tk.text,
                    fontSize: 14,
                    lineHeight: 1.6,
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* Operational Constraints (Negative Guardrails) */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, color: tk.textDim, marginBottom: 8, fontFamily: tk.fontMono }}>
                  Negative Guardrails & Prohibitions:
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
                  {constraints.map((rule, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'rgba(0,0,0,0.3)',
                        padding: '8px 12px',
                        borderRadius: 8,
                        fontSize: 12,
                        color: tk.textMuted,
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ShieldCheck size={14} color={tk.green} />
                        {rule}
                      </span>
                      <button
                        onClick={() => setConstraints(prev => prev.filter((_, i) => i !== idx))}
                        style={{ background: 'transparent', border: 'none', color: tk.red, cursor: 'pointer', padding: 4 }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    value={newConstraint}
                    onChange={e => setNewConstraint(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && newConstraint.trim()) {
                        e.preventDefault();
                        setConstraints(prev => [...prev, newConstraint.trim()]);
                        setNewConstraint('');
                      }
                    }}
                    placeholder="Add rule (e.g. 'Never use deprecated APIs')"
                    style={{
                      flex: 1,
                      background: 'rgba(0,0,0,0.4)',
                      border: `1px solid ${tk.border}`,
                      borderRadius: 8,
                      padding: '8px 12px',
                      color: tk.text,
                      fontSize: 13,
                    }}
                  />
                  <button
                    onClick={() => {
                      if (newConstraint.trim()) {
                        setConstraints(prev => [...prev, newConstraint.trim()]);
                        setNewConstraint('');
                      }
                    }}
                    style={{
                      background: 'rgba(168,85,247,0.12)',
                      border: `1px solid ${tk.purple}`,
                      color: tk.purple,
                      borderRadius: 8,
                      padding: '8px 14px',
                      fontSize: 12,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Plus size={14} />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Tone & Format Selectors */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: tk.textDim, marginBottom: 4, fontFamily: tk.fontMono }}>Tone:</label>
                  <select
                    value={tone}
                    onChange={e => setTone(e.target.value)}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: `1px solid ${tk.border}`, borderRadius: 8, padding: '10px 12px', color: tk.text, fontSize: 13 }}
                  >
                    <option value="Technical & Direct" style={{ background: '#080d1a' }}>Technical & Direct</option>
                    <option value="Academic & Socratic" style={{ background: '#080d1a' }}>Academic & Socratic</option>
                    <option value="High-Conversion & Punchy" style={{ background: '#080d1a' }}>High-Conversion</option>
                    <option value="Executive Briefing (Bullet-Dense)" style={{ background: '#080d1a' }}>Executive Briefing</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, color: tk.textDim, marginBottom: 4, fontFamily: tk.fontMono }}>Output Format:</label>
                  <select
                    value={outputFormat}
                    onChange={e => setOutputFormat(e.target.value)}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: `1px solid ${tk.border}`, borderRadius: 8, padding: '10px 12px', color: tk.text, fontSize: 13 }}
                  >
                    <option value="Production Markdown with TypeScript Code Fences" style={{ background: '#080d1a' }}>Markdown + TypeScript</option>
                    <option value="Step-by-step Ordered Checklist" style={{ background: '#080d1a' }}>Step-by-step Checklist</option>
                    <option value="Comparison Table in Markdown" style={{ background: '#080d1a' }}>Comparison Table</option>
                    <option value="Strict JSON Schema Output" style={{ background: '#080d1a' }}>Strict JSON Schema</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Generated Prompt Output Console */}
            <div
              style={{
                background: `linear-gradient(135deg, ${tk.surface}ee, ${tk.surfaceMuted}aa)`,
                border: `1px solid ${tk.border}`,
                borderRadius: 20,
                padding: 28,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                {/* Console Window Header */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 16,
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    paddingBottom: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f56' }} />
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }} />
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#27c93f' }} />
                    </div>
                    <span style={{ fontSize: 11, fontFamily: tk.fontMono, color: tk.textDim }}>
                      prompt-console.ai · {framework.toUpperCase()}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 12, fontSize: 11, fontFamily: tk.fontMono, color: tk.textDim }}>
                    <span>~{Math.round(generatedBuilderPrompt.length / 4)} tokens</span>
                    <span>{generatedBuilderPrompt.length} chars</span>
                  </div>
                </div>

                {/* Prompt Output View */}
                <div
                  style={{
                    background: 'rgba(0,0,0,0.5)',
                    border: `1px solid ${tk.border}`,
                    borderRadius: 14,
                    padding: 20,
                    fontFamily: tk.fontMono,
                    fontSize: 13,
                    lineHeight: 1.65,
                    color: tk.text,
                    whiteSpace: 'pre-wrap',
                    maxHeight: 480,
                    overflowY: 'auto',
                    marginBottom: 24,
                  }}
                >
                  {generatedBuilderPrompt}
                </div>
              </div>

              {/* Action Toolbar */}
              <div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
                  <button
                    onClick={() => handleCopy(generatedBuilderPrompt, 'builder-copy')}
                    style={{
                      background: `linear-gradient(135deg, ${tk.purple}, ${tk.cyan})`,
                      color: '#050810',
                      border: 'none',
                      padding: '11px 22px',
                      borderRadius: 10,
                      fontWeight: 800,
                      fontFamily: tk.fontMono,
                      fontSize: 13,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      boxShadow: '0 4px 16px rgba(168,85,247,0.25)',
                    }}
                  >
                    {copiedKey === 'builder-copy' ? <Check size={16} /> : <Copy size={16} />}
                    <span>{copiedKey === 'builder-copy' ? 'Copied to Clipboard!' : 'Copy Mega-Prompt'}</span>
                  </button>

                  <button
                    onClick={handleSaveToCustom}
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: `1px solid ${tk.border}`,
                      color: tk.text,
                      padding: '11px 16px',
                      borderRadius: 10,
                      fontSize: 12,
                      fontFamily: tk.fontMono,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <Bookmark size={15} color={tk.gold} />
                    <span>{copiedKey === 'saved-toast' ? 'Saved to Vault!' : 'Save to My Vault'}</span>
                  </button>
                </div>

                {/* Direct Launch Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 11, fontFamily: tk.fontMono, color: tk.textDim }}>Launch in:</span>
                  <button
                    onClick={() => launchInAI(generatedBuilderPrompt, 'chatgpt')}
                    style={{
                      background: 'rgba(0,212,255,0.08)',
                      border: '1px solid rgba(0,212,255,0.25)',
                      color: tk.cyan,
                      padding: '6px 12px',
                      borderRadius: 8,
                      fontSize: 11,
                      fontFamily: tk.fontMono,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span>ChatGPT</span>
                    <ExternalLink size={12} />
                  </button>

                  <button
                    onClick={() => launchInAI(generatedBuilderPrompt, 'claude')}
                    style={{
                      background: 'rgba(168,85,247,0.08)',
                      border: '1px solid rgba(168,85,247,0.25)',
                      color: tk.purple,
                      padding: '6px 12px',
                      borderRadius: 8,
                      fontSize: 11,
                      fontFamily: tk.fontMono,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span>Claude</span>
                    <ExternalLink size={12} />
                  </button>

                  <button
                    onClick={() => launchInAI(generatedBuilderPrompt, 'gemini')}
                    style={{
                      background: 'rgba(0,229,160,0.08)',
                      border: '1px solid rgba(0,229,160,0.25)',
                      color: tk.green,
                      padding: '6px 12px',
                      borderRadius: 8,
                      fontSize: 11,
                      fontFamily: tk.fontMono,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span>Gemini</span>
                    <ExternalLink size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── MODE 2: 1-CLICK NEURAL PROMPT ENHANCER ───────────────────────── */}
        {activeMode === 'enhancer' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 28 }}>
            {/* Input Card */}
            <div style={{ background: `linear-gradient(135deg, ${tk.surface}ee, ${tk.surfaceMuted}aa)`, border: `1px solid ${tk.border}`, borderRadius: 20, padding: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <Wand2 size={20} color={tk.cyan} />
                <h3 style={{ margin: 0, fontSize: 18, fontFamily: tk.fontDisplay, color: tk.cyan }}>
                  Raw / Draft Prompt Input
                </h3>
              </div>
              <p style={{ fontSize: 13, color: tk.textDim, marginBottom: 20 }}>
                Type your draft request below. The engine transforms it into an optimized instruction using cognitive Chain-of-Thought prompts.
              </p>

              {/* Optimization Focus Selector */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, color: tk.textDim, marginBottom: 6, fontFamily: tk.fontMono }}>
                  Enhancement Focus Calibration:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    { id: 'academic', label: '🎓 Socratic Academic' },
                    { id: 'code', label: '💻 Production Code' },
                    { id: 'reasoning', label: '🧠 Deep Reasoning' },
                    { id: 'copy', label: '🚀 Growth Copy' },
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => setEnhancerFocus(item.id as any)}
                      style={{
                        background: enhancerFocus === item.id ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${enhancerFocus === item.id ? tk.cyan : tk.border}`,
                        color: enhancerFocus === item.id ? tk.cyan : tk.textDim,
                        borderRadius: 8,
                        padding: '8px 10px',
                        fontSize: 11,
                        fontFamily: tk.fontMono,
                        fontWeight: enhancerFocus === item.id ? 700 : 500,
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                rows={7}
                value={roughPrompt}
                onChange={e => setRoughPrompt(e.target.value)}
                placeholder="e.g. Write an essay outline on AI in healthcare or build a React modal component..."
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.4)',
                  border: `1px solid ${tk.border}`,
                  borderRadius: 12,
                  padding: '14px 16px',
                  color: tk.text,
                  fontSize: 14,
                  lineHeight: 1.6,
                  resize: 'vertical',
                  marginBottom: 20,
                }}
              />

              <button
                onClick={handleEnhance}
                disabled={isEnhancing}
                style={{
                  background: `linear-gradient(135deg, ${tk.cyan}, ${tk.purple})`,
                  color: '#050810',
                  border: 'none',
                  padding: '13px 24px',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 800,
                  fontFamily: tk.fontMono,
                  cursor: 'pointer',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 4px 20px rgba(0,212,255,0.25)',
                }}
              >
                {isEnhancing ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Neural Synthesizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Supercharge into Mega-Prompt</span>
                  </>
                )}
              </button>
            </div>

            {/* Enhanced Result Card */}
            <div style={{ background: `linear-gradient(135deg, ${tk.surface}ee, ${tk.surfaceMuted}aa)`, border: `1px solid ${tk.border}`, borderRadius: 20, padding: 28, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ fontSize: 11, fontFamily: tk.fontMono, color: tk.green, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Zap size={14} />
                    <span>Optimized Production Prompt</span>
                  </span>
                  {enhancedResult && (
                    <span style={{ fontSize: 11, fontFamily: tk.fontMono, color: tk.textDim }}>
                      {enhancedResult.length} characters
                    </span>
                  )}
                </div>

                <div
                  style={{
                    background: 'rgba(0,0,0,0.5)',
                    border: `1px solid ${tk.border}`,
                    borderRadius: 14,
                    padding: 20,
                    fontFamily: tk.fontMono,
                    fontSize: 13,
                    lineHeight: 1.65,
                    color: tk.text,
                    whiteSpace: 'pre-wrap',
                    minHeight: 280,
                    maxHeight: 460,
                    overflowY: 'auto',
                    marginBottom: 24,
                  }}
                >
                  {enhancedResult || 'Click "Supercharge into Mega-Prompt" on the left to see the optimized output...'}
                </div>
              </div>

              {enhancedResult && (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleCopy(enhancedResult, 'enhancer-copy')}
                    style={{
                      background: tk.cyan,
                      color: '#050810',
                      border: 'none',
                      padding: '11px 22px',
                      borderRadius: 10,
                      fontWeight: 800,
                      fontFamily: tk.fontMono,
                      fontSize: 13,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    {copiedKey === 'enhancer-copy' ? <Check size={16} /> : <Copy size={16} />}
                    <span>{copiedKey === 'enhancer-copy' ? 'Copied!' : 'Copy Enhanced Prompt'}</span>
                  </button>

                  <button
                    onClick={() => launchInAI(enhancedResult, 'chatgpt')}
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: `1px solid ${tk.border}`,
                      color: tk.text,
                      padding: '11px 16px',
                      borderRadius: 10,
                      fontSize: 12,
                      fontFamily: tk.fontMono,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span>Launch in ChatGPT</span>
                    <ExternalLink size={13} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── MODE 3: CURATED TEMPLATE VAULT ──────────────────────────────── */}
        {activeMode === 'library' && (
          <div>
            {/* Search Bar & Category Filters */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              {/* Category Pills */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { id: 'all', label: 'All Templates' },
                  { id: 'students', label: '🎓 Students & Academic' },
                  { id: 'coding', label: '💻 Coding & Tech' },
                  { id: 'image', label: '🎨 Midjourney & Design' },
                  { id: 'business', label: '🚀 Business & Growth' },
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setLibCategory(cat.id as any)}
                    style={{
                      background: libCategory === cat.id ? tk.purple : 'rgba(255,255,255,0.03)',
                      color: libCategory === cat.id ? '#FFFFFF' : tk.textDim,
                      border: `1px solid ${libCategory === cat.id ? tk.purple : tk.border}`,
                      borderRadius: 20,
                      padding: '8px 16px',
                      fontSize: 12,
                      fontFamily: tk.fontMono,
                      fontWeight: libCategory === cat.id ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: 'rgba(0,0,0,0.3)',
                  border: `1px solid ${tk.border}`,
                  borderRadius: 12,
                  padding: '6px 14px',
                  minWidth: 260,
                }}
              >
                <Search size={16} color={tk.textDim} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search templates..."
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: tk.text,
                    fontSize: 13,
                    fontFamily: tk.fontMono,
                    outline: 'none',
                    width: '100%',
                  }}
                />
              </div>
            </div>

            {/* Vault Grid: Master List & Interactive Playground */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 28 }}>
              {/* Templates List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {filteredLibrary.map(preset => {
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => setSelectedPresetId(preset.id)}
                      style={{
                        background: isSelected ? 'rgba(168,85,247,0.12)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${isSelected ? tk.purple : tk.border}`,
                        borderRadius: 14,
                        padding: '16px 18px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: isSelected ? tk.purple : tk.text }}>
                          {preset.title}
                        </span>
                        <span style={{ fontSize: 10, fontFamily: tk.fontMono, color: tk.cyan, background: 'rgba(0,212,255,0.08)', padding: '2px 8px', borderRadius: 6 }}>
                          {preset.tag}
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: tk.textDim, margin: 0, lineHeight: 1.5 }}>
                        {preset.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Active Template Playground */}
              {currentPreset && (
                <div style={{ background: `linear-gradient(135deg, ${tk.surface}ee, ${tk.surfaceMuted}aa)`, border: `1px solid ${tk.border}`, borderRadius: 20, padding: 26 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: tk.text }}>
                        {currentPreset.title}
                      </div>
                      <div style={{ fontSize: 11, fontFamily: tk.fontMono, color: tk.cyan, marginTop: 2 }}>
                        {currentPreset.tag}
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopy(activeLibraryPrompt, 'lib-copy')}
                      style={{
                        background: 'rgba(168,85,247,0.14)',
                        border: `1px solid ${tk.purple}`,
                        color: tk.purple,
                        padding: '8px 14px',
                        borderRadius: 8,
                        fontSize: 12,
                        fontFamily: tk.fontMono,
                        cursor: 'pointer',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      {copiedKey === 'lib-copy' ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copiedKey === 'lib-copy' ? 'Copied' : 'Copy Prompt'}</span>
                    </button>
                  </div>

                  {/* Interactive Dynamic Placeholder Fields */}
                  {Object.keys(currentPreset.placeholders).length > 0 && (
                    <div style={{ marginBottom: 20, background: 'rgba(0,0,0,0.25)', padding: 14, borderRadius: 12, border: `1px solid ${tk.border}` }}>
                      <div style={{ fontSize: 11, fontFamily: tk.fontMono, color: tk.textDim, marginBottom: 10, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <SlidersHorizontal size={12} color={tk.cyan} />
                        <span>Fill In Variables (Live Updates):</span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {Object.keys(currentPreset.placeholders).map(key => (
                          <div key={key}>
                            <label style={{ display: 'block', fontSize: 11, color: tk.cyan, fontFamily: tk.fontMono, marginBottom: 4 }}>
                              [{key}]
                            </label>
                            <input
                              type="text"
                              value={activePlaceholders[key] || ''}
                              onChange={e => setActivePlaceholders(prev => ({ ...prev, [key]: e.target.value }))}
                              style={{
                                width: '100%',
                                background: 'rgba(0,0,0,0.5)',
                                border: `1px solid ${tk.border}`,
                                borderRadius: 8,
                                padding: '8px 12px',
                                color: tk.text,
                                fontSize: 13,
                                fontFamily: tk.fontMono,
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Rendered Output preview */}
                  <div
                    style={{
                      background: 'rgba(0,0,0,0.5)',
                      border: `1px solid ${tk.border}`,
                      borderRadius: 14,
                      padding: 18,
                      fontFamily: tk.fontMono,
                      fontSize: 13,
                      lineHeight: 1.65,
                      color: tk.text,
                      whiteSpace: 'pre-wrap',
                      maxHeight: 320,
                      overflowY: 'auto',
                    }}
                  >
                    {activeLibraryPrompt}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── MODE 4: MIDJOURNEY & IMAGE STUDIO ────────────────────────────── */}
        {activeMode === 'image' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 28 }}>
            {/* Input Parameters */}
            <div style={{ background: `linear-gradient(135deg, ${tk.surface}ee, ${tk.surfaceMuted}aa)`, border: `1px solid ${tk.border}`, borderRadius: 20, padding: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <ImageIcon size={20} color={tk.gold} />
                <h3 style={{ margin: 0, fontSize: 18, fontFamily: tk.fontDisplay, color: tk.gold }}>
                  Midjourney v6 Visual Parameters
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: tk.textDim, marginBottom: 6, fontFamily: tk.fontMono }}>
                    Subject & Core Composition:
                  </label>
                  <textarea
                    rows={3}
                    value={imageSubject}
                    onChange={e => setImageSubject(e.target.value)}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: `1px solid ${tk.border}`, borderRadius: 10, padding: '12px 14px', color: tk.text, fontSize: 14 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, color: tk.textDim, marginBottom: 6, fontFamily: tk.fontMono }}>
                    Art Style / Rendering Engine:
                  </label>
                  <select
                    value={imageStyle}
                    onChange={e => setImageStyle(e.target.value)}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: `1px solid ${tk.border}`, borderRadius: 8, padding: '10px 12px', color: tk.text, fontSize: 13 }}
                  >
                    <option value="Cyberpunk Sci-Fi Realism with Optical Caustics" style={{ background: '#080d1a' }}>Cyberpunk Sci-Fi Realism</option>
                    <option value="Photorealistic 3D Glassmorphic SaaS Render" style={{ background: '#080d1a' }}>Photorealistic 3D Glassmorphic SaaS Render</option>
                    <option value="Moody Cinematic Street Photography (Hasselblad X2D)" style={{ background: '#080d1a' }}>Moody Cinematic Street Photography</option>
                    <option value="Minimalist Isometric Vector Illustration" style={{ background: '#080d1a' }}>Minimalist Isometric Vector</option>
                    <option value="Japanese Anime Makoto Shinkai Clouds Aesthetic" style={{ background: '#080d1a' }}>Makoto Shinkai Anime Aesthetic</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, color: tk.textDim, marginBottom: 6, fontFamily: tk.fontMono }}>
                    Atmospheric Lighting:
                  </label>
                  <select
                    value={imageLighting}
                    onChange={e => setImageLighting(e.target.value)}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: `1px solid ${tk.border}`, borderRadius: 8, padding: '10px 12px', color: tk.text, fontSize: 13 }}
                  >
                    <option value="Volumetric Neon & Moody Blue Hour Studio Light" style={{ background: '#080d1a' }}>Volumetric Neon & Moody Blue Hour</option>
                    <option value="Golden Hour Warm Sun Flare with Dust Particles" style={{ background: '#080d1a' }}>Golden Hour Sun Flare</option>
                    <option value="Softbox Studio Lighting with Prismatic Caustics" style={{ background: '#080d1a' }}>Softbox with Prismatic Caustics</option>
                    <option value="Bioluminescent Glowing Particles in Complete Darkness" style={{ background: '#080d1a' }}>Bioluminescent In Darkness</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: tk.textDim, marginBottom: 4, fontFamily: tk.fontMono }}>Aspect Ratio:</label>
                    <select
                      value={imageAspect}
                      onChange={e => setImageAspect(e.target.value)}
                      style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: `1px solid ${tk.border}`, borderRadius: 8, padding: '10px 12px', color: tk.text, fontSize: 13 }}
                    >
                      <option value="16:9" style={{ background: '#080d1a' }}>16:9 (Hero / YouTube)</option>
                      <option value="9:16" style={{ background: '#080d1a' }}>9:16 (Story / Reel)</option>
                      <option value="1:1" style={{ background: '#080d1a' }}>1:1 (Avatar / Square)</option>
                      <option value="4:5" style={{ background: '#080d1a' }}>4:5 (Social Portrait)</option>
                      <option value="21:9" style={{ background: '#080d1a' }}>21:9 (Ultrawide Cinema)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: tk.textDim, marginBottom: 4, fontFamily: tk.fontMono }}>Stylize (--s): {imageStylize}</label>
                    <input
                      type="range"
                      min="50"
                      max="1000"
                      step="50"
                      value={imageStylize}
                      onChange={e => setImageStylize(Number(e.target.value))}
                      style={{ width: '100%', accentColor: tk.gold, marginTop: 8 }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Ready-to-paste Midjourney Output */}
            <div style={{ background: `linear-gradient(135deg, ${tk.surface}ee, ${tk.surfaceMuted}aa)`, border: `1px solid ${tk.border}`, borderRadius: 20, padding: 28, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: 11, fontFamily: tk.fontMono, color: tk.gold, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
                  Discord /imagine Command
                </span>

                <div
                  style={{
                    background: 'rgba(0,0,0,0.5)',
                    border: `1px solid ${tk.border}`,
                    borderRadius: 14,
                    padding: 20,
                    fontFamily: tk.fontMono,
                    fontSize: 13,
                    lineHeight: 1.65,
                    color: tk.text,
                    whiteSpace: 'pre-wrap',
                    minHeight: 220,
                    margin: '16px 0 24px',
                  }}
                >
                  {generatedImagePrompt}
                </div>
              </div>

              <button
                onClick={() => handleCopy(generatedImagePrompt, 'image-copy')}
                style={{
                  background: tk.gold,
                  color: '#050810',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: 10,
                  fontWeight: 800,
                  fontFamily: tk.fontMono,
                  fontSize: 13,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                {copiedKey === 'image-copy' ? <Check size={16} /> : <Copy size={16} />}
                <span>{copiedKey === 'image-copy' ? 'Copied Prompt!' : 'Copy Discord /imagine Prompt'}</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
