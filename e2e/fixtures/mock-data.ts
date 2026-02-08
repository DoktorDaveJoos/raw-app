/**
 * Mock data for E2E visual testing
 */

// User
export const mockUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  email_verified_at: '2024-01-01T00:00:00Z',
};

// Weekly sessions for stats calculation
export const mockWeeklySessions = [
  {
    id: 1,
    status: 'finished',
    title: 'Upper Body Power',
    volume_kg: 6200,
    exercises_count: 6,
    sets_count: 18,
    reps_count: 96,
    started_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    finished_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    status: 'finished',
    title: 'Leg Day (Heavy)',
    volume_kg: 8500,
    exercises_count: 5,
    sets_count: 15,
    reps_count: 75,
    started_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    finished_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    status: 'finished',
    title: 'Pull Hypertrophy',
    volume_kg: 5200,
    exercises_count: 4,
    sets_count: 16,
    reps_count: 128,
    started_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    finished_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 50 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    status: 'finished',
    title: 'Push Strength',
    volume_kg: 4600,
    exercises_count: 3,
    sets_count: 12,
    reps_count: 60,
    started_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    finished_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 40 * 60 * 1000).toISOString(),
  },
];

// Current in-progress session
export const mockInProgressSession = {
  id: 100,
  status: 'in_progress',
  title: 'Upper Body Power',
  volume_kg: 2400,
  exercises_count: 3,
  sets_count: 8,
  reps_count: 48,
  started_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  finished_at: null,
};

// Session with full details (for logging screen)
export const mockSessionDetails = {
  id: 100,
  status: 'in_progress',
  title: "Today's Session",
  volume_kg: 3800,
  exercises_count: 3,
  sets_count: 8,
  reps_count: 48,
  duration_seconds: 2712, // 45:12
  started_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  finished_at: null,
  session_events: [
    {
      id: 1,
      type: 'add_sets',
      raw_text: 'pullups 3x8 bw',
      status: 'processing',
      exercise_name: null,
      sets: null,
      created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
    {
      id: 2,
      type: 'add_sets',
      raw_text: 'bench 3x8 100kg',
      status: 'completed',
      exercise_name: 'Bench Press',
      sets: [
        { id: 1, set_number: 1, weight_kg: 100, reps: 8, rpe: 8.5, unit: 'kg', completed: true },
        { id: 2, set_number: 2, weight_kg: 100, reps: 8, rpe: 9, unit: 'kg', completed: true },
        { id: 3, set_number: 3, weight_kg: 100, reps: 8, rpe: 9, unit: 'kg', completed: true },
      ],
      created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
    {
      id: 3,
      type: 'add_sets',
      raw_text: 'squat 2x5 140kg',
      status: 'completed',
      exercise_name: 'Squat',
      sets: [
        { id: 4, set_number: 1, weight_kg: 140, reps: 5, rpe: 7, unit: 'kg', completed: true },
        { id: 5, set_number: 2, weight_kg: 140, reps: 5, rpe: 7.5, unit: 'kg', completed: true },
      ],
      created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
  ],
  session_exercises: [
    { exercise_name: 'Bench Press', sets_count: 3, reps_count: 24, volume_kg: 2400 },
    { exercise_name: 'Squat', sets_count: 2, reps_count: 10, volume_kg: 1400 },
  ],
};

// Finished session details (for session details screen)
export const mockFinishedSessionDetails = {
  id: 1,
  status: 'finished',
  title: 'Upper Body Power',
  volume_kg: 3800,
  exercises_count: 6,
  sets_count: 18,
  reps_count: 124,
  duration_seconds: 2712,
  started_at: '2024-10-23T09:41:00Z',
  finished_at: '2024-10-23T10:26:12Z',
  session_events: [
    {
      id: 1,
      type: 'add_sets',
      raw_text: 'bench 3x8 100kg',
      status: 'completed',
      exercise_name: 'Bench Press',
      sets: [
        { id: 1, set_number: 1, weight_kg: 100, reps: 8, rpe: 8.5, unit: 'kg', completed: true },
        { id: 2, set_number: 2, weight_kg: 100, reps: 8, rpe: 9, unit: 'kg', completed: true },
        { id: 3, set_number: 3, weight_kg: 100, reps: 8, rpe: 9, unit: 'kg', completed: true },
      ],
    },
    {
      id: 2,
      type: 'add_sets',
      raw_text: 'squat 2x5 140kg',
      status: 'completed',
      exercise_name: 'Squat',
      sets: [
        { id: 4, set_number: 1, weight_kg: 140, reps: 5, rpe: 7, unit: 'kg', completed: true },
        { id: 5, set_number: 2, weight_kg: 140, reps: 5, rpe: 7.5, unit: 'kg', completed: true },
      ],
    },
    {
      id: 3,
      type: 'add_sets',
      raw_text: 'deadlift 1x5 180kg',
      status: 'completed',
      exercise_name: 'Deadlift',
      sets: [{ id: 6, set_number: 1, weight_kg: 180, reps: 5, rpe: 8, unit: 'kg', completed: true }],
    },
  ],
  session_exercises: [
    { exercise_name: 'Squat', sets_count: 2, reps_count: 10, volume_kg: 1400 },
    { exercise_name: 'Bench Press', sets_count: 3, reps_count: 24, volume_kg: 2400 },
    { exercise_name: 'Deadlift', sets_count: 1, reps_count: 5, volume_kg: 900 },
    { exercise_name: 'Overhead Press', sets_count: 3, reps_count: 24, volume_kg: 600 },
    { exercise_name: 'Barbell Row', sets_count: 3, reps_count: 24, volume_kg: 720 },
    { exercise_name: 'Tricep Pushdown', sets_count: 3, reps_count: 36, volume_kg: 270 },
  ],
};

// Calculate weekly stats
export function calculateWeeklyStats(sessions: typeof mockWeeklySessions) {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weeklySessions = sessions.filter(
    (s) => s.finished_at && new Date(s.finished_at).getTime() > weekAgo
  );

  const volume = weeklySessions.reduce((sum, s) => sum + (s.volume_kg || 0), 0);
  const workouts = weeklySessions.length;

  return {
    volume,
    workouts,
    workoutsTarget: 5,
    avgIntensity: 8.2,
    sessions: weeklySessions,
  };
}

// Paginated sessions response
export function createPaginatedResponse<T>(data: T[], page = 1, perPage = 20) {
  return {
    data,
    meta: {
      current_page: page,
      from: 1,
      last_page: 1,
      per_page: perPage,
      to: data.length,
      total: data.length,
    },
    links: {
      first: null,
      last: null,
      prev: null,
      next: null,
    },
  };
}

// All sessions for log screen (includes in-progress)
export function getAllSessions() {
  return [mockInProgressSession, ...mockWeeklySessions];
}

// Finished sessions only
export function getFinishedSessions() {
  return mockWeeklySessions.filter((s) => s.status === 'finished');
}

// New event created via POST (processing state)
export const mockCreatedEvent = {
  id: 999,
  type: 'add_sets',
  raw_text: 'deadlift 3x5 180kg',
  status: 'queued',
  exercise_name: null,
  sets: null,
  created_at: new Date().toISOString(),
};
