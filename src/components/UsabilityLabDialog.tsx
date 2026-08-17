'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  FlaskConical,
  Play,
  CheckCircle2,
  Download,
  RotateCcw,
  Clock,
  Compass,
  FileSpreadsheet,
} from 'lucide-react';
import {
  ExperimentType,
  AnyCondition,
  ConditionA,
  ConditionB,
  ConditionC,
  TaskRecord,
  SUSResult,
  NasaTlxDimensions,
  NasaTlxResult,
  UsabilityExperimentSession,
} from '@/types/usability';
import {
  STANDARD_SUS_QUESTIONS,
  EXPERIMENT_TASKS,
  calculateSUSScore,
  calculateNasaTlxScore,
  exportSessionsToCsv,
} from '@/lib/usability-evaluator';
import type { FeatureCollection } from 'geojson';

interface UsabilityLabDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  is3d: boolean;
  onToggle3d: () => void;
  onSetExperimentCondition?: (condition: {
    backgroundColor?: string;
    enableAtmosphere?: boolean;
    atmosphereSaturationShift?: number;
    atmosphereBrightnessShift?: number;
  }) => void;
  onLoadTestFeatures?: (geojson: FeatureCollection) => void;
}

export default function UsabilityLabDialog({
  open,
  onOpenChange,
  is3d,
  onToggle3d,
  onSetExperimentCondition,
  onLoadTestFeatures,
}: UsabilityLabDialogProps) {
  const [activeTab, setActiveTab] = useState<'setup' | 'runner' | 'survey' | 'results'>('setup');
  const [participantId, setParticipantId] = useState('GIS_USER_01');
  const [experimentType, setExperimentType] = useState<ExperimentType>('EXPERIMENT_C');
  const [conditionA, setConditionA] = useState<ConditionA>('dark_gradient');
  const [conditionB, setConditionB] = useState<ConditionB>('subtle_atmosphere');
  const [conditionC, setConditionC] = useState<ConditionC>('3d_globe');

  // Session state
  const [currentSession, setCurrentSession] = useState<UsabilityExperimentSession | null>(null);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<TaskRecord[]>([]);
  const [allSessions, setAllSessions] = useState<UsabilityExperimentSession[]>([]);

  // Survey states
  const [susResponses, setSusResponses] = useState<Record<number, number>>({
    1: 4, 2: 2, 3: 4, 4: 2, 5: 4,
    6: 2, 7: 4, 8: 2, 9: 4, 10: 2,
  });
  const [susResult, setSusResult] = useState<SUSResult | null>(null);

  const [tlxDimensions, setTlxDimensions] = useState<NasaTlxDimensions>({
    mentalDemand: 30,
    physicalDemand: 20,
    temporalDemand: 35,
    performance: 20,
    effort: 30,
    frustration: 15,
  });
  const [tlxResult, setTlxResult] = useState<NasaTlxResult | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const activeCondition: AnyCondition =
    experimentType === 'EXPERIMENT_A'
      ? conditionA
      : experimentType === 'EXPERIMENT_B'
      ? conditionB
      : conditionC;

  const currentTasks = EXPERIMENT_TASKS[experimentType];
  const activeTask = currentTasks[currentTaskIndex];

  // Apply visual environment to 3D/2D map based on condition
  const applyExperimentCondition = useCallback((type: ExperimentType, cond: AnyCondition) => {
    if (type === 'EXPERIMENT_A') {
      if (cond === 'black') {
        onSetExperimentCondition?.({ backgroundColor: '#000000', enableAtmosphere: true });
      } else if (cond === 'dark_gradient') {
        onSetExperimentCondition?.({ backgroundColor: '#02040a', enableAtmosphere: true });
      } else {
        onSetExperimentCondition?.({ backgroundColor: '#050914', enableAtmosphere: true });
      }
      if (!is3d) onToggle3d();
    } else if (type === 'EXPERIMENT_B') {
      if (cond === 'no_atmosphere') {
        onSetExperimentCondition?.({ enableAtmosphere: false });
      } else if (cond === 'subtle_atmosphere') {
        onSetExperimentCondition?.({
          enableAtmosphere: true,
          atmosphereSaturationShift: -0.25,
          atmosphereBrightnessShift: -0.1,
        });
      } else {
        onSetExperimentCondition?.({
          enableAtmosphere: true,
          atmosphereSaturationShift: 0.6,
          atmosphereBrightnessShift: 0.4,
        });
      }
      if (!is3d) onToggle3d();
    } else if (type === 'EXPERIMENT_C') {
      if (cond === '3d_globe' && !is3d) {
        onToggle3d();
      } else if (cond === '2d_mercator' && is3d) {
        onToggle3d();
      }
    }
  }, [is3d, onSetExperimentCondition, onToggle3d]);

  // Generate test feature data for the active task
  const handleLoadTaskData = useCallback(() => {
    const mockGeoJSON: FeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          id: 'exp_a_target_1',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [106.82, -6.17],
                [106.84, -6.17],
                [106.84, -6.19],
                [106.82, -6.19],
                [106.82, -6.17],
              ],
            ],
          },
          properties: { name: 'Target Polygon A1 (Focus Area)', stroke: '#ec4899', fill: 'rgba(236,72,153,0.3)' },
        },
        {
          type: 'Feature',
          id: 'exp_a_target_2',
          geometry: {
            type: 'Point',
            coordinates: [106.8271, -6.1754],
          },
          properties: { name: 'Target Landmark A2', stroke: '#3b82f6' },
        },
        {
          type: 'Feature',
          id: 'exp_b_target_1',
          geometry: {
            type: 'Point',
            coordinates: [139.6917, 35.6895], // Tokyo
          },
          properties: { name: 'Horizon Target Feature B1', stroke: '#10b981' },
        },
        {
          type: 'Feature',
          id: 'exp_c_target_macro',
          geometry: {
            type: 'Point',
            coordinates: [106.8456, -6.2088], // Jakarta
          },
          properties: { name: 'Zona Target Makro C1 (Jakarta)', stroke: '#8b5cf6' },
        },
      ],
    };

    onLoadTestFeatures?.(mockGeoJSON);
  }, [onLoadTestFeatures]);

  // Start new experiment session
  const handleStartSession = () => {
    applyExperimentCondition(experimentType, activeCondition);
    const newSession: UsabilityExperimentSession = {
      sessionId: `sess_${Date.now()}`,
      participantId,
      experimentType,
      condition: activeCondition,
      startedAt: new Date().toISOString(),
      tasks: [],
    };
    setCurrentSession(newSession);
    setCurrentTaskIndex(0);
    setCompletedTasks([]);
    setErrorCount(0);
    setElapsedMs(0);
    setIsRunning(false);
    setActiveTab('runner');
  };

  // Timer controls
  const handleStartTaskTimer = () => {
    setIsRunning(true);
    startTimeRef.current = performance.now() - elapsedMs;
    timerRef.current = setInterval(() => {
      setElapsedMs(Math.round(performance.now() - startTimeRef.current));
    }, 50);
  };

  const handlePauseTaskTimer = () => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleResetTaskTimer = () => {
    handlePauseTaskTimer();
    setElapsedMs(0);
    setErrorCount(0);
  };

  const handleRecordError = () => {
    setErrorCount((prev) => prev + 1);
  };

  const handleCompleteCurrentTask = () => {
    handlePauseTaskTimer();
    if (!activeTask) return;

    const taskRecord: TaskRecord = {
      taskId: activeTask.id,
      title: activeTask.title,
      condition: activeCondition,
      durationMs: elapsedMs,
      errorClicks: errorCount,
      success: true,
      timestamp: new Date().toISOString(),
    };

    const updatedTasks = [...completedTasks, taskRecord];
    setCompletedTasks(updatedTasks);

    if (currentTaskIndex + 1 < currentTasks.length) {
      setCurrentTaskIndex((prev) => prev + 1);
      setElapsedMs(0);
      setErrorCount(0);
    } else {
      // All tasks finished -> move to survey
      setActiveTab('survey');
    }
  };

  const handleCalculateSurveyAndFinish = () => {
    if (!currentSession) return;

    const calculatedSUS = calculateSUSScore(susResponses);
    const calculatedTLX = calculateNasaTlxScore(tlxDimensions);

    setSusResult(calculatedSUS);
    setTlxResult(calculatedTLX);

    const finalizedSession: UsabilityExperimentSession = {
      ...currentSession,
      completedAt: new Date().toISOString(),
      tasks: completedTasks,
      susResult: calculatedSUS,
      nasaTlxResult: calculatedTLX,
    };

    setCurrentSession(finalizedSession);
    setAllSessions((prev) => [...prev, finalizedSession]);
    setActiveTab('results');
  };

  const handleDownloadCsv = () => {
    const csvContent = exportSessionsToCsv(
      currentSession ? [...allSessions.filter((s) => s.sessionId !== currentSession.sessionId), currentSession] : allSessions
    );
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `geovara_usability_study_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadJson = () => {
    const data = currentSession ? [...allSessions, currentSession] : allSessions;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `geovara_usability_study_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const meanTaskDuration =
    completedTasks.length > 0
      ? (completedTasks.reduce((sum, t) => sum + t.durationMs, 0) / completedTasks.length / 1000).toFixed(2)
      : '0.00';

  const totalErrors = completedTasks.reduce((sum, t) => sum + t.errorClicks, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6 bg-card border-border shadow-2xl">
        <DialogHeader className="mb-4">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-cyan-500" />
            <DialogTitle className="text-lg font-bold">
              Geovara Usability & Evaluation Lab (Bab 24 & 25)
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Kerangka kerja evaluasi usabilitas spasial formal: Eksperimen A (Background), B (Atmosphere), C (2D vs 3D),
            pengukuran Task Completion Time, System Usability Scale (SUS), dan indeks beban kerja NASA-TLX.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as typeof activeTab)}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="setup" className="text-xs">
              1. Protokol & Setup
            </TabsTrigger>
            <TabsTrigger value="runner" className="text-xs" disabled={!currentSession}>
              2. Task Runner ({completedTasks.length}/{currentTasks.length})
            </TabsTrigger>
            <TabsTrigger value="survey" className="text-xs" disabled={completedTasks.length === 0}>
              3. SUS & NASA-TLX
            </TabsTrigger>
            <TabsTrigger value="results" className="text-xs" disabled={!susResult}>
              4. Analitik & Ekspor
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: SETUP */}
          <TabsContent value="setup" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="participantId" className="text-xs font-semibold">
                  ID Partisipan / Penguji
                </Label>
                <Input
                  id="participantId"
                  value={participantId}
                  onChange={(e) => setParticipantId(e.target.value)}
                  className="text-xs"
                  placeholder="e.g. GIS_USER_01"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">Tipe Eksperimen (Bab 25)</Label>
                <select
                  value={experimentType}
                  onChange={(e) => setExperimentType(e.target.value as ExperimentType)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="EXPERIMENT_A">Eksperimen A: Latar Belakang & Distraksi Visual (Space Background)</option>
                  <option value="EXPERIMENT_B">Eksperimen B: Atmosfer & Boundary Cues (Subtle vs Strong)</option>
                  <option value="EXPERIMENT_C">Eksperimen C: 2D Map vs 3D Globe Spatial Tasks</option>
                </select>
              </div>
            </div>

            {/* Condition selector based on Experiment */}
            <div className="p-4 rounded-lg bg-muted/40 border border-border space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Kondisi Pengujian Eksperimen:</Label>
                <Badge variant="outline" className="text-[10px] uppercase">
                  {activeCondition}
                </Badge>
              </div>

              {experimentType === 'EXPERIMENT_A' && (
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant={conditionA === 'black' ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs"
                    onClick={() => setConditionA('black')}
                  >
                    A: Pure Black (#000000)
                  </Button>
                  <Button
                    type="button"
                    variant={conditionA === 'dark_gradient' ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs"
                    onClick={() => setConditionA('dark_gradient')}
                  >
                    B: Dark Gradient (#02040A)
                  </Button>
                  <Button
                    type="button"
                    variant={conditionA === 'dark_stars' ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs"
                    onClick={() => setConditionA('dark_stars')}
                  >
                    C: Dark Gradient + Stars
                  </Button>
                </div>
              )}

              {experimentType === 'EXPERIMENT_B' && (
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant={conditionB === 'no_atmosphere' ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs"
                    onClick={() => setConditionB('no_atmosphere')}
                  >
                    A: No Atmosphere
                  </Button>
                  <Button
                    type="button"
                    variant={conditionB === 'subtle_atmosphere' ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs"
                    onClick={() => setConditionB('subtle_atmosphere')}
                  >
                    B: Subtle Atmosphere (Default)
                  </Button>
                  <Button
                    type="button"
                    variant={conditionB === 'strong_atmosphere' ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs"
                    onClick={() => setConditionB('strong_atmosphere')}
                  >
                    C: Strong Neon Atmosphere
                  </Button>
                </div>
              )}

              {experimentType === 'EXPERIMENT_C' && (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={conditionC === '2d_mercator' ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs"
                    onClick={() => setConditionC('2d_mercator')}
                  >
                    Mode 2D Map (Web Mercator EPSG:3857)
                  </Button>
                  <Button
                    type="button"
                    variant={conditionC === '3d_globe' ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs"
                    onClick={() => setConditionC('3d_globe')}
                  >
                    Mode 3D Globe (Cesium WGS84)
                  </Button>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button onClick={handleStartSession} className="text-xs gap-1.5">
                <Play className="w-3.5 h-3.5" /> Mulai Sesi Eksperimen
              </Button>
            </div>
          </TabsContent>

          {/* TAB 2: TASK RUNNER */}
          {activeTask && (
            <TabsContent value="runner" className="space-y-4">
              <div className="p-4 rounded-lg bg-card border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">
                      Tugas {currentTaskIndex + 1} dari {currentTasks.length}
                    </Badge>
                    <span className="text-xs font-bold text-foreground">{activeTask.title}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] text-cyan-500 border-cyan-500/30">
                    Kondisi: {activeCondition}
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">{activeTask.description}</p>

                <div className="flex items-center gap-2 pt-1">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleLoadTaskData}
                    className="text-xs gap-1.5"
                  >
                    <Compass className="w-3.5 h-3.5" /> Muat Data Spasial Uji ke Peta
                  </Button>
                </div>
              </div>

              {/* Timer and Metrics Dashboard */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-lg bg-muted/40 border border-border flex flex-col items-center justify-center">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                    Task Completion Time
                  </span>
                  <div className="flex items-center gap-2 text-2xl font-mono font-bold text-cyan-400">
                    <Clock className="w-5 h-5 opacity-70" />
                    {(elapsedMs / 1000).toFixed(2)}s
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1">({elapsedMs} ms)</span>
                </div>

                <div className="p-4 rounded-lg bg-muted/40 border border-border flex flex-col items-center justify-center">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                    Miss-clicks / Errors
                  </span>
                  <div className="text-2xl font-mono font-bold text-amber-400">{errorCount}</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRecordError}
                    className="text-[10px] h-6 px-2 mt-1 text-amber-500 hover:text-amber-400"
                  >
                    + Catat Miss-Click
                  </Button>
                </div>

                <div className="p-4 rounded-lg bg-muted/40 border border-border flex flex-col justify-center gap-2">
                  {!isRunning ? (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleStartTaskTimer}
                      className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <Play className="w-3.5 h-3.5" /> Mulai Timer Tugas
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePauseTaskTimer}
                      className="text-xs gap-1.5 border-amber-500/50 text-amber-400"
                    >
                      Jeda Timer
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetTaskTimer}
                    className="text-[10px] h-6 gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('setup')}
                  className="text-xs"
                >
                  Kembali ke Setup
                </Button>

                <Button
                  variant="default"
                  size="sm"
                  onClick={handleCompleteCurrentTask}
                  className="text-xs gap-1.5 bg-cyan-600 hover:bg-cyan-700 text-white"
                  disabled={elapsedMs === 0}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {currentTaskIndex + 1 < currentTasks.length ? 'Selesai & Tugas Berikutnya' : 'Selesai & Ke Evaluasi SUS'}
                </Button>
              </div>
            </TabsContent>
          )}

          {/* TAB 3: SUS & NASA-TLX */}
          <TabsContent value="survey" className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-foreground">1. System Usability Scale (SUS) — 10 Pertanyaan</h4>
                  <p className="text-[11px] text-muted-foreground">
                    Skala Likert 1 (Sangat Tidak Setuju) hingga 5 (Sangat Setuju).
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  Standar Internasional (Brooke, 1996)
                </Badge>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {STANDARD_SUS_QUESTIONS.map((q) => (
                  <div
                    key={q.id}
                    className="p-2.5 rounded-md bg-muted/30 border border-border flex items-center justify-between gap-4 text-xs"
                  >
                    <span className="flex-1 text-[11px]">
                      <strong className="text-muted-foreground mr-1.5">{q.id}.</strong>
                      {q.text}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <Button
                          key={val}
                          type="button"
                          variant={susResponses[q.id] === val ? 'default' : 'outline'}
                          size="sm"
                          className="w-7 h-7 p-0 text-xs rounded-full"
                          onClick={() => setSusResponses((prev) => ({ ...prev, [q.id]: val }))}
                        >
                          {val}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* NASA-TLX Workload Index */}
            <div className="space-y-3 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-foreground">2. NASA-TLX Workload Assessment</h4>
                  <p className="text-[11px] text-muted-foreground">
                    Estimasi persepsi beban kerja kognitif dan fisik (skala 0–100).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {(
                  [
                    { key: 'mentalDemand', label: 'Beban Mental (Mental Demand)' },
                    { key: 'physicalDemand', label: 'Beban Fisik (Physical Demand)' },
                    { key: 'temporalDemand', label: 'Tekanan Waktu (Temporal Demand)' },
                    { key: 'performance', label: 'Persepsi Performa (Performance Deficit)' },
                    { key: 'effort', label: 'Tingkat Usaha (Effort)' },
                    { key: 'frustration', label: 'Tingkat Frustrasi (Frustration)' },
                  ] as const
                ).map(({ key, label }) => (
                  <div key={key} className="space-y-1.5 p-2 rounded bg-muted/20 border border-border">
                    <div className="flex justify-between text-[11px]">
                      <span>{label}</span>
                      <span className="font-mono font-bold text-cyan-400">{tlxDimensions[key]}</span>
                    </div>
                    <Slider
                      value={[tlxDimensions[key]]}
                      min={0}
                      max={100}
                      step={5}
                      onValueChange={([val]) =>
                        setTlxDimensions((prev) => ({ ...prev, [key]: val }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button onClick={handleCalculateSurveyAndFinish} className="text-xs gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Hitung & Simpan Hasil Evaluasi
              </Button>
            </div>
          </TabsContent>

          {/* TAB 4: RESULTS & ANALYTICS */}
          <TabsContent value="results" className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {/* SUS Score Card */}
              <div className="p-4 rounded-lg bg-muted/30 border border-border flex flex-col items-center justify-center">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                  System Usability Scale (SUS)
                </span>
                <div className="text-3xl font-extrabold font-mono text-cyan-400">
                  {susResult?.score ?? 0}
                  <span className="text-xs text-muted-foreground font-normal"> / 100</span>
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <Badge variant={susResult && susResult.score >= 68 ? 'default' : 'destructive'} className="text-[10px]">
                    Grade {susResult?.grade}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">({susResult?.adjectiveRating})</span>
                </div>
              </div>

              {/* NASA-TLX Workload Card */}
              <div className="p-4 rounded-lg bg-muted/30 border border-border flex flex-col items-center justify-center">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                  NASA-TLX Workload Index
                </span>
                <div className="text-3xl font-extrabold font-mono text-amber-400">
                  {tlxResult?.overallScore ?? 0}
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <Badge variant="outline" className="text-[10px]">
                    Beban: {tlxResult?.workloadLevel}
                  </Badge>
                </div>
              </div>

              {/* Task Performance Card */}
              <div className="p-4 rounded-lg bg-muted/30 border border-border flex flex-col items-center justify-center">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                  Task Performance Summary
                </span>
                <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                  {meanTaskDuration}s <span className="text-[10px] text-muted-foreground">mean</span>
                </div>
                <span className="text-[10px] text-muted-foreground mt-2">
                  Total Errors: <strong>{totalErrors}</strong>
                </span>
              </div>
            </div>

            {/* Tasks Summary Table */}
            <div className="rounded-md border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="text-xs">
                    <TableHead>Tugas</TableHead>
                    <TableHead>Kondisi</TableHead>
                    <TableHead>Durasi (s)</TableHead>
                    <TableHead>Miss-clicks</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedTasks.map((t, idx) => (
                    <TableRow key={idx} className="text-xs">
                      <TableCell className="font-medium">{t.title}</TableCell>
                      <TableCell className="font-mono text-[10px]">{t.condition}</TableCell>
                      <TableCell className="font-mono">{(t.durationMs / 1000).toFixed(2)}s</TableCell>
                      <TableCell className="font-mono">{t.errorClicks}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30">
                          Sukses
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Export and New Session buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setActiveTab('setup');
                }}
                className="text-xs gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Uji Kondisi / Partisipan Lain
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadCsv}
                  className="text-xs gap-1.5"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" /> Ekspor Dataset (.CSV)
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleDownloadJson}
                  className="text-xs gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-500" /> Ekspor JSON
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
