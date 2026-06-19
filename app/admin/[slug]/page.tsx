'use client';

import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';

const ADMIN_PASSWORD = 'beatriz2026';

export default function AdminDashboard({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = use(params);

    if (resolvedParams.slug !== 'beatriz-paredes') return notFound();

    const [authed, setAuthed] = useState(true);
    const [password, setPassword] = useState('');
    const [pwError, setPwError] = useState('');

    const [guests, setGuests] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ confirmed: 0, people: 0, declined: 0 });

    function handleAuth() {
        if (password === ADMIN_PASSWORD) { setAuthed(true); setPwError(''); }
        else setPwError('Contraseña incorrecta');
    }

    useEffect(() => {
        fetchGuests();
    }, []);

    async function fetchGuests() {
        setLoading(true);
        const { data, error } = await supabase
            .from('beatriz_rsvp')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error:', error.message);
            setLoading(false);
            return;
        }

        const allVotes = data || [];
        const uniqueGuests = new Map<string, any>();
        for (const vote of allVotes) {
            if (!vote.family_name) continue;
            const key = vote.family_name.trim().toLowerCase();
            if (!uniqueGuests.has(key)) uniqueGuests.set(key, vote);
        }
        const finalGuests = Array.from(uniqueGuests.values());
        setGuests(finalGuests);

        const confirmed = finalGuests.filter(g => g.status === 'confirmed');
        const declined  = finalGuests.filter(g => g.status === 'declined');
        const totalPax = confirmed.reduce((acc, g) => acc + (g.confirmed_count || 1), 0);
        setStats({ confirmed: confirmed.length, people: totalPax, declined: declined.length });
        setLoading(false);
    }

    async function handleDeleteAll() {
        const pw = window.prompt('Contraseña de administrador:');
        if (pw !== ADMIN_PASSWORD) { alert('Contraseña incorrecta'); return; }
        if (!window.confirm('¿Borrar TODOS los registros de asistencia? Esta acción no se puede deshacer.')) return;
        await supabase.from('beatriz_rsvp').delete().eq('is_public', true);
        fetchGuests();
    }

    // ── PANEL PRINCIPAL ──
    return (
        <div className="min-h-screen relative overflow-x-hidden"
            style={{ background: 'radial-gradient(ellipse at 50% 0%, #2e1f06 0%, #16100a 55%, #0d0a06 100%)' }}>

            {/* Ambient glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none"
                style={{ background: 'radial-gradient(ellipse, rgba(197,160,89,0.14) 0%, transparent 70%)' }} />

            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-10">

                {/* CABECERA */}
                <div className="text-center space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(197,160,89,0.7))' }} />
                        <svg width="7" height="7" viewBox="0 0 7 7" fill="rgba(197,160,89,1)"><polygon points="3.5,0 7,3.5 3.5,7 0,3.5" /></svg>
                        <svg width="4" height="4" viewBox="0 0 4 4" fill="rgba(197,160,89,0.7)" className="mx-1"><polygon points="2,0 4,2 2,4 0,2" /></svg>
                        <svg width="7" height="7" viewBox="0 0 7 7" fill="rgba(197,160,89,1)"><polygon points="3.5,0 7,3.5 3.5,7 0,3.5" /></svg>
                        <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(197,160,89,0.7))' }} />
                    </div>
                    <h1 className="font-vibes" style={{
                        fontSize: 'clamp(3rem, 8vw, 5.5rem)',
                        background: 'linear-gradient(180deg, #fff0b3 0%, #e8c060 50%, #c5a059 100%)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        lineHeight: 1.1,
                        filter: 'drop-shadow(0 2px 12px rgba(197,160,89,0.35))',
                    }}>Beatriz Paredes</h1>
                    <p className="font-cinzel text-[9px] tracking-[0.45em] uppercase" style={{ color: 'rgba(197,160,89,0.75)' }}>
                        Reporte de Asistencia
                    </p>
                </div>

                {/* MÉTRICAS */}
                <div className="grid grid-cols-3 gap-3 sm:gap-5">
                    {[
                        { label: 'Familias Confirmadas', value: stats.confirmed, main: false },
                        { label: 'Total Personas',        value: stats.people,    main: true  },
                        { label: 'Declinaron',            value: stats.declined,  main: false },
                    ].map(({ label, value, main }) => (
                        <div key={label} className="text-center py-6 sm:py-8 px-2 sm:px-4"
                            style={{
                                background: main ? 'linear-gradient(160deg, #3a2a0a 0%, #261a06 100%)' : 'rgba(197,160,89,0.06)',
                                border: `1px solid ${main ? 'rgba(197,160,89,0.8)' : 'rgba(197,160,89,0.3)'}`,
                                borderRadius: '2px',
                                boxShadow: main ? '0 8px 40px rgba(197,160,89,0.2), inset 0 1px 0 rgba(255,240,160,0.1)' : 'inset 0 1px 0 rgba(197,160,89,0.05)',
                            }}>
                            <p className="font-cinzel mb-3 leading-tight uppercase"
                                style={{ fontSize: 'clamp(7px, 1.8vw, 10px)', letterSpacing: '0.3em', color: main ? 'rgba(197,160,89,0.9)' : 'rgba(197,160,89,0.6)' }}>
                                {label}
                            </p>
                            <div className="font-cinzel" style={{
                                fontSize: 'clamp(2rem, 6vw, 4rem)',
                                color: main ? '#ffe599' : '#C5A059',
                                lineHeight: 1,
                                textShadow: main ? '0 0 30px rgba(197,160,89,0.5)' : 'none',
                            }}>
                                {value}
                            </div>
                        </div>
                    ))}
                </div>

                {/* TABLA */}
                <div style={{ border: '1px solid rgba(197,160,89,0.4)', borderRadius: '2px', overflow: 'hidden', boxShadow: '0 4px 32px rgba(0,0,0,0.4)' }}>
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 sm:px-6 py-4"
                        style={{ background: 'linear-gradient(90deg, rgba(197,160,89,0.18) 0%, rgba(197,160,89,0.06) 100%)', borderBottom: '1px solid rgba(197,160,89,0.35)' }}>
                        <h2 className="font-cinzel text-[10px] sm:text-[11px] tracking-[0.3em] uppercase" style={{ color: '#E8C96A' }}>
                            Lista de Invitados
                        </h2>
                        <button onClick={fetchGuests}
                            className="font-cinzel text-[9px] tracking-[0.2em] uppercase px-4 py-2 transition-all active:scale-95"
                            style={{ border: '1px solid rgba(197,160,89,0.6)', color: '#C5A059', borderRadius: '2px' }}>
                            ↻ Actualizar
                        </button>
                    </div>

                    {/* Columnas */}
                    <div className="grid px-5 sm:px-6 py-3"
                        style={{ gridTemplateColumns: '1fr 70px 110px', borderBottom: '1px solid rgba(197,160,89,0.2)', background: 'rgba(197,160,89,0.07)' }}>
                        {['Nombre / Familia', 'Personas', 'Estado'].map((h, i) => (
                            <span key={h} className="font-cinzel text-[8px] tracking-[0.3em] uppercase"
                                style={{ color: 'rgba(197,160,89,0.7)', textAlign: i === 1 ? 'center' : i === 2 ? 'right' : 'left' as any }}>
                                {h}
                            </span>
                        ))}
                    </div>

                    {/* Filas */}
                    {loading ? (
                        <div className="py-16 flex justify-center gap-3">
                            {[0, 1, 2].map(i => (
                                <div key={i} className="w-2 h-2 rounded-full"
                                    style={{ background: '#C5A059', animation: `gatsby-dot 1.4s ease-in-out ${i * 0.32}s infinite` }} />
                            ))}
                        </div>
                    ) : guests.length === 0 ? (
                        <div className="py-16 text-center">
                            <p className="font-playfair italic text-sm" style={{ color: 'rgba(197,160,89,0.25)' }}>
                                No hay respuestas aún...
                            </p>
                        </div>
                    ) : (
                        <div>
                            {guests.map((g, i) => {
                                const isYes = g.status === 'confirmed';
                                return (
                                    <div key={g.id || i} className="grid px-5 sm:px-6 py-4 items-center"
                                        style={{
                                            gridTemplateColumns: '1fr 70px 110px',
                                            background: i % 2 === 1 ? 'rgba(197,160,89,0.05)' : 'rgba(197,160,89,0.02)',
                                            borderBottom: '1px solid rgba(197,160,89,0.12)',
                                            opacity: isYes ? 1 : 0.6,
                                        }}>
                                        <div>
                                            <div className="font-playfair text-sm sm:text-base" style={{ color: '#F5E6B8' }}>{g.family_name}</div>
                                            <div className="font-mono text-[8px] mt-0.5" style={{ color: 'rgba(197,160,89,0.4)' }}>{g.id?.slice(0, 8)}</div>
                                        </div>
                                        <div className="text-center font-cinzel"
                                            style={{ fontSize: '1.1rem', color: isYes ? '#E8C96A' : 'rgba(197,160,89,0.35)' }}>
                                            {isYes ? (g.confirmed_count || 1) : '—'}
                                        </div>
                                        <div className="text-right">
                                            <span className="font-cinzel text-[7px] sm:text-[8px] tracking-[0.15em] uppercase px-2.5 py-1"
                                                style={{
                                                    background: isYes ? 'rgba(197,160,89,0.18)' : 'rgba(255,255,255,0.04)',
                                                    border: `1px solid ${isYes ? 'rgba(197,160,89,0.55)' : 'rgba(255,255,255,0.12)'}`,
                                                    color: isYes ? '#E8C96A' : 'rgba(255,255,255,0.4)',
                                                    borderRadius: '2px',
                                                    whiteSpace: 'nowrap',
                                                }}>
                                                {isYes ? 'Asistirá' : 'No podrá'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* PIE */}
                <div className="flex items-center justify-between pt-2 pb-12">
                    <p className="font-cinzel text-[8px] tracking-[0.2em] uppercase" style={{ color: 'rgba(197,160,89,0.5)' }}>
                        {guests.length} registro{guests.length !== 1 ? 's' : ''} únicos
                    </p>
                    <button onClick={handleDeleteAll}
                        className="font-cinzel text-[9px] tracking-[0.2em] uppercase px-5 py-2.5 transition-all active:scale-95"
                        style={{ border: '1px solid rgba(220,60,60,0.45)', color: 'rgba(220,90,90,0.7)', borderRadius: '2px' }}>
                        Borrar todos los registros
                    </button>
                </div>
            </div>

        </div>
    );
}
