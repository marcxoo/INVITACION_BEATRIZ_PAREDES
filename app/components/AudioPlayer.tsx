import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function AudioPlayer() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isScrolling, setIsScrolling] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const constraintsRef = useRef(null);

    // Initial autoplay attempt
    useEffect(() => {
        const attemptAutoplay = async () => {
            try {
                if (audioRef.current) {
                    await audioRef.current.play();
                    setIsPlaying(true);
                }
            } catch (err) {
                console.log("Autoplay blocked. Waiting for user interaction.");
            }
        };

        // Delay slightly to ensure component is settled
        const timeout = setTimeout(attemptAutoplay, 300);
        return () => clearTimeout(timeout);
    }, []);

    const togglePlay = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    // Scroll detection logic
    useEffect(() => {
        let timeout: NodeJS.Timeout;
        const handleScroll = () => {
            setIsScrolling(true);
            clearTimeout(timeout);
            timeout = setTimeout(() => setIsScrolling(false), 1000);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(timeout);
        };
    }, []);

    return (
        <>
            <audio
                ref={audioRef}
                src="/metadata.mp3"
                loop
                preload="auto"
            />

            {/* Constraints container */}
            <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-[190]" />

            <motion.div
                drag
                dragMomentum={true}
                dragElastic={0.2}
                dragConstraints={constraintsRef}
                className="fixed top-6 right-6 z-[200] cursor-grab active:cursor-grabbing touch-none"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                    opacity: isScrolling ? 0.2 : 1,
                    scale: isScrolling ? 0.8 : 1
                }}
                whileTap={{ scale: 0.92 }}
                transition={{ duration: 0.4, opacity: { duration: 0.6 } }}
            >
                <button
                    onClick={togglePlay}
                    className="relative w-16 h-16 flex items-center justify-center"
                    aria-label={isPlaying ? 'Pausar música' : 'Reproducir música'}
                >
                    {/* Outer gold ring */}
                    <span className={`
                        absolute inset-0 rounded-full
                        border-2 transition-all duration-700
                        ${isPlaying ? 'border-[#C5A059]' : 'border-[#C5A059]/40'}
                    `} />

                    {/* Pulse rings (visible only when playing) */}
                    {isPlaying && <>
                        <span className="absolute inset-0 rounded-full border border-[#C5A059]/40 animate-[gatsby-ring_2s_ease-out_infinite]" />
                        <span className="absolute inset-0 rounded-full border border-[#C5A059]/20 animate-[gatsby-ring_2s_ease-out_0.7s_infinite]" />
                    </>}

                    {/* Main circle background */}
                    <span className={`
                        relative z-10 w-12 h-12 rounded-full flex items-center justify-center
                        transition-all duration-500
                        ${isPlaying
                            ? 'bg-[#0A0A0A] shadow-[0_0_20px_rgba(197,160,89,0.35)]'
                            : 'bg-[#111111] shadow-[0_4px_12px_rgba(0,0,0,0.5)]'
                        }
                    `}>
                        {/* Art-deco diamond pattern */}
                        <span className="absolute inset-0 rounded-full overflow-hidden opacity-15"
                            style={{
                                backgroundImage: 'repeating-linear-gradient(45deg, #C5A059 0px, #C5A059 1px, transparent 0, transparent 50%)',
                                backgroundSize: '8px 8px'
                            }}
                        />

                        {/* Music note / mute icon */}
                        <span className={`relative z-10 transition-all duration-300 ${isPlaying ? 'text-[#E8D39E]' : 'text-[#C5A059]/50'}`}>
                            {isPlaying ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="1" y1="1" x2="23" y2="23"/>
                                    <path d="M9 9v6a3 3 0 0 0 5.12 2.12M15 9.34V4h-6a2.13 2.13 0 0 0-.5.06"/>
                                </svg>
                            )}
                        </span>
                    </span>

                    {/* Gold label beneath */}
                    <span className={`
                        absolute -bottom-5 left-1/2 -translate-x-1/2
                        text-[9px] tracking-[0.2em] font-cinzel whitespace-nowrap
                        transition-all duration-500
                        ${isPlaying ? 'text-[#C5A059]' : 'text-[#C5A059]/40'}
                    `}>
                        {isPlaying ? 'LIVE' : 'MUTED'}
                    </span>
                </button>

                <style jsx>{`
                    @keyframes gatsby-ring {
                        0% { transform: scale(1); opacity: 0.6; }
                        100% { transform: scale(1.8); opacity: 0; }
                    }
                `}</style>
            </motion.div>
        </>
    );
}
