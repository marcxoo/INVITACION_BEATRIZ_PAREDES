'use client';

import { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { motion } from 'framer-motion';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Worker local — sin dependencia de CDN externo
if (typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

// Sin cmaps externos — el PDF usa fuentes estándar
const documentOptions = {
    cMapPacked: true,
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
            setIsLoaded(true);
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

            {/* GATSBY LUXURY LOADER */}
            {showLoader && (
                <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 overflow-hidden bg-[#FCFBF8]"
                    style={{ backgroundImage: 'radial-gradient(rgba(107,31,49,0.05) 1px, transparent 1px)', backgroundSize: '30px 30px' }}
                >
                    {/* Ambient glow */}
                    <div className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
                        style={{ background: 'radial-gradient(circle, rgba(107,31,49,0.04) 0%, transparent 70%)' }} />

                    <div className="relative z-10 flex flex-col items-center text-center px-8 w-full max-w-sm">

                        {/* Top ornament */}
                        <div className="flex items-center gap-3 w-full mb-8">
                            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(107,31,49,0.5))' }} />
                            <svg width="6" height="6" viewBox="0 0 6 6" fill="rgba(107,31,49,0.5)" className="rotate-45"><rect width="6" height="6" /></svg>
                            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(107,31,49,0.5))' }} />
                        </div>

                        {/* Pre-title */}
                        <p className="font-cinzel text-[10px] tracking-[0.3em] mb-4 uppercase"
                            style={{ color: 'rgba(107,31,49,0.6)' }}>
                            Una Invitación Exclusiva
                        </p>

                        {/* Name */}
                        <h1 className="font-cinzel text-5xl md:text-6xl tracking-[0.1em] leading-tight mb-6 text-[#6B1F31]">
                            BEATRIZ<br />PAREDES
                        </h1>

                        {/* Middle ornament */}
                        <div className="flex items-center gap-3 w-full mb-6">
                            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(107,31,49,0.3))' }} />
                            <svg width="4" height="4" viewBox="0 0 4 4" fill="rgba(107,31,49,0.3)" className="rotate-45"><rect width="4" height="4" /></svg>
                            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(107,31,49,0.3))' }} />
                        </div>

                        <p className="font-playfair italic text-xl tracking-wider mb-1 text-[#6B1F31]/80">
                            Mis dulces 60 años
                        </p>
                        <p className="font-cinzel text-[10px] tracking-[0.35em] mb-10 text-[#6B1F31]/50">
                            2026
                        </p>

                        {/* Loading state */}
                        {!isLoaded ? (
                            <div className="flex flex-col items-center gap-5 h-[48px] justify-center">
                                <div className="flex gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#6B1F31] animate-pulse" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#6B1F31] animate-pulse" style={{ animationDelay: '150ms' }} />
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#6B1F31] animate-pulse" style={{ animationDelay: '300ms' }} />
                                </div>
                                {loadingProgress > 0 && (
                                    <div className="w-40 h-px overflow-hidden bg-[#6B1F31]/10">
                                        <div className="h-full transition-all duration-300 bg-[#6B1F31]" style={{ width: `${loadingProgress}%` }} />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <motion.button
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, ease: 'easeOut' }}
                                onClick={() => {
                                    setShowLoader(false);
                                    if (onLoad) onLoad(true);
                                }}
                                className="group relative px-10 py-3 overflow-hidden rounded-full border border-[#6B1F31]/30 hover:border-[#6B1F31]/60 transition-colors"
                                style={{ background: 'rgba(107,31,49,0.03)' }}
                            >
                                <span className="relative z-10 font-cinzel text-sm tracking-[0.2em] uppercase font-bold text-[#6B1F31]">
                                    Abrir Invitación
                                </span>
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[#6B1F31]/5" />
                            </motion.button>
                        )}

                        {/* Bottom ornament */}
                        <div className="flex items-center gap-3 w-full mt-8">
                            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(107,31,49,0.5))' }} />
                            <svg width="6" height="6" viewBox="0 0 6 6" fill="rgba(107,31,49,0.5)" className="rotate-45"><rect width="6" height="6" /></svg>
                            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(107,31,49,0.5))' }} />
                        </div>
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
