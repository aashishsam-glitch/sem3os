import { useState, useEffect, useRef, useCallback } from 'react';
import type { SimulationSpeed } from '../types/disk';

export const SPEED_MS: Record<SimulationSpeed, number> = {
  slow: 1100,
  normal: 550,
  fast: 220,
};

interface UsePlaybackProps {
  totalSteps: number;
  initialSpeed?: SimulationSpeed;
  onFinish?: () => void;
}

export function usePlayback({ totalSteps, initialSpeed = 'normal', onFinish }: UsePlaybackProps) {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<SimulationSpeed>(initialSpeed);
  const [isLooping, setIsLooping] = useState<boolean>(false);

  const timerRef = useRef<number | null>(null);

  // Clear timer safely
  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const pause = useCallback(() => {
    stopTimer();
    setIsPlaying(false);
  }, [stopTimer]);

  const reset = useCallback(() => {
    stopTimer();
    setIsPlaying(false);
    setCurrentStep(0);
  }, [stopTimer]);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev < totalSteps) {
        return prev + 1;
      }
      return prev;
    });
  }, [totalSteps]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev > 0) {
        return prev - 1;
      }
      return 0;
    });
  }, []);

  const goToStep = useCallback(
    (step: number) => {
      const clamped = Math.max(0, Math.min(totalSteps, step));
      setCurrentStep(clamped);
    },
    [totalSteps]
  );

  const play = useCallback(() => {
    if (currentStep >= totalSteps) {
      setCurrentStep(0);
    }
    setIsPlaying(true);
  }, [currentStep, totalSteps]);

  // Main playback tick loop
  useEffect(() => {
    if (!isPlaying) {
      stopTimer();
      return;
    }

    const interval = SPEED_MS[speed];
    timerRef.current = window.setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < totalSteps) {
          const next = prev + 1;
          if (next === totalSteps && onFinish) {
            onFinish();
          }
          return next;
        } else {
          // Reached end
          if (isLooping) {
            return 0;
          } else {
            setIsPlaying(false);
            return prev;
          }
        }
      });
    }, interval);

    return () => {
      stopTimer();
    };
  }, [isPlaying, speed, totalSteps, isLooping, onFinish, stopTimer]);

  // Reset or adjust if totalSteps change (e.g. queue edited)
  useEffect(() => {
    if (currentStep > totalSteps) {
      setCurrentStep(totalSteps);
    }
  }, [totalSteps, currentStep]);

  return {
    currentStep,
    isPlaying,
    speed,
    isLooping,
    setSpeed,
    setIsLooping,
    play,
    pause,
    reset,
    nextStep,
    prevStep,
    goToStep,
    isFinished: currentStep >= totalSteps && totalSteps > 0,
  };
}
