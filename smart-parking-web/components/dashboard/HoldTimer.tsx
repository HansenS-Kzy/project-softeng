'use client';

import { useState, useEffect, useRef } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';

interface HoldTimerProps {
  expiresAt: string;
  onExpire?: () => void;
  compact?: boolean;
}

export default function HoldTimer({ expiresAt, onExpire, compact = false }: HoldTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const TOTAL_DURATION = 3600; // 1 Jam
  const hasExpired = useRef(false); // KUNCI ANTI-SPAM

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Date.now();
      const expiry = new Date(expiresAt).getTime();
      return Math.max(0, Math.floor((expiry - now) / 1000));
    };

    const initialTime = calculateTimeLeft();
    setTimeLeft(initialTime);

    // Cek di awal apakah sudah kedaluwarsa
    if (initialTime <= 0 && !hasExpired.current) {
      hasExpired.current = true;
      if (onExpire) onExpire();
      return;
    }

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        // Pastikan fungsi onExpire hanya dipanggil 1x
        if (!hasExpired.current) {
          hasExpired.current = true;
          if (onExpire) onExpire();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
    // onExpire sengaja tidak dimasukkan ke dependency array agar tidak memicu re-render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expiresAt]);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const isDanger = timeLeft > 0 && timeLeft < 300;
  const isExpired = timeLeft <= 0;

  const formatTime = (n: number) => n.toString().padStart(2, '0');

  if (compact) {
    return (
      <div
        className={clsx(
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-mono font-bold',
          isExpired
            ? 'bg-red-500/20 text-red-400'
            : isDanger
              ? 'bg-red-500/15 text-red-400 timer-danger'
              : 'bg-[#00f0ff]/10 text-[#00f0ff] timer-pulse'
        )}
      >
        {isDanger && !isExpired && <AlertTriangle size={14} />}
        <Clock size={14} />
        {isExpired ? 'EXPIRED' : `${formatTime(minutes)}:${formatTime(seconds)}`}
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'rounded-2xl p-6 border',
        isExpired
          ? 'border-red-500/30 bg-red-500/5'
          : isDanger
            ? 'border-red-500/30 bg-red-500/5 timer-danger'
            : 'border-[#00f0ff]/20 bg-[#00f0ff]/[0.03] timer-pulse'
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <Clock
          size={16}
          className={isDanger || isExpired ? 'text-red-400' : 'text-[#00f0ff]'}
        />
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          {isExpired ? 'Hold Expired' : 'Remaining Reserved Time'}
        </span>
      </div>

      <div
        className={clsx(
          'font-mono text-5xl font-bold tracking-wider',
          isExpired
            ? 'text-red-400'
            : isDanger
              ? 'text-red-400'
              : 'text-[#00f0ff] glow-neon-text'
        )}
      >
        {isExpired ? '00:00:00' : `${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)}`}
      </div>

      {isDanger && !isExpired && (
        <div className="flex items-center gap-2 mt-3 text-red-400">
          <AlertTriangle size={14} />
          <span className="text-xs font-semibold uppercase tracking-wider">
            Warning: Less than 5 minutes remaining
          </span>
        </div>
      )}

      <div className="mt-4 capacity-bar h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className={clsx(
            'h-full transition-all duration-1000',
            isExpired
              ? 'bg-red-500'
              : isDanger
                ? 'bg-gradient-to-r from-red-500 to-orange-500'
                : 'bg-gradient-to-r from-[#00f0ff] to-[#0891b2]'
          )}
          style={{ width: `${Math.min(100, (timeLeft / TOTAL_DURATION) * 100)}%` }}
        />
      </div>
    </div>
  );
}