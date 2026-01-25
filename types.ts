
export type MuscleGroup = 'chest' | 'back' | 'quads' | 'hamstrings' | 'shoulders' | 'arms' | 'core' | 'glutes';

export interface SetEntry {
  id: string;
  weight: number;
  reps: number;
  completed: boolean;
}

export interface ExerciseEntry {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  sets: SetEntry[];
}

export interface Exercise {
  id: string;
  name: string;
  weight: number;
  sets: number;
  reps: number;
  timestamp: number;
}

export interface WorkoutSession {
  id: string;
  startTime: number;
  endTime?: number;
  title: string;
  exercises: ExerciseEntry[];
  totalVolume?: number;
}

export interface RoutineTemplate {
  id: string;
  name: string;
  exercises: (Omit<ExerciseEntry, 'id' | 'sets'> & { 
    id: string;
    defaultSets: number; 
    defaultReps: number; 
    defaultWeight: number; 
  })[];
}

export interface BodyMetric {
  id: string;
  date: number;
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female';
  bodyFat?: number;
}

export interface UserGoal {
  type: 'bulk' | 'cut' | 'maintain';
  targetWeight: number;
  startWeight: number;
  activityLevel: 1.2 | 1.375 | 1.55 | 1.725 | 1.9;
}

export interface Achievement {
  id: string;
  type: 'PR_BREAK' | 'STREAK' | 'VOLUME';
  title: string;
  date: number;
  exerciseName?: string;
}

export type AppTab = 'workout' | 'routines' | 'history' | 'profile';
