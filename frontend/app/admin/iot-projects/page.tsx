'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { IOT_LEVELS, IoTProject } from '@/lib/iotData';
import {
  getStoredProjects,
  addStoredProject,
  updateStoredProject,
  deleteStoredProject,
  resetStoredProjects,
  IOT_CHANGE_EVENT,
} from '@/lib/iotProjectsStore';
import { apiFetch, normalizeImageUrl } from '@/lib/api';

interface PinConnectionRow {
  component: string;
  pin: string;
  purpose: string;
}

const DEFAULT_CODE_TEMPLATE = `// D-Kode Era IoT Project Firmware
// Microcontroller: ESP32 / Arduino

void setup() {
  Serial.begin(115200);
  Serial.println("System Initialized");
}

void loop() {
  // Read sensor inputs and execute logic
  delay(1000);
}
`;

const SUGGESTED_EMOJIS = ['🦯', '💧', '☀️', '🚗', '🤖', '⚡', '🌡️', '🏥', '🌾', '🛡️', '📡', '📱'];

const POPULAR_SENSORS = [
  'Ultrasonic (HC-SR04)',
  'DHT11 / DHT22',
  'Active Piezo Buzzer',
  'SG90 Micro Servo',
  'LDR Light Sensor',
  'MQ-2 Gas / Smoke',
  '5V Relay Module',
  '0.96" I2C OLED',
  'PIR Motion Sensor',
  'Soil Moisture Sensor',
];

type ModalTabId = 'basic' | 'media' | 'details' | 'hardware' | 'code';

const TABS: Array<{ id: ModalTabId; label: string; icon: string }> = [
  { id: 'basic', label: '1. Basic Info & Tier', icon: '⚙️' },
  { id: 'media', label: '2. Media & Graphics', icon: '🖼️' },
  { id: 'details', label: '3. Description & Theory', icon: '📄' },
  { id: 'hardware', label: '4. Sensors & Pin Map', icon: '🔌' },
  { id: 'code', label: '5. Firmware Code', icon: '💻' },
];

