import { useEffect, useState } from 'react';

export function useAnimatedStats() {
  const [callsCompleted, setCallsCompleted] = useState(0);
  const [timeSaved, setTimeSaved] = useState(0);
  const [successRate, setSuccessRate] = useState(0);

  useEffect(() => {
    const animateCounter = (target: number, setter: (value: number) => void, duration = 2000) => {
      let start = 0;
      const increment = target / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          setter(target);
          clearInterval(timer);
        } else {
          setter(Math.floor(start));
        }
      }, 16);
    };

    animateCounter(47, setCallsCompleted);
    animateCounter(12.5, setTimeSaved);
    animateCounter(94, setSuccessRate);
  }, []);

  return { callsCompleted, timeSaved, successRate };
}
