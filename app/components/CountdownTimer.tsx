'use client';

import { useState, useEffect } from 'react';

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

export default function CountdownTimer() {
    const targetDate = new Date('2026-07-04T19:00:00');

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
        <div className="flex items-start gap-1.5 md:gap-4">
            <div className="flex flex-col items-center">
                {/* Estilo elegante minimalista mejorado y agrandado */}
                <div
                    className="relative flex items-center justify-center rounded-2xl transition-all duration-300"
                    style={{
                        width: 'clamp(62px, 15vw, 90px)',
                        height: 'clamp(72px, 17vw, 105px)',
                        background: 'rgba(255, 255, 255, 0.55)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        border: '1.5px solid rgba(107, 31, 49, 0.25)',
                        boxShadow: '0 6px 30px rgba(107, 31, 49, 0.15), inset 0 2px 8px rgba(255, 255, 255, 0.6)',
                    }}
                >
                    <span
                        className="relative z-10 font-cinzel leading-none tabular-nums"
                        style={{
                            fontSize: 'clamp(36px, 8.5vw, 52px)',
                            color: '#6B1F31',
                            fontWeight: 700,
                            letterSpacing: '-0.02em',
                            textShadow: '0 2px 12px rgba(107, 31, 49, 0.15)'
                        }}
                    >
                        {value.toString().padStart(2, '0')}
                    </span>
                </div>
                <span
                    className="font-cinzel uppercase mt-3.5"
                    style={{
                        fontSize: 'clamp(10px, 2.8vw, 14px)',
                        letterSpacing: '0.25em',
                        color: 'rgba(107, 31, 49, 0.85)',
                        fontWeight: 700,
                    }}
                >
                    {label}
                </span>
            </div>

            {showDivider && (
                <div
                    className="flex flex-col justify-center gap-2.5"
                    style={{ 
                        height: 'clamp(72px, 17vw, 105px)', /* Same height as the box to vertically center the dots */
                        marginInline: 'clamp(3px, 1.5vw, 8px)' 
                    }}
                >
                    <div className="w-2 h-2 rounded-full" style={{ background: 'rgba(107, 31, 49, 0.5)' }} />
                    <div className="w-2 h-2 rounded-full" style={{ background: 'rgba(107, 31, 49, 0.5)' }} />
                </div>
            )}
        </div>
    );

    return (
        <div className="flex flex-col items-center justify-center">
            <div className="flex items-start justify-center">
                <TimeUnit value={timeLeft.days} label="Días" />
                <TimeUnit value={timeLeft.hours} label="Horas" />
                <TimeUnit value={timeLeft.minutes} label="Min" />
                <TimeUnit value={timeLeft.seconds} label="Seg" showDivider={false} />
            </div>
        </div>
    );
}
