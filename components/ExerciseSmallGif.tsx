import React, { useState, useEffect } from 'react';
import { fetchExerciseGif } from '../utils/fitnessMath';
import { Loader2 } from 'lucide-react';

interface ExerciseSmallGifProps {
  name: string;
}

export const ExerciseSmallGif: React.FC<ExerciseSmallGifProps> = ({ name }) => {
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadGif = async () => {
      setLoading(true);
      try {
        const url = await fetchExerciseGif(name);
        if (isMounted) setGifUrl(url);
      } catch (error) {
        console.error('Failed to fetch gif:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadGif();
    return () => { isMounted = false; };
  }, [name]);

  if (loading) {
    return <div className="w-full h-full flex items-center justify-center bg-slate-50"><Loader2 className="w-4 h-4 animate-spin text-slate-200" /></div>;
  }

  return (
    <img 
      src={gifUrl || `https://picsum.photos/seed/${name}/100/100`} 
      alt={name} 
      className="w-full h-full object-cover"
      referrerPolicy="no-referrer"
    />
  );
};
