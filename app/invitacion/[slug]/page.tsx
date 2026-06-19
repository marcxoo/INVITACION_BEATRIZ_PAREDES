'use client';

import { useEffect, useState, use } from 'react';
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';
import AudioPlayer from '@/app/components/AudioPlayer';
import RsvpModal from '@/app/components/RsvpModal';

const ModernPDFViewer = dynamic(() => import('@/app/components/ModernPDFViewer'), {
    ssr: false,
});

export default function InvitationPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = use(params); // Next.js 15+ Params handling
    const [isValid, setIsValid] = useState<boolean | null>(null);
    const [isRsvpOpen, setRsvpOpen] = useState(false);
    const [guestName, setGuestName] = useState('');

    const [invitationLoaded, setInvitationLoaded] = useState(false);

    useEffect(() => {
        checkSlug();
    }, [resolvedParams.slug]);

    async function checkSlug() {
        const { data, error } = await supabase
            .from('beatriz_rsvp')
            .select('family_name')
            .eq('view_key', resolvedParams.slug)
            .single();

        if (error || !data) {
            setIsValid(false);
        } else {
            setIsValid(true);
            setGuestName(data.family_name);
        }
    }

    const handleOpenMap = () => {
        window.open('https://maps.app.goo.gl/8VHARbVpgyjSV1a36', '_blank');
    };

    const timerConfig = {
        page: 1,
        top: 'calc(64.5% - 210px)',
        left: '50%',
    };

    const buttonsConfig = {
        map: { top: '71.2%', left: '12.180%', width: '38.704%', height: '7.913%' },
        rsvp: { top: '79%', left: '46.086%', width: '39.439%', height: '8.130%' }
    };

    if (isValid === false) return notFound();

    return (
        <>
            {/* PANTALLA DE CARGA — overlay mientras se verifica el slug o carga el PDF */}
            {(isValid === null || !invitationLoaded) && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 overflow-hidden bg-[#FCFBF8]"
                    style={{ backgroundImage: 'radial-gradient(rgba(107,31,49,0.05) 1px, transparent 1px)', backgroundSize: '30px 30px' }}
                >
                    <div className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
                        style={{ background: 'radial-gradient(circle, rgba(107,31,49,0.04) 0%, transparent 70%)' }} />

                    <div className="relative z-10 flex flex-col items-center text-center px-8 w-full max-w-sm">
                        <div className="flex items-center gap-3 w-full mb-8 gatsby-fade-up">
                            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(107,31,49,0.5))' }} />
                            <svg width="6" height="6" viewBox="0 0 6 6" fill="rgba(107,31,49,0.5)" className="rotate-45"><rect width="6" height="6" /></svg>
                            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(107,31,49,0.5))' }} />
                        </div>

                        <p className="font-cinzel text-[10px] tracking-[0.3em] mb-4 uppercase gatsby-fade-up-delay-1"
                            style={{ color: 'rgba(107,31,49,0.6)' }}>
                            Una Invitación Exclusiva
                        </p>

                        <h1 className="font-cinzel text-5xl md:text-6xl tracking-[0.1em] leading-tight mb-6 text-[#6B1F31] gatsby-fade-up-delay-1">
                            BEATRIZ<br />PAREDES
                        </h1>

                        <div className="flex items-center gap-3 w-full mb-6 gatsby-fade-up-delay-2">
                            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(107,31,49,0.3))' }} />
                            <svg width="4" height="4" viewBox="0 0 4 4" fill="rgba(107,31,49,0.3)" className="rotate-45"><rect width="4" height="4" /></svg>
                            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(107,31,49,0.3))' }} />
                        </div>

                        <p className="font-playfair italic text-xl tracking-wider mb-1 text-[#6B1F31]/80 gatsby-fade-up-delay-2">
                            Mis dulces 60 años
                        </p>
                        <p className="font-cinzel text-[10px] tracking-[0.35em] mb-10 text-[#6B1F31]/50 gatsby-fade-up-delay-2">
                            2026
                        </p>

                        <div className="flex gap-3 h-[48px] items-center justify-center gatsby-fade-up-delay-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#6B1F31] animate-pulse" />
                            <div className="w-1.5 h-1.5 rounded-full bg-[#6B1F31] animate-pulse" style={{ animationDelay: '150ms' }} />
                            <div className="w-1.5 h-1.5 rounded-full bg-[#6B1F31] animate-pulse" style={{ animationDelay: '300ms' }} />
                        </div>

                        <div className="flex items-center gap-3 w-full mt-8 gatsby-fade-up-delay-3">
                            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(107,31,49,0.5))' }} />
                            <svg width="6" height="6" viewBox="0 0 6 6" fill="rgba(107,31,49,0.5)" className="rotate-45"><rect width="6" height="6" /></svg>
                            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(107,31,49,0.5))' }} />
                        </div>
                    </div>
                </div>
            )}

            {/* CONTENIDO REAL — siempre montado (cuando isValid no es null) para que el PDF dispare onLoad */}
            {isValid === true && (
                <main className="min-h-screen bg-paper flex flex-col items-center pb-20 relative overflow-x-hidden">
                    {invitationLoaded && <AudioPlayer />}

                    <div className="w-full max-w-4xl relative z-10 my-4 md:my-10 px-0 md:px-4">
                        <ModernPDFViewer
                            file="/beatriz_invitacion_compressed_compressed_compressed-comprimido.pdf?v=68"
                            onOpenRsvp={() => setRsvpOpen(true)}
                            onOpenMap={handleOpenMap}
                            onLoad={() => setInvitationLoaded(true)}
                            timerConfig={timerConfig}
                            buttonsConfig={buttonsConfig}
                        />
                    </div>

                    <RsvpModal
                        isOpen={isRsvpOpen}
                        onClose={() => setRsvpOpen(false)}
                        prefilledName={guestName}
                        eventSlug={`invitacion-${resolvedParams.slug}`}
                    />
                </main>
            )}
        </>
    );
}
