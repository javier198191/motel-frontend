'use client';

import React, { useState, useEffect } from 'react';

interface TimerHabitacionProps {
  fechaInicio: string | Date;
  horasIncluidas: number;
}

const TimerHabitacion: React.FC<TimerHabitacionProps> = ({ fechaInicio, horasIncluidas }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isOverdue, setIsOverdue] = useState<boolean>(false);

  useEffect(() => {
    const calculateTime = () => {
      console.log('TimerHabitacion - fechaInicio recibida:', fechaInicio);
      
      const start = new Date(fechaInicio).getTime();
      
      if (isNaN(start)) {
        console.error('TimerHabitacion - fechaInicio inválida:', fechaInicio);
        return;
      }
      
      const now = new Date().getTime();
      const includedMs = horasIncluidas * 60 * 60 * 1000;
      const end = start + includedMs;
      
      const diff = end - now;
      const diffMinutes = Math.floor(diff / (1000 * 60));
      
      setTimeLeft(diffMinutes);
      setIsOverdue(diff < 0);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 60000); // Actualiza cada minuto

    return () => clearInterval(interval);
  }, [fechaInicio, horasIncluidas]);

  const formatTime = (minutes: number) => {
    const absMinutes = Math.abs(minutes);
    const h = Math.floor(absMinutes / 60);
    const m = absMinutes % 60;
    return `${isOverdue ? '-' : ''}${h}h ${m}m`;
  };

  const getStatusStyles = () => {
    if (isOverdue) {
      return 'bg-red-500/20 text-red-500 border-red-500/50 animate-pulse';
    }
    if (timeLeft < 15) {
      return 'bg-orange-500/20 text-orange-500 border-orange-500/50';
    }
    if (timeLeft <= 30) {
      return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50';
    }
    return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/50';
  };

  return (
    <div className={`
      flex items-center justify-center gap-2 px-3 py-1.5 
      rounded-full border text-sm font-bold shadow-sm 
      transition-all duration-500 ease-in-out
      ${getStatusStyles()}
    `}>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="16" height="16" 
        viewBox="0 0 24 24" 
        fill="none" stroke="currentColor" 
        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
      <span className="font-mono tabular-nums leading-none">
        {formatTime(timeLeft)}
      </span>
    </div>
  );
};

export default TimerHabitacion;
