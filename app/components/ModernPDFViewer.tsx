'use client';

import { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { motion } from 'framer-motion';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Configure PDF worker
if (typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
}

// Optimization options for the PDF document
const documentOptions = {
    cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
};

import CountdownTimer from './CountdownTimer';

interface ButtonPosition {
    top: string;
    left: string;
    width: string;
    height: string;
}

interface TimerConfig {
    page: number;
    top: string;
    left: string;
}

interface ButtonsConfig {
    map: ButtonPosition;
    rsvp: ButtonPosition;
}

interface ModernPDFViewerProps {
    file: string;
    onOpenRsvp: () => void;
    onOpenMap: () => void;
    onLoad?: (loaded: boolean) => void;
    timerConfig?: TimerConfig;
    buttonsConfig?: ButtonsConfig;
}

export default function ModernPDFViewer({ file, onOpenRsvp, onOpenMap, onLoad, timerConfig, buttonsConfig }: ModernPDFViewerProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [isLoaded, setIsLoaded] = useState(false); // Controls the logical "ready" state
    const [showLoader, setShowLoader] = useState(true); // Controls the visual presence of loader
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [containerWidth, setContainerWidth] = useState<number>(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Update container width for responsiveness
    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.clientWidth);
            }
        };

        window.addEventListener('resize', updateWidth);
        updateWidth();

        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    // Called when the FIRST page is fully painted on current view
    function onPageRenderSuccess() {
        if (!isLoaded) {
            // Add a small buffer to ensure visual stability
            setTimeout(() => {
                setIsLoaded(true);
            }, 500);
        }
    }

    // Callback for download progress
    function onDocumentLoadProgress({ loaded, total }: { loaded: number; total: number }) {
        if (total > 0) {
            const percent = Math.min(100, Math.round((loaded / total) * 100)); // Ensure it never goes above 100
            setLoadingProgress(percent);
        }
    }

    return (
        <div className="w-full flex flex-col items-center bg-paper min-h-screen relative" ref={containerRef}>

            {/* PREMIUM LOADER / SPLASH SCREEN */}
            {showLoader && (
                <div
                    className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-paper transition-opacity duration-1000 ease-in-out ${!showLoader ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                >
                    {/* BACKGROUND TEXTURE */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                        style={{
                            backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")',
                        }}
                    />
                    <div className="absolute inset-0 opacity-10 pointer-events-none"
                        style={{
                            backgroundImage: 'radial-gradient(#7A2D3E 1px, transparent 1px)',
                            backgroundSize: '30px 30px'
                        }}
                    />

                    {/* DECORATIVE CORNERS (GOLD) */}
                    <div className="absolute top-10 left-10 w-32 h-32 border-t-2 border-l-2 border-gold/40 rounded-tl-3xl pointer-events-none hidden sm:block" />
                    <div className="absolute top-10 right-10 w-32 h-32 border-t-2 border-r-2 border-gold/40 rounded-tr-3xl pointer-events-none hidden sm:block" />
                    <div className="absolute bottom-10 left-10 w-32 h-32 border-b-2 border-l-2 border-gold/40 rounded-bl-3xl pointer-events-none hidden sm:block" />
                    <div className="absolute bottom-10 right-10 w-32 h-32 border-b-2 border-r-2 border-gold/40 rounded-br-3xl pointer-events-none hidden sm:block" />

                    <div className="relative z-10 flex flex-col items-center w-full max-w-md px-10">
                        {!isLoaded ? (
                            <div className="flex flex-col items-center w-full max-w-xs px-6">
                                <div className="w-16 h-16 border-4 border-baby-pink border-t-plum rounded-full animate-spin mb-6"></div>
                                <div className="text-3xl sm:text-4xl font-bold font-vibes text-plum animate-pulse whitespace-nowrap">Cargando Invitación...</div>

                                {/* PROGRESS BAR */}
                                <div className="w-full h-2 bg-gray-200 rounded-full mt-6 overflow-hidden border border-plum/10">
                                    <div
                                        className="h-full bg-plum transition-all duration-300 ease-out"
                                        style={{ width: `${loadingProgress}%` }}
                                    />
                                </div>
                                <p className="mt-2 text-sm font-playfair text-plum opacity-80">{loadingProgress}% completado</p>
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 1.2, ease: "easeOut" }}
                                className="flex flex-col items-center w-full"
                            >
                                {/* STATIC HEART WITH COMPACT ROTATING TEXT EMBLEM */}
                                <div className="relative mb-14 mt-4 flex items-center justify-center w-40 h-40">

                                    {/* Rotating Text: Rosita María - Mathematically Perfect Distribution */}
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-0 m-auto z-10 text-plum font-cinzel font-semibold opacity-[0.85]"
                                        style={{ width: '116px', height: '116px', fontSize: '11.5px' }}
                                    >
                                        {"ROSITA MARÍA • ROSITA MARÍA • ROSITA MARÍA • ".split("").map((char, i) => (
                                            <div
                                                key={i}
                                                className="absolute top-0 left-1/2 h-full flex justify-center origin-center"
                                                style={{
                                                    transform: `translateX(-50%) rotate(${i * 8}deg)`,
                                                    width: '16px'
                                                }}
                                            >
                                                {/* Push text slightly down from edge for perfect vertical centering */}
                                                <span className="mt-[-2px]">{char}</span>
                                            </div>
                                        ))}
                                    </motion.div>

                                    {/* Static Heart Core */}
                                    <div className="relative z-20 text-plum drop-shadow-[0_4px_12px_rgba(122,45,62,0.25)]">
                                        <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor" stroke="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                        </svg>
                                    </div>
                                </div>

                                {/* ELEGANT FRAMED TEXT */}
                                <div className="relative mb-16 py-8 px-6 w-full max-w-sm">
                                    {/* Subtle crop-mark like corners */}
                                    <div className="absolute top-0 left-0 w-4 h-[1px] bg-gold/50" />
                                    <div className="absolute top-0 left-0 w-[1px] h-4 bg-gold/50" />
                                    <div className="absolute top-0 right-0 w-4 h-[1px] bg-gold/50" />
                                    <div className="absolute top-0 right-0 w-[1px] h-4 bg-gold/50" />
                                    <div className="absolute bottom-0 left-0 w-4 h-[1px] bg-gold/50" />
                                    <div className="absolute bottom-0 left-0 w-[1px] h-4 bg-gold/50" />
                                    <div className="absolute bottom-0 right-0 w-4 h-[1px] bg-gold/50" />
                                    <div className="absolute bottom-0 right-0 w-[1px] h-4 bg-gold/50" />

                                    {/* Left and Right very faint framing lines */}
                                    <div className="absolute top-4 bottom-4 left-0 w-[1px] bg-gold/20" />
                                    <div className="absolute top-4 bottom-4 right-0 w-[1px] bg-gold/20" />

                                    <h3 className="font-cinzel text-plum text-center leading-relaxed flex flex-col items-center gap-3">
                                        <span className="text-sm tracking-[0.15em] opacity-90">
                                            TU PRESENCIA ES PARTE DE LA SORPRESA.
                                        </span>
                                        <span className="text-xs tracking-[0.1em] opacity-60">
                                            TE PEDIMOS MANTENERLO EN SECRETO HASTA EL GRAN DÍA
                                        </span>
                                    </h3>
                                </div>

                                {/* MINIMALIST LUXURY BUTTON */}
                                <div className="relative">
                                    {/* Floating Dots */}
                                    <div className="absolute -top-6 -right-8 w-2 h-2 rounded-full bg-plum/80" />
                                    <div className="absolute top-0 -right-4 w-1.5 h-1.5 rounded-full bg-plum/40" />
                                    <div className="absolute -bottom-4 -left-6 w-2 h-2 rounded-full bg-plum/80" />
                                    <div className="absolute bottom-2 -left-3 w-1.5 h-1.5 rounded-full bg-plum/40" />

                                    <button
                                        onClick={() => {
                                            setShowLoader(false);
                                            if (onLoad) onLoad(true);
                                        }}
                                        className="group relative px-16 py-5 bg-plum text-white rounded-[40px] shadow-[0_10px_25px_rgba(122,45,62,0.25)] transition-all duration-300 transform hover:scale-[1.02] active:scale-95 overflow-hidden"
                                    >
                                        <span className="relative z-10 font-vibes text-[2.5rem] tracking-wide block leading-none pt-2 pb-1">
                                            Abrir Invitación
                                        </span>

                                        {/* Extremely subtle hover shimmer */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            )}

            <Document
                file={file}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadProgress={onDocumentLoadProgress}
                options={documentOptions}
                loading={null}
                error={
                    <div className="text-red-500 p-10 font-bold bg-white rounded shadow font-playfair relative z-[60]">
                        Error al cargar el PDF. Por favor recarga la página.
                    </div>
                }
                className="shadow-2xl"
            >
                {Array.from(new Array(numPages), (el, index) => (
                    <div key={`page_${index + 1}`} className="relative group/page">
                        <Page
                            pageNumber={index + 1}
                            width={containerWidth ? Math.min(containerWidth, 800) : undefined}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            className="bg-white"
                            // Optimize rendering: lower DPR on mobile for speed
                            devicePixelRatio={typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1}
                            // Only trigger success on the first page to dissolve loader
                            onRenderSuccess={index === 0 ? onPageRenderSuccess : undefined}
                        />



                        {/* TIMER */}
                        {index + 1 === (timerConfig?.page || 1) && isLoaded && (
                            <div
                                className="absolute z-[40] pointer-events-none w-full"
                                style={{
                                    top: timerConfig?.top || '60%',
                                    left: timerConfig?.left || '50%',
                                    transform: 'translateX(-50%)',
                                }}
                            >
                                <CountdownTimer />
                            </div>
                        )}

                        {/* BUTTONS */}
                        {index + 1 === numPages && isLoaded && (
                            <>
                                {/* MAP BUTTON */}
                                <div
                                    onClick={onOpenMap}
                                    className="absolute cursor-pointer z-40 rounded-full hover:bg-black/5 transition-colors border-2 border-transparent hover:border-plum/20"
                                    style={{
                                        top: buttonsConfig?.map.top || '70.069%',
                                        left: buttonsConfig?.map.left || '12.180%',
                                        width: buttonsConfig?.map.width || '38.704%',
                                        height: buttonsConfig?.map.height || '7.913%',
                                    }}
                                    title="Ver Mapa"
                                />

                                {/* RSVP BUTTON */}
                                <div
                                    onClick={onOpenRsvp}
                                    className="absolute cursor-pointer z-40 rounded-full hover:bg-black/5 transition-colors border-2 border-transparent hover:border-plum/20"
                                    style={{
                                        top: buttonsConfig?.rsvp.top || '78.336%',
                                        left: buttonsConfig?.rsvp.left || '46.086%',
                                        width: buttonsConfig?.rsvp.width || '39.439%',
                                        height: buttonsConfig?.rsvp.height || '8.130%',
                                    }}
                                    title="Confirmar Asistencia"
                                />
                            </>
                        )}
                    </div>
                ))}
            </Document>
        </div>
    );
}
