import {
  SUSQuestion,
  SUSResult,
  NasaTlxDimensions,
  NasaTlxResult,
  UsabilityTask,
  ExperimentType,
  UsabilityExperimentSession,
} from '@/types/usability';

export const STANDARD_SUS_QUESTIONS: SUSQuestion[] = [
  { id: 1, text: 'Saya merasa ingin sering menggunakan aplikasi/tampilan ini untuk analisis spasial.', isPositive: true },
  { id: 2, text: 'Saya merasa antarmuka spasial ini terlalu rumit untuk navigasi dan manipulasi data.', isPositive: false },
  { id: 3, text: 'Saya merasa sistem ini mudah digunakan dalam menyelesaikan tugas geospasial.', isPositive: true },
  { id: 4, text: 'Saya merasa membutuhkan bantuan teknis ahli untuk mengoperasikan fitur ini.', isPositive: false },
  { id: 5, text: 'Saya merasa berbagai elemen visual (latar, atmosfer, data) terintegrasi dengan sangat baik.', isPositive: true },
  { id: 6, text: 'Saya merasa ada banyak inkonsistensi visual atau kontrol navigasi dalam sistem ini.', isPositive: false },
  { id: 7, text: 'Saya yakin pengguna GIS dapat belajar menggunakan antarmuka ini dengan sangat cepat.', isPositive: true },
  { id: 8, text: 'Saya merasa sistem ini canggung/membingungkan saat melakukan interaksi spasial.', isPositive: false },
  { id: 9, text: 'Saya merasa sangat percaya diri dan presisi saat berinteraksi dengan peta/globe.', isPositive: true },
  { id: 10, text: 'Saya perlu mempelajari banyak hal baru sebelum dapat bekerja secara produktif di sistem ini.', isPositive: false },
];

export function calculateSUSScore(responses: Record<number, number>): SUSResult {
  let rawSum = 0;

  for (let i = 1; i <= 10; i++) {
    const val = responses[i] ?? 3; // Default neutral if missing
    if (i % 2 === 1) {
      // Odd questions (positive): response - 1
      rawSum += Math.max(0, Math.min(4, val - 1));
    } else {
      // Even questions (negative): 5 - response
      rawSum += Math.max(0, Math.min(4, 5 - val));
    }
  }

  const score = Number((rawSum * 2.5).toFixed(1));

  let grade: SUSResult['grade'] = 'F';
  let adjectiveRating: SUSResult['adjectiveRating'] = 'Worst Imaginable';
  let percentileRange = '< 15%';

  if (score >= 85) {
    grade = 'A+';
    adjectiveRating = 'Best Imaginable';
    percentileRange = '95% - 100%';
  } else if (score >= 80) {
    grade = 'A';
    adjectiveRating = 'Excellent';
    percentileRange = '90% - 94%';
  } else if (score >= 70) {
    grade = 'B';
    adjectiveRating = 'Good';
    percentileRange = '65% - 89%';
  } else if (score >= 68) {
    grade = 'C';
    adjectiveRating = 'OK';
    percentileRange = '50% - 64%';
  } else if (score >= 50) {
    grade = 'D';
    adjectiveRating = 'Poor';
    percentileRange = '15% - 49%';
  }

  return {
    rawResponses: responses,
    score,
    grade,
    percentileRange,
    adjectiveRating,
    isAcceptable: score >= 68,
  };
}

export function calculateNasaTlxScore(dimensions: NasaTlxDimensions): NasaTlxResult {
  const values = [
    dimensions.mentalDemand,
    dimensions.physicalDemand,
    dimensions.temporalDemand,
    dimensions.performance,
    dimensions.effort,
    dimensions.frustration,
  ];

  const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
  const overallScore = Number(avg.toFixed(1));

  let workloadLevel: NasaTlxResult['workloadLevel'] = 'Low';
  if (overallScore >= 80) workloadLevel = 'Very High';
  else if (overallScore >= 50) workloadLevel = 'High';
  else if (overallScore >= 30) workloadLevel = 'Medium';

  return {
    dimensions,
    overallScore,
    workloadLevel,
  };
}

