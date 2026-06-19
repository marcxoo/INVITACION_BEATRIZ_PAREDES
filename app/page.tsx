'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Use query param for legacy reset action? or just the dashboard
// The legacy code checked URL params for reset. We can handle that if needed, 
// but usually that is for the admin/user debugging.

const ModernPDFViewer = dynamic(() => import('./components/ModernPDFViewer'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#FCFBF8',
        backgroundImage: 'radial-gradient(rgba(107,31,49,0.05) 1px, transparent 1px)',
        backgroundSize: '30px 30px',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ display: 'flex', gap: 10 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#6B1F31',
              animation: `pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite ${i * 0.15}s`,
            }}
          />
        ))}
      </div>
    </div>
  ),
});

import AudioPlayer from './components/AudioPlayer';
import RsvpModal from './components/RsvpModal';

export default function Home() {
  const [isRsvpOpen, setRsvpOpen] = useState(false);
  const [invitationLoaded, setInvitationLoaded] = useState(false);
  const [eventSlug, setEventSlug] = useState('invitacion-beatriz-paredes'); // Default

  useEffect(() => {
    // Logic for specific domains if needed
  }, []);

  // MANEJADOR DEL TIMER: Ajusta estos valores para moverlo
  const timerConfig = {
    page: 1,
    top: 'calc(69% - 215px)',
    left: '50%',
  };

  // MANEJADOR DE BOTONES: Ajusta posición y tamaño de las áreas de clic
  const buttonsConfig = {
    map: {
      top: '71.2%',
      left: '12.180%',
      width: '38.704%',
      height: '7.913%',
    },
    rsvp: {
      top: '79%',
      left: '46.086%',
      width: '39.439%',
      height: '8.130%',
    }
  };

  const handleOpenMap = () => {
    window.open('https://maps.app.goo.gl/HkMxbZPHgzZ3cjfL6', '_blank');
  };

  return (
    <>
      {/* CONTENIDO REAL — el ModernPDFViewer maneja su propio loader Gatsby */}
      <main className="min-h-screen bg-paper flex flex-col items-center pb-0 relative overflow-x-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-10"
          style={{ backgroundImage: 'radial-gradient(#FFD1DC 2px, transparent 2px)', backgroundSize: '30px 30px' }}
        />

        {invitationLoaded && <AudioPlayer />}

        <div className="w-full max-w-4xl relative z-10 p-0">
          <ModernPDFViewer
            file="/beatriz_invitacion_compressed_compressed_compressed-comprimido.pdf?v=69"
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
          eventSlug={eventSlug}
        />
      </main>
    </>
  );
}
