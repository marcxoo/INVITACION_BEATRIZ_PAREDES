'use client';

import { useState, useEffect } from 'react';

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

export default function CountdownTimer() {
    const targetDate = new Date('2026-05-15T13:00:00');

    const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +targetDate - +new Date();

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, []);

    if (!timeLeft) return null;

    const TimeUnit = ({ value, label, showDivider = true }: { value: number, label: string, showDivider?: boolean }) => (
        <div className="flex items-center">
            <div className="flex flex-col items-center min-w-[55px] sm:min-w-[80px]">
                {/* CINZEL BOLD/BLACK STYLE */}
                <span className="text-4xl sm:text-6xl font-[900] leading-none tracking-tighter">
                    {value.toString().padStart(2, '0')}
                </span>
                <span className="text-[10px] sm:text-[12px] uppercase font-bold tracking-[0.1em] mt-1 opacity-90">
                    {label}
                </span>
            </div>
            {showDivider && (
                <div className="text-3xl sm:text-5xl font-light mx-1 sm:mx-2 opacity-30 mt-[-8px]">:</div>
            )}
        </div>
    );

    return (
        <div className="flex flex-col items-center justify-center font-cinzel text-[#883245]">
            <div className="flex items-center justify-center">
                <TimeUnit value={timeLeft.days} label="Días" />
                <TimeUnit value={timeLeft.hours} label="Horas" />
                <TimeUnit value={timeLeft.minutes} label="Min" />
                <TimeUnit value={timeLeft.seconds} label="Seg" showDivider={false} />
            </div>
        </div>
    );
}