export const EXPERIMENT_TASKS: Record<ExperimentType, UsabilityTask[]> = {
  EXPERIMENT_A: [
    {
      id: 'task_a1',
      title: 'Tugas A1: Deteksi Poligon Target di Klaster Spasial',
      description: 'Cari dan klik fitur poligon berwarna ungu yang berada di tengah area fokus.',
      expectedAction: 'click_feature',
      targetFeatureId: 'exp_a_target_1',
    },
    {
      id: 'task_a2',
      title: 'Tugas A2: Pemilihan Landmark Point Terisolasi',
      description: 'Temukan dan pilih marker titik target di sudut peta.',
      expectedAction: 'click_feature',
      targetFeatureId: 'exp_a_target_2',
    },
  ],
  EXPERIMENT_B: [
    {
      id: 'task_b1',
      title: 'Tugas B1: Deteksi Batas Kurvatur Horizon',
      description: 'Identifikasi boundary kelengkungan horizon globe dan klik fitur di tepian horizon.',
      expectedAction: 'boundary_detect',
      targetFeatureId: 'exp_b_target_1',
    },
    {
      id: 'task_b2',
      title: 'Tugas B2: Seleksi Fitur di Wilayah Kutub / Ekuator',
      description: 'Temukan dan pilih feature poligon yang terletak pada elevasi atmosfer berbeda.',
      expectedAction: 'click_feature',
      targetFeatureId: 'exp_b_target_2',
    },
  ],
  EXPERIMENT_C: [
    {
      id: 'task_c1',
      title: 'Tugas C1: Orientasi Makro Global',
      description: 'Navigasikan kamera/pandangan ke lokasi target global (Kepulauan Indonesia) dan klik zona target.',
      expectedAction: 'click_feature',
      targetFeatureId: 'exp_c_target_macro',
      targetCoordinates: [106.8271, -6.1754],
    },
    {
      id: 'task_c2',
      title: 'Tugas C2: Menggambar Poligon 4 Titik',
      description: 'Gunakan drawing tool Polygon untuk menggambar bidang poligon mengelilingi batas target.',
      expectedAction: 'draw_polygon',
    },
    {
      id: 'task_c3',
      title: 'Tugas C3: Presisi Perpindahan Simpul (Vertex Editing)',
      description: 'Aktifkan mode edit simpul dan sesuaikan koordinat simpul ke titik panduan presisi.',
      expectedAction: 'move_vertex',
    },
    {
      id: 'task_c4',
      title: 'Tugas C4: Inspeksi Koordinat HUD Status Bar',
      description: 'Arahkan kursor tepat ke titik koordinat target dan verifikasi pembacaan lat/lon pada HUD.',
      expectedAction: 'inspect_coordinate',
    },
  ],
};

export function exportSessionsToCsv(sessions: UsabilityExperimentSession[]): string {
  const headers = [
    'Session ID',
    'Participant ID',
    'Experiment Type',
    'Condition',
    'Task ID',
    'Task Title',
    'Duration (ms)',
    'Duration (s)',
    'Error Clicks',
    'Success',
    'Precision Dev (m)',
    'SUS Score',
    'SUS Grade',
    'NASA-TLX Overall',
    'Mental Demand',
    'Frustration',
    'Started At',
  ];

  const rows: string[][] = [];

  sessions.forEach((s) => {
    const susScore = s.susResult ? s.susResult.score.toString() : '';
    const susGrade = s.susResult ? s.susResult.grade : '';
    const nTlx = s.nasaTlxResult ? s.nasaTlxResult.overallScore.toString() : '';
    const mental = s.nasaTlxResult ? s.nasaTlxResult.dimensions.mentalDemand.toString() : '';
    const frust = s.nasaTlxResult ? s.nasaTlxResult.dimensions.frustration.toString() : '';

    if (s.tasks.length === 0) {
      rows.push([
        s.sessionId,
        s.participantId,
        s.experimentType,
        s.condition,
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        susScore,
        susGrade,
        nTlx,
        mental,
        frust,
        s.startedAt,
      ]);
    } else {
      s.tasks.forEach((t) => {
        rows.push([
          s.sessionId,
          s.participantId,
          s.experimentType,
          s.condition,
          t.taskId,
          `"${t.title.replace(/"/g, '""')}"`,
          t.durationMs.toString(),
          (t.durationMs / 1000).toFixed(2),
          t.errorClicks.toString(),
          t.success ? 'TRUE' : 'FALSE',
          t.precisionDeviationMeters !== undefined ? t.precisionDeviationMeters.toFixed(2) : '',
          susScore,
          susGrade,
          nTlx,
          mental,
          frust,
          s.startedAt,
        ]);
      });
    }
  });

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
