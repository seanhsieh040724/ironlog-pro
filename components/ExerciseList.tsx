
import React from 'react';
import { Exercise } from '../types';
import { ExerciseCard } from './ExerciseCard';

interface ExerciseListProps {
  exercises: Exercise[];
  onDelete: (id: string) => void;
}

export const ExerciseList: React.FC<ExerciseListProps> = ({ exercises, onDelete }) => {
  return (
    <div className="space-y-4">
      {exercises.map((exercise) => (
        <ExerciseCard 
          key={exercise.id} 
          exercise={exercise} 
          onDelete={onDelete} 
        />
      ))}
    </div>
  );
};