export default function AdminIoTProjectsPage() {
  const [projects, setProjects] = useState<IoTProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Filters & Search
  const [selectedLevel, setSelectedLevel] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [modalTab, setModalTab] = useState<ModalTabId>('basic');
  const [codeDrawerProject, setCodeDrawerProject] = useState<IoTProject | null>(null);
  const [deleteConfirmProject, setDeleteConfirmProject] = useState<IoTProject | null>(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [tagline, setTagline] = useState('');
  const [image, setImage] = useState('');
  const [levelNum, setLevelNum] = useState<1 | 2 | 3>(1);
  const [levelSubtitle, setLevelSubtitle] = useState('');
  const [icon, setIcon] = useState('⚡');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Moderate' | 'Advanced'>('Easy');
  const [estimatedHours, setEstimatedHours] = useState('3 - 5 Hours');
  const [microcontroller, setMicrocontroller] = useState('Arduino Nano / Uno / ESP32');
  const [description, setDescription] = useState('');
  const [workingPrinciple, setWorkingPrinciple] = useState('');
  const [realWorldImpact, setRealWorldImpact] = useState('');
  const [schematicSummary, setSchematicSummary] = useState('');
  const [codeSnippet, setCodeSnippet] = useState(DEFAULT_CODE_TEMPLATE);

  // Dynamic Lists for Form
  const [sensorsList, setSensorsList] = useState<string[]>([]);
  const [sensorInput, setSensorInput] = useState('');
  const [takeawaysList, setTakeawaysList] = useState<string[]>([]);
  const [takeawayInput, setTakeawayInput] = useState('');
  const [pinRows, setPinRows] = useState<PinConnectionRow[]>([
    { component: 'VCC / 5V', pin: '5V', purpose: 'Power supply rail' },
    { component: 'GND', pin: 'GND', purpose: 'Ground circuit reference' },
  ]);

  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load projects on mount & listen to changes
  useEffect(() => {
    const load = () => {
      setProjects(getStoredProjects());
      setLoading(false);
    };
    load();

    const handleUpdate = () => load();
    window.addEventListener(IOT_CHANGE_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(IOT_CHANGE_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Sync Level Details when levelNum changes in Form
  const handleLevelChange = (lvl: 1 | 2 | 3) => {
    setLevelNum(lvl);
    const info = IOT_LEVELS[lvl];
    if (info) {
      setLevelSubtitle(info.tagline);
    }
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingId(null);
    setTitle('');
    setSlug('');
    setTagline('');
    setImage('');
    setLevelNum(1);
    setLevelSubtitle(IOT_LEVELS[1].tagline);
    setIcon('⚡');
    setDifficulty('Easy');
    setEstimatedHours('3 - 5 Hours');
    setMicrocontroller('Arduino Nano / Uno / ESP32');
    setDescription('');
    setWorkingPrinciple('');
    setRealWorldImpact('');
    setSchematicSummary('');
    setCodeSnippet(DEFAULT_CODE_TEMPLATE);
    setSensorsList(['Ultrasonic Sensor (HC-SR04)', 'Active Buzzer']);
    setTakeawaysList(['Sensor interfacing & data acquisition', 'PWM signal control & threshold logic']);
    setPinRows([
      { component: 'HC-SR04 VCC', pin: '5V', purpose: 'Power rail' },
      { component: 'HC-SR04 Trig', pin: 'D9', purpose: 'Trigger sonic pulse' },
      { component: 'HC-SR04 Echo', pin: 'D10', purpose: 'Receive echo return pulse' },
      { component: 'HC-SR04 GND', pin: 'GND', purpose: 'Ground return' },
    ]);
    setModalTab('basic');
    setModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (p: IoTProject) => {
    setEditingId(p.id);
    setTitle(p.title);
    setSlug(p.slug);
    setTagline(p.tagline || '');
    setImage(p.image || '');
    setLevelNum(p.levelNum);
    setLevelSubtitle(p.levelSubtitle || IOT_LEVELS[p.levelNum]?.tagline || '');
    setIcon(p.icon || '⚡');
    setDifficulty(p.difficulty || 'Easy');
    setEstimatedHours(p.estimatedHours || '4 Hours');
    setMicrocontroller(p.microcontroller || 'ESP32 / Arduino');
    setDescription(p.description || '');
    setWorkingPrinciple(p.workingPrinciple || '');
    setRealWorldImpact(p.realWorldImpact || '');
    setSchematicSummary(p.schematicSummary || '');
    setCodeSnippet(p.codeSnippet || DEFAULT_CODE_TEMPLATE);
    setSensorsList(Array.isArray(p.sensors) ? [...p.sensors] : []);
    setTakeawaysList(Array.isArray(p.keyTakeaways) ? [...p.keyTakeaways] : []);
    setPinRows(
      Array.isArray(p.pinConnections) && p.pinConnections.length > 0
        ? p.pinConnections.map((r) => ({ ...r }))
        : [{ component: 'Main Sensor', pin: 'GPIO 4', purpose: 'Data signal' }]
    );
    setModalTab('basic');
    setModalOpen(true);
  };

  // Duplicate Project
  const handleDuplicate = (p: IoTProject) => {
    const duplicated: Omit<IoTProject, 'id'> = {
      ...p,
      title: `${p.title} (Copy)`,
      slug: `${p.slug}-copy`,
    };
    addStoredProject(duplicated);
    setProjects(getStoredProjects());
    showToast(`Project duplicated: "${p.title}"`, 'success');
  };

  // Image Upload Handler
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size exceeds 5MB limit.', 'error');
      return;
    }

    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await apiFetch('/admin/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (res && res.url) {
        setImage(res.url);
        showToast('Image uploaded successfully via API!', 'success');
        setUploadingImage(false);
        return;
      }
    } catch {
      // Fallback to local FileReader Base64
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setImage(base64);
        showToast('Image converted & stored successfully!', 'info');
        setUploadingImage(false);
      };
      reader.onerror = () => {
        showToast('Failed to read image file.', 'error');
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add Sensor Tag
  const handleAddSensor = (customVal?: string) => {
    const clean = (customVal || sensorInput).trim();
    if (!clean) return;
    if (sensorsList.includes(clean)) {
      showToast('Sensor already in list', 'info');
      return;
    }
    setSensorsList([...sensorsList, clean]);
    if (!customVal) setSensorInput('');
  };

  // Remove Sensor Tag
  const handleRemoveSensor = (idx: number) => {
    setSensorsList(sensorsList.filter((_, i) => i !== idx));
  };

  // Add Key Takeaway
  const handleAddTakeaway = () => {
    const clean = takeawayInput.trim();
    if (!clean) return;
    setTakeawaysList([...takeawaysList, clean]);
    setTakeawayInput('');
  };

  // Remove Key Takeaway
  const handleRemoveTakeaway = (idx: number) => {
    setTakeawaysList(takeawaysList.filter((_, i) => i !== idx));
  };

  // Pin Connections Builder
  const handleAddPinRow = () => {
    setPinRows([...pinRows, { component: '', pin: '', purpose: '' }]);
  };

  const handleUpdatePinRow = (index: number, field: keyof PinConnectionRow, val: string) => {
    const updated = [...pinRows];
    updated[index][field] = val;
    setPinRows(updated);
  };

  const handleRemovePinRow = (index: number) => {
    if (pinRows.length <= 1) {
      showToast('At least one pin row is required', 'info');
      return;
    }
    setPinRows(pinRows.filter((_, i) => i !== index));
  };

  // Tab navigation helpers
  const currentTabIndex = TABS.findIndex((t) => t.id === modalTab);
  const handleNextTab = () => {
    if (currentTabIndex < TABS.length - 1) {
      setModalTab(TABS[currentTabIndex + 1].id);
    }
  };
  const handlePrevTab = () => {
    if (currentTabIndex > 0) {
      setModalTab(TABS[currentTabIndex - 1].id);
    }
  };

  // Submit Save
  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast('Project title is required!', 'error');
      setModalTab('basic');
      return;
    }

    const levelConfig = IOT_LEVELS[levelNum] || IOT_LEVELS[1];
    const levelName = levelConfig.title as 'Beginner' | 'Intermediate' | 'Advanced';

    const projectPayload: Omit<IoTProject, 'id'> & { id?: number } = {
      title: title.trim(),
      slug: slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      tagline: tagline.trim() || `${levelName} IoT engineering build`,
      image: image.trim() || `/iot/project-${levelNum}.jpg`,
      level: levelName,
      levelNum,
      levelSubtitle: levelSubtitle.trim() || levelConfig.tagline,
      badgeColor: levelConfig.color,
      accentGlow:
        levelNum === 1
          ? 'rgba(0, 212, 255, 0.25)'
          : levelNum === 2
          ? 'rgba(168, 85, 247, 0.25)'
          : 'rgba(0, 229, 160, 0.25)',
      icon: icon.trim() || '⚡',
      description: description.trim() || 'Hands-on IoT project designed for practical hardware mastery.',
      workingPrinciple:
        workingPrinciple.trim() ||
        'Sensors acquire real-world physical parameters converted via microcontroller ADC and logic.',
      realWorldImpact: realWorldImpact.trim() || 'Enables practical smart automation and data monitoring.',
      sensors: sensorsList.length > 0 ? sensorsList : ['Microcontroller', 'Status Indicator'],
      microcontroller: microcontroller.trim() || 'Arduino / ESP32',
      difficulty,
      estimatedHours: estimatedHours.trim() || '4 Hours',
      pinConnections: pinRows.filter((r) => r.component.trim() || r.pin.trim()),
      keyTakeaways:
        takeawaysList.length > 0
          ? takeawaysList
          : ['Microcontroller GPIO interfacing', 'Firmware logic and sensor telemetry'],
      codeSnippet: codeSnippet.trim() || DEFAULT_CODE_TEMPLATE,
      schematicSummary: schematicSummary.trim() || 'Standard breadboard or PCB circuit with regulated power rails.',
    };

    if (editingId) {
      const fullProject: IoTProject = {
        ...projectPayload,
        id: editingId,
      };
      updateStoredProject(fullProject);
      showToast(`Updated "${fullProject.title}" successfully!`, 'success');
    } else {
      const created = addStoredProject(projectPayload);
      showToast(`Created new project: "${created.title}"!`, 'success');
    }

    setProjects(getStoredProjects());
    setModalOpen(false);
  };

  // Delete Action
  const handleDeleteConfirm = () => {
    if (!deleteConfirmProject) return;
    deleteStoredProject(deleteConfirmProject.id);
    setProjects(getStoredProjects());
    showToast(`Deleted "${deleteConfirmProject.title}".`, 'info');
    setDeleteConfirmProject(null);
  };

  // Reset to default 30
  const handleResetCatalog = () => {
    const defaults = resetStoredProjects();
    setProjects(defaults);
    setResetConfirmOpen(false);
    showToast('Reset catalog to the default 30 curated IoT projects!', 'success');
  };

  // Filtered List
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (selectedLevel !== 'all' && p.levelNum !== selectedLevel) return false;
      if (difficultyFilter !== 'all' && p.difficulty !== difficultyFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesDesc = p.description?.toLowerCase().includes(q);
        const matchesSensors = p.sensors?.some((s) => s.toLowerCase().includes(q));
        const matchesMcu = p.microcontroller?.toLowerCase().includes(q);
        const matchesSlug = p.slug?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesSensors && !matchesMcu && !matchesSlug) return false;
      }
      return true;
    });
  }, [projects, selectedLevel, difficultyFilter, searchQuery]);

  // Counts
  const counts = useMemo(() => {
    return {
      total: projects.length,
      level1: projects.filter((p) => p.levelNum === 1).length,
      level2: projects.filter((p) => p.levelNum === 2).length,
      level3: projects.filter((p) => p.levelNum === 3).length,
    };
  }, [projects]);

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '16px 8px 80px', fontFamily: "'Outfit', sans-serif" }}>
      {/* Toast Notification - Highest zIndex */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            zIndex: 100000,
            padding: '14px 22px',
            borderRadius: 10,
            background:
              toast.type === 'error'
                ? 'rgba(239, 68, 68, 0.95)'
                : toast.type === 'info'
                ? 'rgba(59, 130, 246, 0.95)'
                : 'rgba(16, 185, 129, 0.95)',
            color: '#fff',
            fontWeight: 600,
            fontSize: 14,
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <span>{toast.type === 'error' ? '⚠️' : toast.type === 'info' ? 'ℹ️' : '✓'}</span>
          <span>{toast.text}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(13, 20, 37, 0.9) 0%, rgba(20, 25, 45, 0.7) 100%)',
          border: '1px solid rgba(0, 212, 255, 0.25)',
          borderRadius: 16,
          padding: '28px 32px',
          marginBottom: 28,
          boxShadow: '0 12px 35px rgba(0,0,0,0.35)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 20,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 24 }}>⚡</span>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                color: '#00d4ff',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                fontWeight: 700,
              }}
            >
              Hardware & Embedded Lab Control
            </span>
          </div>
          <h1
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 28,
              fontWeight: 800,
              color: '#f4f4f5',
              margin: '0 0 8px 0',
              letterSpacing: '-0.02em',
            }}
          >
            IoT Projects Management
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: '#94a3b8', maxWidth: 680, lineHeight: 1.5 }}>
            Create and maintain category-wise IoT projects with firmware source code, pin connection charts,
            sensor specs, and HD graphics. All updates sync live to the public IoT showcase.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link
            href="/pages/iot-projects"
            target="_blank"
            style={{
              padding: '11px 18px',
              borderRadius: 10,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#e4e4e7',
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              transition: 'all 0.2s',
            }}
          >
            <span>Live Catalog</span>
            <span style={{ color: '#00d4ff' }}>↗</span>
          </Link>

          <button
            onClick={() => setResetConfirmOpen(true)}
            style={{
              padding: '11px 16px',
              borderRadius: 10,
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#fca5a5',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.2s',
            }}
            title="Reset catalog back to the initial 30 projects"
          >
            <span>↺</span>
            <span>Reset 30 Projects</span>
          </button>

          <button
            onClick={handleOpenCreate}
            style={{
              padding: '11px 22px',
              borderRadius: 10,
              background: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)',
              border: 'none',
              color: '#060608',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 18px rgba(0, 212, 255, 0.35)',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: 16 }}>+</span>
            <span>New IoT Project</span>
          </button>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 28,
        }}
      >
        <div
          onClick={() => setSelectedLevel('all')}
          style={{
            background: selectedLevel === 'all' ? 'rgba(0, 212, 255, 0.12)' : 'rgba(13, 20, 37, 0.6)',
            border: `1px solid ${selectedLevel === 'all' ? '#00d4ff' : 'rgba(255, 255, 255, 0.08)'}`,
            borderRadius: 12,
            padding: '16px 20px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>Total Projects</span>
            <span style={{ fontSize: 18 }}>📦</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', fontFamily: "'Syne', sans-serif" }}>
            {counts.total}
          </div>
          <div style={{ fontSize: 11, color: '#00d4ff', marginTop: 4 }}>All Categories Active</div>
        </div>

        <div
          onClick={() => setSelectedLevel(1)}
          style={{
            background: selectedLevel === 1 ? 'rgba(0, 212, 255, 0.12)' : 'rgba(13, 20, 37, 0.6)',
            border: `1px solid ${selectedLevel === 1 ? '#00d4ff' : 'rgba(0, 212, 255, 0.2)'}`,
            borderRadius: 12,
            padding: '16px 20px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>Level 1: Beginner</span>
            <span style={{ fontSize: 18 }}>🌱</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#00d4ff', fontFamily: "'Syne', sans-serif" }}>
            {counts.level1}
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Basic Sensors & Actuators</div>
        </div>

        <div
          onClick={() => setSelectedLevel(2)}
          style={{
            background: selectedLevel === 2 ? 'rgba(168, 85, 247, 0.12)' : 'rgba(13, 20, 37, 0.6)',
            border: `1px solid ${selectedLevel === 2 ? '#a855f7' : 'rgba(168, 85, 247, 0.2)'}`,
            borderRadius: 12,
            padding: '16px 20px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>Level 2: Intermediate</span>
            <span style={{ fontSize: 18 }}>⚙️</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#c084fc', fontFamily: "'Syne', sans-serif" }}>
            {counts.level2}
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Control & Wireless Systems</div>
        </div>

        <div
          onClick={() => setSelectedLevel(3)}
          style={{
            background: selectedLevel === 3 ? 'rgba(0, 229, 160, 0.12)' : 'rgba(13, 20, 37, 0.6)',
            border: `1px solid ${selectedLevel === 3 ? '#00e5a0' : 'rgba(0, 229, 160, 0.2)'}`,
            borderRadius: 12,
            padding: '16px 20px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>Level 3: Advanced</span>
            <span style={{ fontSize: 18 }}>🚀</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#00e5a0', fontFamily: "'Syne', sans-serif" }}>
            {counts.level3}
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Full Cloud & Autonomous IoT</div>
        </div>
      </div>

      {/* Toolbar: Category tabs, Search & Filters */}
      <div
        style={{
          background: 'rgba(13, 20, 37, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 14,
          padding: '16px 20px',
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        {/* Category / Level Pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={() => setSelectedLevel('all')}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              background: selectedLevel === 'all' ? '#00d4ff' : 'rgba(255, 255, 255, 0.06)',
              color: selectedLevel === 'all' ? '#060608' : '#e4e4e7',
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            All Projects ({counts.total})
          </button>
          <button
            onClick={() => setSelectedLevel(1)}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              background: selectedLevel === 1 ? '#00d4ff' : 'rgba(255, 255, 255, 0.06)',
              color: selectedLevel === 1 ? '#060608' : '#e4e4e7',
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            🌱 Level 1 ({counts.level1})
          </button>
          <button
            onClick={() => setSelectedLevel(2)}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              background: selectedLevel === 2 ? '#a855f7' : 'rgba(255, 255, 255, 0.06)',
              color: selectedLevel === 2 ? '#fff' : '#e4e4e7',
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            ⚙️ Level 2 ({counts.level2})
          </button>
          <button
            onClick={() => setSelectedLevel(3)}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              background: selectedLevel === 3 ? '#00e5a0' : 'rgba(255, 255, 255, 0.06)',
              color: selectedLevel === 3 ? '#060608' : '#e4e4e7',
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            🚀 Level 3 ({counts.level3})
          </button>
        </div>

        {/* Right side controls: Search, Difficulty, View Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, MCU, sensor..."
              style={{
                background: 'rgba(6, 10, 20, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 8,
                padding: '8px 14px 8px 34px',
                color: '#fff',
                fontSize: 13,
                width: 240,
                outline: 'none',
              }}
            />
            <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: 13 }}>
              🔍
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: 12,
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Difficulty Dropdown */}
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            style={{
              background: 'rgba(6, 10, 20, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 8,
              padding: '8px 12px',
              color: '#e4e4e7',
              fontSize: 13,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="all">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Moderate">Moderate</option>
            <option value="Advanced">Advanced</option>
          </select>

          {/* View Toggle */}
          <div style={{ display: 'flex', background: 'rgba(0, 0, 0, 0.3)', padding: 3, borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <button
              onClick={() => setViewMode('cards')}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: 'none',
                background: viewMode === 'cards' ? 'rgba(0, 212, 255, 0.2)' : 'transparent',
                color: viewMode === 'cards' ? '#00d4ff' : '#94a3b8',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              ▦ Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: 'none',
                background: viewMode === 'table' ? 'rgba(0, 212, 255, 0.2)' : 'transparent',
                color: viewMode === 'table' ? '#00d4ff' : '#94a3b8',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              ☰ Table
            </button>
          </div>
        </div>
      </div>

      {/* Projects List / Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#94a3b8' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⚡</div>
          <div>Loading IoT Projects Database...</div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div
          style={{
            background: 'rgba(13, 20, 37, 0.4)',
            border: '1px dashed rgba(255, 255, 255, 0.15)',
            borderRadius: 16,
            padding: '60px 20px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 38, marginBottom: 12 }}>🔍</div>
          <h3 style={{ margin: '0 0 8px 0', color: '#f4f4f5' }}>No Matching Projects Found</h3>
          <p style={{ margin: '0 0 20px 0', color: '#94a3b8', fontSize: 14 }}>
            Try adjusting your search criteria or create a new IoT project in this category.
          </p>
          <button
            onClick={handleOpenCreate}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              background: '#00d4ff',
              border: 'none',
              color: '#060608',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            + Add New IoT Project
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        /* CARDS GRID VIEW */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: 22,
          }}
        >
          {filteredProjects.map((p) => {
            const levelInfo = IOT_LEVELS[p.levelNum] || IOT_LEVELS[1];
            const badgeColor = p.badgeColor || levelInfo.color;

            return (
              <div
                key={p.id}
                style={{
                  background: 'rgba(13, 20, 37, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 14,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.25s ease',
                  position: 'relative',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                }}
              >
                {/* Image & Header Overlay */}
                <div style={{ position: 'relative', height: 180, width: '100%', background: '#0a0d1a', overflow: 'hidden' }}>
                  {p.image ? (
                    <img
                      src={normalizeImageUrl(p.image)}
                      alt={p.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : null}

                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(13, 20, 37, 0.95) 0%, rgba(13, 20, 37, 0.3) 60%, rgba(0,0,0,0.7) 100%)',
                    }}
                  />

                  {/* Top tags on image */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      right: 12,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        padding: '3px 9px',
                        borderRadius: 6,
                        background: 'rgba(6, 6, 8, 0.85)',
                        border: `1px solid ${badgeColor}`,
                        color: badgeColor,
                        fontSize: 10.5,
                        fontWeight: 800,
                        letterSpacing: '0.08em',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      LEVEL {p.levelNum} • {p.level.toUpperCase()}
                    </span>

                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: 6,
                        background: 'rgba(0,0,0,0.65)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: '#e4e4e7',
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      ID #{p.id}
                    </span>
                  </div>

                  {/* Microcontroller & Icon badge bottom */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 12,
                      left: 14,
                      right: 14,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-end',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: 'rgba(6, 10, 20, 0.85)',
                          border: `1px solid ${badgeColor}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 16,
                        }}
                      >
                        {p.icon || '⚡'}
                      </span>
                      <div>
                        <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Microcontroller
                        </div>
                        <div style={{ fontSize: 12, color: '#f4f4f5', fontWeight: 600 }}>
                          {p.microcontroller || 'ESP32 / Arduino'}
                        </div>
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: 11,
                        color: '#cbd5e1',
                        background: 'rgba(255,255,255,0.08)',
                        padding: '3px 8px',
                        borderRadius: 6,
                      }}
                    >
                      ⏱ {p.estimatedHours || '4h'}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: '#fff',
                      margin: '0 0 6px 0',
                      fontFamily: "'Syne', sans-serif",
                    }}
                  >
                    {p.title}
                  </h3>

                  <p
                    style={{
                      fontSize: 12.5,
                      color: '#94a3b8',
                      margin: '0 0 14px 0',
                      lineHeight: 1.45,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {p.tagline || p.description}
                  </p>

                  {/* Sensors preview tags */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6, fontWeight: 600 }}>
                      SENSORS & COMPONENTS ({p.sensors?.length || 0}):
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {(p.sensors || []).slice(0, 3).map((s, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: 11,
                            padding: '2px 7px',
                            borderRadius: 4,
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: '#cbd5e1',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                          }}
                        >
                          {s}
                        </span>
                      ))}
                      {(p.sensors?.length || 0) > 3 && (
                        <span
                          style={{
                            fontSize: 10,
                            padding: '2px 6px',
                            borderRadius: 4,
                            background: 'rgba(0, 212, 255, 0.1)',
                            color: '#00d4ff',
                          }}
                        >
                          +{(p.sensors?.length || 0) - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Tech specs summary pills */}
                  <div
                    style={{
                      marginTop: 'auto',
                      paddingTop: 12,
                      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: 11.5,
                      color: '#94a3b8',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ color: badgeColor }}>◆</span>
                      <span>{p.difficulty}</span>
                    </span>

                    <span>📌 {p.pinConnections?.length || 0} Pins</span>

                    <button
                      onClick={() => setCodeDrawerProject(p)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#00d4ff',
                        cursor: 'pointer',
                        fontSize: 11.5,
                        fontWeight: 600,
                        textDecoration: 'underline',
                      }}
                    >
                      &lt;/&gt; Code
                    </button>
                  </div>

                  {/* Card Action Buttons */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 40px',
                      gap: 8,
                      marginTop: 14,
                    }}
                  >
                    <button
                      onClick={() => handleOpenEdit(p)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 8,
                        background: 'rgba(0, 212, 255, 0.1)',
                        border: '1px solid rgba(0, 212, 255, 0.3)',
                        color: '#00d4ff',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        transition: 'all 0.2s',
                      }}
                    >
                      <span>✎</span> Edit
                    </button>

                    <button
                      onClick={() => handleDuplicate(p)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 8,
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#e4e4e7',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 5,
                        transition: 'all 0.2s',
                      }}
                    >
                      <span>⧉</span> Copy
                    </button>

                    <button
                      onClick={() => setDeleteConfirmProject(p)}
                      style={{
                        padding: '8px',
                        borderRadius: 8,
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#f87171',
                        fontSize: 12,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                      }}
                      title="Delete project"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div
          style={{
            background: 'rgba(13, 20, 37, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 14,
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'rgba(6, 10, 20, 0.95)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8' }}>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>ID</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Project Title</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Category / Level</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Microcontroller</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Sensors</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Difficulty</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((p) => {
                  const levelInfo = IOT_LEVELS[p.levelNum] || IOT_LEVELS[1];
                  const badgeColor = p.badgeColor || levelInfo.color;

                  return (
                    <tr
                      key={p.id}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        transition: 'background 0.15s',
                      }}
                    >
                      <td style={{ padding: '14px 18px', fontFamily: "'JetBrains Mono', monospace", color: '#64748b' }}>
                        #{p.id}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ fontSize: 20 }}>{p.icon || '⚡'}</span>
                          <div>
                            <div style={{ fontWeight: 700, color: '#f4f4f5' }}>{p.title}</div>
                            <div style={{ fontSize: 11.5, color: '#94a3b8' }}>{p.tagline}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: 6,
                            background: 'rgba(0,0,0,0.4)',
                            border: `1px solid ${badgeColor}`,
                            color: badgeColor,
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          Level {p.levelNum}: {p.level}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', color: '#cbd5e1' }}>
                        {p.microcontroller || 'ESP32 / Arduino'}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#94a3b8' }}>
                        {p.sensors?.length || 0} sensors
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ color: p.difficulty === 'Easy' ? '#00e5a0' : p.difficulty === 'Moderate' ? '#a855f7' : '#f59e0b', fontWeight: 600 }}>
                          {p.difficulty}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 8 }}>
                          <button
                            onClick={() => handleOpenEdit(p)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: 6,
                              background: 'rgba(0, 212, 255, 0.1)',
                              border: '1px solid rgba(0, 212, 255, 0.3)',
                              color: '#00d4ff',
                              cursor: 'pointer',
                              fontSize: 12,
                              fontWeight: 600,
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDuplicate(p)}
                            style={{
                              padding: '6px 10px',
                              borderRadius: 6,
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              color: '#cbd5e1',
                              cursor: 'pointer',
                              fontSize: 12,
                            }}
                          >
                            Copy
                          </button>
                          <button
                            onClick={() => setDeleteConfirmProject(p)}
                            style={{
                              padding: '6px 10px',
                              borderRadius: 6,
                              background: 'rgba(239, 68, 68, 0.1)',
                              border: '1px solid rgba(239, 68, 68, 0.25)',
                              color: '#f87171',
                              cursor: 'pointer',
                              fontSize: 12,
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* PROFESSIONAL CREATE / EDIT IOT PROJECT MODAL (HIGH Z-INDEX: 99999)         */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999, // Higher than sidebar (z-index: 1000)
            background: 'rgba(3, 6, 14, 0.88)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px 16px',
            overflowY: 'auto',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div
            style={{
              background: '#0c101c',
              border: '1px solid rgba(0, 212, 255, 0.35)',
              borderRadius: 20,
              width: '100%',
              maxWidth: 960,
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 80px rgba(0, 0, 0, 0.95), 0 0 40px rgba(0, 212, 255, 0.12)',
              overflow: 'hidden',
              animation: 'modalEnter 0.25s ease-out',
              margin: 'auto',
              position: 'relative',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 28px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(6, 10, 20, 0.98)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 10.5,
                      color: levelNum === 1 ? '#00d4ff' : levelNum === 2 ? '#c084fc' : '#00e5a0',
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      fontWeight: 700,
                      background: 'rgba(255, 255, 255, 0.05)',
                      padding: '2px 8px',
                      borderRadius: 4,
                    }}
                  >
                    LEVEL {levelNum} • {levelNum === 1 ? 'BEGINNER' : levelNum === 2 ? 'INTERMEDIATE' : 'ADVANCED'}
                  </span>
                  {editingId && (
                    <span style={{ fontSize: 11, color: '#64748b', fontFamily: "'JetBrains Mono', monospace" }}>
                      ID #{editingId}
                    </span>
                  )}
                </div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 20,
                    fontWeight: 800,
                    color: '#fff',
                    fontFamily: "'Syne', sans-serif",
                    letterSpacing: '-0.02em',
                  }}
                >
                  {editingId ? title || 'Edit IoT Project' : 'Upload & Configure New IoT Project'}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '50%',
                  width: 36,
                  height: 36,
                  color: '#e4e4e7',
                  fontSize: 16,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
                title="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div
              style={{
                display: 'flex',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'rgba(10, 14, 26, 0.95)',
                padding: '0 20px',
                overflowX: 'auto',
                gap: 4,
              }}
            >
              {TABS.map((t) => {
                const isActive = modalTab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setModalTab(t.id)}
                    style={{
                      padding: '13px 18px',
                      border: 'none',
                      borderBottom: isActive ? '2px solid #00d4ff' : '2px solid transparent',
                      background: isActive ? 'rgba(0, 212, 255, 0.08)' : 'transparent',
                      color: isActive ? '#00d4ff' : '#94a3b8',
                      fontSize: 13,
                      fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 7,
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span>{t.icon}</span>
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Form Container with Scrollable Body & Sticky Footer */}
            <form
              onSubmit={handleSaveProject}
              style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            >
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
                {/* TAB 1: BASIC INFO & LEVEL */}
                {modalTab === 'basic' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#e4e4e7', marginBottom: 6 }}>
                          Project Title *
                        </label>
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => {
                            setTitle(e.target.value);
                            if (!editingId) {
                              setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                            }
                          }}
                          placeholder="e.g. Smart Irrigation System"
                          required
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: 8,
                            background: 'rgba(6, 10, 20, 0.85)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            color: '#fff',
                            fontSize: 14,
                            outline: 'none',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#e4e4e7', marginBottom: 6 }}>
                          URL Slug
                        </label>
                        <input
                          type="text"
                          value={slug}
                          onChange={(e) => setSlug(e.target.value)}
                          placeholder="smart-irrigation"
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: 8,
                            background: 'rgba(6, 10, 20, 0.85)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            color: '#00d4ff',
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 13,
                            outline: 'none',
                          }}
                        />
                      </div>
                    </div>

                    {/* Level Category Picker */}
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#e4e4e7', marginBottom: 8 }}>
                        Project Category & Progression Tier *
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
                        {[
                          { num: 1 as const, title: '🌱 Level 1: Beginner', desc: 'Simple sensors, basic ADC & buzzers', color: '#00d4ff' },
                          { num: 2 as const, title: '⚙️ Level 2: Intermediate', desc: 'Motor control, Bluetooth & feedback', color: '#a855f7' },
                          { num: 3 as const, title: '🚀 Level 3: Advanced', desc: 'Cloud IoT, Dual-axis & Automation', color: '#00e5a0' },
                        ].map((lvl) => (
                          <div
                            key={lvl.num}
                            onClick={() => handleLevelChange(lvl.num)}
                            style={{
                              padding: '14px 16px',
                              borderRadius: 10,
                              background: levelNum === lvl.num ? `${lvl.color}15` : 'rgba(6, 10, 20, 0.6)',
                              border: `2px solid ${levelNum === lvl.num ? lvl.color : 'rgba(255, 255, 255, 0.08)'}`,
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              position: 'relative',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                              <span style={{ fontWeight: 700, color: lvl.color, fontSize: 14 }}>
                                {lvl.title}
                              </span>
                              {levelNum === lvl.num && (
                                <span style={{ color: lvl.color, fontSize: 12, fontWeight: 800 }}>✓ ACTIVE</span>
                              )}
                            </div>
                            <div style={{ fontSize: 11.5, color: '#94a3b8', lineHeight: 1.35 }}>
                              {lvl.desc}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#e4e4e7', marginBottom: 6 }}>
                        Tagline / One-Line Hook
                      </label>
                      <input
                        type="text"
                        value={tagline}
                        onChange={(e) => setTagline(e.target.value)}
                        placeholder="e.g. Precision soil moisture monitoring with automatic submersible relay pump"
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: 8,
                          background: 'rgba(6, 10, 20, 0.85)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#fff',
                          fontSize: 13,
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#e4e4e7', marginBottom: 6 }}>
                          Microcontroller
                        </label>
                        <input
                          type="text"
                          value={microcontroller}
                          onChange={(e) => setMicrocontroller(e.target.value)}
                          placeholder="e.g. ESP32 / Arduino Uno"
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: 8,
                            background: 'rgba(6, 10, 20, 0.85)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            color: '#fff',
                            fontSize: 13,
                            outline: 'none',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#e4e4e7', marginBottom: 6 }}>
                          Difficulty Level
                        </label>
                        <select
                          value={difficulty}
                          onChange={(e) => setDifficulty(e.target.value as any)}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: 8,
                            background: 'rgba(6, 10, 20, 0.85)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            color: '#fff',
                            fontSize: 13,
                            outline: 'none',
                          }}
                        >
                          <option value="Easy">Easy</option>
                          <option value="Moderate">Moderate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#e4e4e7', marginBottom: 6 }}>
                          Estimated Duration
                        </label>
                        <input
                          type="text"
                          value={estimatedHours}
                          onChange={(e) => setEstimatedHours(e.target.value)}
                          placeholder="e.g. 3 - 5 Hours"
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: 8,
                            background: 'rgba(6, 10, 20, 0.85)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            color: '#fff',
                            fontSize: 13,
                            outline: 'none',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#e4e4e7', marginBottom: 6 }}>
                          Project Icon (Emoji)
                        </label>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <input
                            type="text"
                            value={icon}
                            onChange={(e) => setIcon(e.target.value)}
                            placeholder="⚡"
                            style={{
                              width: 60,
                              padding: '10px 8px',
                              borderRadius: 8,
                              background: 'rgba(6, 10, 20, 0.85)',
                              border: '1px solid rgba(255, 255, 255, 0.12)',
                              color: '#fff',
                              fontSize: 16,
                              textAlign: 'center',
                              outline: 'none',
                            }}
                          />
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            {SUGGESTED_EMOJIS.slice(0, 6).map((em) => (
                              <button
                                key={em}
                                type="button"
                                onClick={() => setIcon(em)}
                                style={{
                                  background: 'rgba(255, 255, 255, 0.05)',
                                  border: '1px solid rgba(255, 255, 255, 0.1)',
                                  borderRadius: 6,
                                  padding: '5px 8px',
                                  fontSize: 14,
                                  cursor: 'pointer',
                                }}
                              >
                                {em}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: IMAGE & GRAPHICS */}
                {modalTab === 'media' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#e4e4e7', marginBottom: 6 }}>
                        Project Image Asset (URL or Upload)
                      </label>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <input
                          type="text"
                          value={image}
                          onChange={(e) => setImage(e.target.value)}
                          placeholder="Paste image URL (e.g. /iot/project-1.jpg or https://...)"
                          style={{
                            flex: 1,
                            padding: '10px 14px',
                            borderRadius: 8,
                            background: 'rgba(6, 10, 20, 0.85)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            color: '#fff',
                            fontSize: 13,
                            outline: 'none',
                          }}
                        />
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={handleImageFileChange}
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingImage}
                          style={{
                            padding: '10px 18px',
                            borderRadius: 8,
                            background: 'rgba(0, 212, 255, 0.15)',
                            border: '1px solid rgba(0, 212, 255, 0.35)',
                            color: '#00d4ff',
                            fontWeight: 700,
                            fontSize: 13,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {uploadingImage ? 'Uploading...' : '📁 Choose File'}
                        </button>
                      </div>
                      <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 6 }}>
                        Supports PNG, JPG, WebP. Recommended aspect ratio 16:9 or 4:3.
                      </div>
                    </div>

                    {/* Live Image Preview */}
                    <div
                      style={{
                        border: '1px dashed rgba(255, 255, 255, 0.15)',
                        borderRadius: 12,
                        padding: 20,
                        background: 'rgba(6, 10, 20, 0.5)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: 240,
                      }}
                    >
                      {image ? (
                        <div style={{ position: 'relative', maxWidth: 480, width: '100%', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(0, 212, 255, 0.3)' }}>
                          <img
                            src={normalizeImageUrl(image)}
                            alt="Project Preview"
                            style={{ width: '100%', maxHeight: 280, objectFit: 'contain', background: '#050814', padding: 8 }}
                          />
                          <button
                            type="button"
                            onClick={() => setImage('')}
                            style={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              background: 'rgba(0,0,0,0.8)',
                              border: '1px solid rgba(255,255,255,0.2)',
                              color: '#fff',
                              borderRadius: '50%',
                              width: 30,
                              height: 30,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            title="Remove image"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', color: '#64748b' }}>
                          <div style={{ fontSize: 40, marginBottom: 8 }}>🖼️</div>
                          <div style={{ fontSize: 14, color: '#e4e4e7', fontWeight: 600 }}>No Image Selected</div>
                          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                            Upload an image file from your device or paste an image link above.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 3: DESCRIPTION & THEORY */}
                {modalTab === 'details' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#e4e4e7', marginBottom: 6 }}>
                        Full Project Overview & Description *
                      </label>
                      <textarea
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe what this IoT build achieves, who it helps, and how it behaves in practice..."
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: 8,
                          background: 'rgba(6, 10, 20, 0.85)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#fff',
                          fontSize: 13,
                          outline: 'none',
                          lineHeight: 1.5,
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#e4e4e7', marginBottom: 6 }}>
                        Working Principle (Electronics, Science & Formulas)
                      </label>
                      <textarea
                        rows={3}
                        value={workingPrinciple}
                        onChange={(e) => setWorkingPrinciple(e.target.value)}
                        placeholder="Explain how the sensors acquire data, timing calculations, ADC readings, or control loops..."
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: 8,
                          background: 'rgba(6, 10, 20, 0.85)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#fff',
                          fontSize: 13,
                          outline: 'none',
                          lineHeight: 1.5,
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#e4e4e7', marginBottom: 6 }}>
                        Real-World Impact & Industry Use Case
                      </label>
                      <textarea
                        rows={2}
                        value={realWorldImpact}
                        onChange={(e) => setRealWorldImpact(e.target.value)}
                        placeholder="Where is this deployed in modern industry, medical devices, or smart cities?"
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: 8,
                          background: 'rgba(6, 10, 20, 0.85)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#fff',
                          fontSize: 13,
                          outline: 'none',
                          lineHeight: 1.5,
                        }}
                      />
                    </div>

                    {/* Educational Key Takeaways Builder */}
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#e4e4e7', marginBottom: 6 }}>
                        Key Learning Takeaways ({takeawaysList.length})
                      </label>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                        <input
                          type="text"
                          value={takeawayInput}
                          onChange={(e) => setTakeawayInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddTakeaway();
                            }
                          }}
                          placeholder="Add learning objective (e.g. I2C protocol address resolution)..."
                          style={{
                            flex: 1,
                            padding: '9px 12px',
                            borderRadius: 8,
                            background: 'rgba(6, 10, 20, 0.85)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            color: '#fff',
                            fontSize: 13,
                            outline: 'none',
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleAddTakeaway}
                          style={{
                            padding: '9px 16px',
                            borderRadius: 8,
                            background: 'rgba(0, 212, 255, 0.15)',
                            border: '1px solid rgba(0, 212, 255, 0.35)',
                            color: '#00d4ff',
                            fontWeight: 700,
                            fontSize: 12.5,
                            cursor: 'pointer',
                          }}
                        >
                          + Add Bullet
                        </button>
                      </div>

                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {takeawaysList.map((t, idx) => (
                          <li
                            key={idx}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              background: 'rgba(255, 255, 255, 0.04)',
                              padding: '8px 12px',
                              borderRadius: 6,
                              fontSize: 12.5,
                              color: '#e4e4e7',
                            }}
                          >
                            <span>• {t}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTakeaway(idx)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#f87171',
                                cursor: 'pointer',
                                fontSize: 13,
                              }}
                            >
                              ✕
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* TAB 4: SENSORS & PIN MAP */}
                {modalTab === 'hardware' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Sensors Tags Input */}
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#e4e4e7', marginBottom: 6 }}>
                        Sensors & Hardware Components
                      </label>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                        <input
                          type="text"
                          value={sensorInput}
                          onChange={(e) => setSensorInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddSensor();
                            }
                          }}
                          placeholder="Type sensor (e.g. DHT11, SG90 Servo) and press Enter..."
                          style={{
                            flex: 1,
                            padding: '9px 12px',
                            borderRadius: 8,
                            background: 'rgba(6, 10, 20, 0.85)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            color: '#fff',
                            fontSize: 13,
                            outline: 'none',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleAddSensor()}
                          style={{
                            padding: '9px 16px',
                            borderRadius: 8,
                            background: 'rgba(0, 212, 255, 0.15)',
                            border: '1px solid rgba(0, 212, 255, 0.35)',
                            color: '#00d4ff',
                            fontWeight: 700,
                            fontSize: 12.5,
                            cursor: 'pointer',
                          }}
                        >
                          + Add Tag
                        </button>
                      </div>

                      {/* Popular Quick Suggestions */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12, alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: '#64748b' }}>Quick add:</span>
                        {POPULAR_SENSORS.map((ps) => (
                          <button
                            key={ps}
                            type="button"
                            onClick={() => handleAddSensor(ps)}
                            style={{
                              background: 'rgba(255, 255, 255, 0.04)',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                              borderRadius: 4,
                              padding: '2px 7px',
                              fontSize: 11,
                              color: '#cbd5e1',
                              cursor: 'pointer',
                            }}
                          >
                            + {ps}
                          </button>
                        ))}
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {sensorsList.map((s, idx) => (
                          <span
                            key={idx}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '4px 10px',
                              borderRadius: 6,
                              background: 'rgba(0, 212, 255, 0.12)',
                              border: '1px solid rgba(0, 212, 255, 0.25)',
                              color: '#00d4ff',
                              fontSize: 12,
                            }}
                          >
                            <span>{s}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSensor(idx)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#94a3b8',
                                cursor: 'pointer',
                                fontSize: 11,
                              }}
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Pin Mapping Builder Table */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <label style={{ fontSize: 12, fontWeight: 700, color: '#e4e4e7' }}>
                          Pin Connections & Wiring Blueprint ({pinRows.length} Rows)
                        </label>
                        <button
                          type="button"
                          onClick={handleAddPinRow}
                          style={{
                            padding: '4px 10px',
                            borderRadius: 6,
                            background: 'rgba(0, 212, 255, 0.15)',
                            border: '1px solid rgba(0, 212, 255, 0.3)',
                            color: '#00d4ff',
                            fontSize: 11.5,
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          + Add Pin Row
                        </button>
                      </div>

                      <div style={{ border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 8, overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12.5 }}>
                          <thead>
                            <tr style={{ background: 'rgba(6, 10, 20, 0.9)', color: '#94a3b8' }}>
                              <th style={{ padding: '8px 12px' }}>Component / Sensor Pin</th>
                              <th style={{ padding: '8px 12px' }}>Microcontroller GPIO</th>
                              <th style={{ padding: '8px 12px' }}>Purpose / Signal Description</th>
                              <th style={{ padding: '8px 12px', width: 40 }}></th>
                            </tr>
                          </thead>
                          <tbody>
                            {pinRows.map((row, idx) => (
                              <tr key={idx} style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                <td style={{ padding: '6px 10px' }}>
                                  <input
                                    type="text"
                                    value={row.component}
                                    onChange={(e) => handleUpdatePinRow(idx, 'component', e.target.value)}
                                    placeholder="e.g. HC-SR04 Trig"
                                    style={{
                                      width: '100%',
                                      padding: '6px 8px',
                                      borderRadius: 4,
                                      background: 'rgba(6, 10, 20, 0.7)',
                                      border: '1px solid rgba(255, 255, 255, 0.1)',
                                      color: '#fff',
                                      fontSize: 12,
                                      outline: 'none',
                                    }}
                                  />
                                </td>
                                <td style={{ padding: '6px 10px' }}>
                                  <input
                                    type="text"
                                    value={row.pin}
                                    onChange={(e) => handleUpdatePinRow(idx, 'pin', e.target.value)}
                                    placeholder="e.g. Digital D9 / GPIO 4"
                                    style={{
                                      width: '100%',
                                      padding: '6px 8px',
                                      borderRadius: 4,
                                      background: 'rgba(6, 10, 20, 0.7)',
                                      border: '1px solid rgba(255, 255, 255, 0.1)',
                                      color: '#00d4ff',
                                      fontFamily: "'JetBrains Mono', monospace",
                                      fontSize: 12,
                                      outline: 'none',
                                    }}
                                  />
                                </td>
                                <td style={{ padding: '6px 10px' }}>
                                  <input
                                    type="text"
                                    value={row.purpose}
                                    onChange={(e) => handleUpdatePinRow(idx, 'purpose', e.target.value)}
                                    placeholder="e.g. 10µs ultrasound pulse trigger"
                                    style={{
                                      width: '100%',
                                      padding: '6px 8px',
                                      borderRadius: 4,
                                      background: 'rgba(6, 10, 20, 0.7)',
                                      border: '1px solid rgba(255, 255, 255, 0.1)',
                                      color: '#cbd5e1',
                                      fontSize: 12,
                                      outline: 'none',
                                    }}
                                  />
                                </td>
                                <td style={{ padding: '6px 10px', textAlign: 'center' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleRemovePinRow(idx)}
                                    style={{
                                      background: 'transparent',
                                      border: 'none',
                                      color: '#f87171',
                                      cursor: 'pointer',
                                      fontSize: 14,
                                    }}
                                  >
                                    ✕
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#e4e4e7', marginBottom: 6 }}>
                        Schematic / Circuit Diagram Summary
                      </label>
                      <textarea
                        rows={2}
                        value={schematicSummary}
                        onChange={(e) => setSchematicSummary(e.target.value)}
                        placeholder="e.g. Connect pull-up 10k resistor to DHT11 data pin; drive buzzer via NPN 2N2222 transistor."
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: 8,
                          background: 'rgba(6, 10, 20, 0.85)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#fff',
                          fontSize: 13,
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* TAB 5: FIRMWARE SOURCE CODE */}
                {modalTab === 'code' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#e4e4e7' }}>
                        Production Firmware Code (Arduino C++ / MicroPython)
                      </label>
                      <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace" }}>
                        Lines: {codeSnippet.split('\n').length}
                      </span>
                    </div>

                    <div
                      style={{
                        position: 'relative',
                        border: '1px solid rgba(0, 212, 255, 0.25)',
                        borderRadius: 10,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          background: 'rgba(6, 10, 20, 0.95)',
                          padding: '8px 14px',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: 12,
                          color: '#94a3b8',
                        }}
                      >
                        <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>firmware.ino</span>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            type="button"
                            onClick={() => {
                              setCodeSnippet(DEFAULT_CODE_TEMPLATE);
                              showToast('Template code reset', 'info');
                            }}
                            style={{
                              background: 'rgba(255, 255, 255, 0.06)',
                              border: 'none',
                              color: '#cbd5e1',
                              padding: '3px 8px',
                              borderRadius: 4,
                              fontSize: 11,
                              cursor: 'pointer',
                            }}
                          >
                            Reset Template
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(codeSnippet);
                              showToast('Code copied to clipboard!', 'info');
                            }}
                            style={{
                              background: 'rgba(0, 212, 255, 0.15)',
                              border: '1px solid rgba(0, 212, 255, 0.3)',
                              color: '#00d4ff',
                              padding: '3px 8px',
                              borderRadius: 4,
                              fontSize: 11,
                              cursor: 'pointer',
                            }}
                          >
                            Copy Code
                          </button>
                        </div>
                      </div>

                      <textarea
                        rows={16}
                        value={codeSnippet}
                        onChange={(e) => setCodeSnippet(e.target.value)}
                        placeholder="// Paste full production firmware code here..."
                        style={{
                          width: '100%',
                          padding: '16px',
                          background: '#040711',
                          border: 'none',
                          color: '#38bdf8',
                          fontFamily: "'JetBrains Mono', 'Consolas', monospace",
                          fontSize: 13,
                          lineHeight: 1.6,
                          outline: 'none',
                          resize: 'vertical',
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Form Sticky Footer Action Buttons */}
              <div
                style={{
                  padding: '16px 28px',
                  background: 'rgba(6, 10, 20, 0.98)',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 12, color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace" }}>
                    Tab {currentTabIndex + 1} of {TABS.length}
                  </span>
                  {currentTabIndex > 0 && (
                    <button
                      type="button"
                      onClick={handlePrevTab}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#cbd5e1',
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      ← Previous
                    </button>
                  )}
                  {currentTabIndex < TABS.length - 1 && (
                    <button
                      type="button"
                      onClick={handleNextTab}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        background: 'rgba(0, 212, 255, 0.12)',
                        border: '1px solid rgba(0, 212, 255, 0.25)',
                        color: '#00d4ff',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Next Step →
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    style={{
                      padding: '10px 18px',
                      borderRadius: 8,
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#e4e4e7',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    style={{
                      padding: '10px 24px',
                      borderRadius: 8,
                      background: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)',
                      border: 'none',
                      color: '#060608',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 18px rgba(0, 212, 255, 0.35)',
                    }}
                  >
                    {editingId ? '✓ Save Changes' : '+ Publish IoT Project'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* QUICK FIRMWARE CODE DRAWER / MODAL (HIGH Z-INDEX: 99999)                   */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {codeDrawerProject && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setCodeDrawerProject(null)}
        >
          <div
            style={{
              background: '#0a0e1a',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              borderRadius: 16,
              maxWidth: 760,
              width: '100%',
              maxHeight: '84vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 60px rgba(0,0,0,0.85)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '16px 22px',
                background: 'rgba(6, 10, 20, 0.98)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: 11, color: '#00d4ff', fontFamily: "'JetBrains Mono', monospace" }}>
                  FIRMWARE CODE
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>
                  {codeDrawerProject.title}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(codeDrawerProject.codeSnippet || '');
                    showToast('Code copied!', 'success');
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    background: 'rgba(0, 212, 255, 0.15)',
                    border: '1px solid rgba(0, 212, 255, 0.3)',
                    color: '#00d4ff',
                    fontSize: 12,
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Copy Code
                </button>
                <button
                  onClick={() => setCodeDrawerProject(null)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: 'none',
                    borderRadius: '50%',
                    width: 30,
                    height: 30,
                    color: '#94a3b8',
                    cursor: 'pointer',
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            <pre
              style={{
                margin: 0,
                padding: 20,
                background: '#040711',
                color: '#38bdf8',
                fontFamily: "'JetBrains Mono', 'Consolas', monospace",
                fontSize: 12.5,
                lineHeight: 1.6,
                overflowY: 'auto',
                flex: 1,
              }}
            >
              <code>{codeDrawerProject.codeSnippet}</code>
            </pre>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* DELETE CONFIRMATION DIALOG (HIGH Z-INDEX: 99999)                           */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {deleteConfirmProject && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setDeleteConfirmProject(null)}
        >
          <div
            style={{
              background: '#0e111d',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 16,
              padding: 26,
              maxWidth: 440,
              width: '100%',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 32, marginBottom: 12 }}>🗑️</div>
            <h3 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: 18 }}>Delete IoT Project?</h3>
            <p style={{ margin: '0 0 20px 0', color: '#94a3b8', fontSize: 13.5, lineHeight: 1.5 }}>
              Are you sure you want to remove <strong>&ldquo;{deleteConfirmProject.title}&rdquo;</strong>? This
              will remove it from the IoT Catalog.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => setDeleteConfirmProject(null)}
                style={{
                  padding: '9px 16px',
                  borderRadius: 8,
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  color: '#e4e4e7',
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                style={{
                  padding: '9px 18px',
                  borderRadius: 8,
                  background: '#ef4444',
                  border: 'none',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* RESET CATALOG CONFIRMATION DIALOG (HIGH Z-INDEX: 99999)                    */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {resetConfirmOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setResetConfirmOpen(false)}
        >
          <div
            style={{
              background: '#0e111d',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 16,
              padding: 26,
              maxWidth: 460,
              width: '100%',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 32, marginBottom: 12 }}>↺</div>
            <h3 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: 18 }}>Reset to Default 30 Projects?</h3>
            <p style={{ margin: '0 0 20px 0', color: '#94a3b8', fontSize: 13.5, lineHeight: 1.5 }}>
              This will reset the catalog back to the original 30 D-Kode Era embedded projects (Blind Stick, Smart Irrigation,
              Solar Tracker, etc.). Any custom added projects will be reset.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => setResetConfirmOpen(false)}
                style={{
                  padding: '9px 16px',
                  borderRadius: 8,
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  color: '#e4e4e7',
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleResetCatalog}
                style={{
                  padding: '9px 18px',
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  border: 'none',
                  color: '#060608',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Reset to Default 30
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
