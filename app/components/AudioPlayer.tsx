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

            {/* Constraints container - invisible and non-blocking */}
            <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-[190]" />

            <motion.div
                drag
                dragMomentum={true}
                dragElastic={0.2}
                dragConstraints={constraintsRef}
                className="fixed top-6 right-6 z-[200] cursor-grab active:cursor-grabbing touch-none"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                    opacity: isScrolling ? 0.3 : 1,
                    scale: isScrolling ? 0.85 : 1
                }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.3, opacity: { duration: 0.5 } }}
            >
                <button
                    onClick={togglePlay}
                    className={`
                    relative w-14 h-14 rounded-full border-2 border-white/20
                    flex items-center justify-center overflow-hidden
                    shadow-[0_4px_14px_rgba(122,45,62,0.4)]
                    transition-all duration-300
                    ${isPlaying ? 'bg-plum' : 'bg-gray-400'}
                `}
                >
                    {/* PATTERN BACKGROUND */}
                    <div
                        className="absolute inset-0 opacity-20"
                        style={{
                            backgroundImage: 'radial-gradient(#D4AF37 1px, transparent 1px)',
                            backgroundSize: '8px 8px'
                        }}
                    />

                    {/* ICON - Color Gold */}
                    <div className="relative z-10 text-gold">
                        {isPlaying ? (
                            <svg className="animate-pulse" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                            </svg>
                        ) : (
                            <div className="relative">
                                {/* Mute Icon */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 9v6a3 3 0 0 0 5.12 2.12M15 9.34V4h-6a2.13 2.13 0 1 1-2 2v2" />
                                </svg>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-0.5 bg-white/50 rotate-45 rounded-full"></div>
                            </div>
                        )}
                    </div>

                    {/* PULSING EFFECT */}
                    {isPlaying && (
                        <div className="absolute inset-0 animate-magical-pulse pointer-events-none">
                            <div className="w-full h-full rounded-full border border-gold opacity-30" />
                        </div>
                    )}
                </button>

                <style jsx>{`
            @keyframes magical-pulse {
                0% { transform: scale(1); opacity: 0.5; }
                100% { transform: scale(1.5); opacity: 0; }
            }
            .animate-magical-pulse {
                animation: magical-pulse 2s cubic-bezier(0, 0, 0.2, 1) infinite;
            }
        `}</style>
            </motion.div>
        </>
    );
}
