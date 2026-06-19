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
        <div className="min-h-screen relative overflow-x-hidden font-playfair bg-[#FCFBF8]"
            style={{ backgroundImage: 'radial-gradient(rgba(107,31,49,0.05) 1px, transparent 1px)', backgroundSize: '30px 30px' }}>

            {/* Ambient glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none"
                style={{ background: 'radial-gradient(ellipse, rgba(107,31,49,0.04) 0%, transparent 70%)' }} />

            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-10">

                {/* CABECERA */}
                <div className="text-center space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(107,31,49,0.5))' }} />
                        <svg width="6" height="6" viewBox="0 0 6 6" fill="rgba(107,31,49,0.6)" className="rotate-45"><rect width="6" height="6" /></svg>
                        <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(107,31,49,0.5))' }} />
                    </div>
                    <h1 className="font-vibes text-[#6B1F31]" style={{
                        fontSize: 'clamp(3rem, 8vw, 5.5rem)',
                        lineHeight: 1.1,
                    }}>Beatriz Paredes</h1>
                    <p className="font-cinzel text-[9px] tracking-[0.45em] uppercase" style={{ color: 'rgba(107,31,49,0.7)' }}>
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
                        <div key={label} className="text-center py-6 sm:py-8 px-2 sm:px-4 transition-transform hover:-translate-y-1"
                            style={{
                                background: main ? '#6B1F31' : 'rgba(255,255,255,0.7)',
                                border: `1px solid ${main ? '#6B1F31' : 'rgba(107,31,49,0.2)'}`,
                                borderRadius: '4px',
                                boxShadow: main ? '0 12px 30px rgba(107,31,49,0.25)' : '0 4px 15px rgba(0,0,0,0.03)',
                                backdropFilter: 'blur(10px)',
                            }}>
                            <p className="font-cinzel mb-3 leading-tight uppercase"
                                style={{ fontSize: 'clamp(7px, 1.8vw, 10px)', letterSpacing: '0.3em', color: main ? 'rgba(252,251,248,0.9)' : 'rgba(107,31,49,0.6)' }}>
                                {label}
                            </p>
                            <div className="font-cinzel" style={{
                                fontSize: 'clamp(2rem, 6vw, 4rem)',
                                color: main ? '#FCFBF8' : '#6B1F31',
                                lineHeight: 1,
                            }}>
                                {value}
                            </div>
                        </div>
                    ))}
                </div>

                {/* TABLA */}
                <div style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(107,31,49,0.2)', borderRadius: '4px', overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', backdropFilter: 'blur(10px)' }}>
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 sm:px-6 py-4"
                        style={{ background: 'rgba(107,31,49,0.03)', borderBottom: '1px solid rgba(107,31,49,0.15)' }}>
                        <h2 className="font-cinzel text-[10px] sm:text-[11px] tracking-[0.3em] uppercase font-bold" style={{ color: '#6B1F31' }}>
                            Lista de Invitados
                        </h2>
                        <button onClick={fetchGuests}
                            className="font-cinzel text-[9px] tracking-[0.2em] uppercase px-4 py-2 transition-all active:scale-95 bg-[#6B1F31] text-[#FCFBF8] rounded hover:bg-[#5a1928]"
                            style={{ boxShadow: '0 2px 8px rgba(107,31,49,0.2)' }}>
                            ↻ Actualizar
                        </button>
                    </div>

                    {/* Columnas */}
                    <div className="grid px-5 sm:px-6 py-3"
                        style={{ gridTemplateColumns: '1fr 70px 110px', borderBottom: '1px solid rgba(107,31,49,0.1)' }}>
                        {['Nombre / Familia', 'Personas', 'Estado'].map((h, i) => (
                            <span key={h} className="font-cinzel text-[8px] tracking-[0.3em] uppercase font-bold"
                                style={{ color: 'rgba(107,31,49,0.6)', textAlign: i === 1 ? 'center' : i === 2 ? 'right' : 'left' as any }}>
                                {h}
                            </span>
                        ))}
                    </div>

                    {/* Filas */}
                    {loading ? (
                        <div className="py-16 flex justify-center gap-3">
                            {[0, 1, 2].map(i => (
                                <div key={i} className="w-2 h-2 rounded-full bg-[#6B1F31] animate-pulse"
                                    style={{ animationDelay: `${i * 150}ms` }} />
                            ))}
                        </div>
                    ) : guests.length === 0 ? (
                        <div className="py-16 text-center">
                            <p className="font-playfair italic text-sm" style={{ color: 'rgba(107,31,49,0.4)' }}>
                                No hay respuestas aún...
                            </p>
                        </div>
                    ) : (
                        <div>
                            {guests.map((g, i) => {
                                const isYes = g.status === 'confirmed';
                                return (
                                    <div key={g.id || i} className="grid px-5 sm:px-6 py-4 items-center hover:bg-[#6B1F31]/[0.02] transition-colors"
                                        style={{
                                            gridTemplateColumns: '1fr 70px 110px',
                                            borderBottom: '1px solid rgba(107,31,49,0.08)',
                                            opacity: isYes ? 1 : 0.6,
                                        }}>
                                        <div>
                                            <div className="font-playfair text-sm sm:text-base font-semibold" style={{ color: '#6B1F31' }}>{g.family_name}</div>
                                            <div className="font-mono text-[8px] mt-0.5" style={{ color: 'rgba(107,31,49,0.4)' }}>{g.id?.slice(0, 8)}</div>
                                        </div>
                                        <div className="text-center font-cinzel font-bold"
                                            style={{ fontSize: '1.1rem', color: isYes ? '#6B1F31' : 'rgba(107,31,49,0.4)' }}>
                                            {isYes ? (g.confirmed_count || 1) : '—'}
                                        </div>
                                        <div className="text-right">
                                            <span className="font-cinzel text-[7px] sm:text-[8px] tracking-[0.15em] uppercase px-3 py-1.5 font-bold"
                                                style={{
                                                    background: isYes ? 'rgba(107,31,49,0.08)' : 'transparent',
                                                    border: `1px solid ${isYes ? 'transparent' : 'rgba(107,31,49,0.2)'}`,
                                                    color: isYes ? '#6B1F31' : 'rgba(107,31,49,0.5)',
                                                    borderRadius: '4px',
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
                    <p className="font-cinzel text-[8px] tracking-[0.2em] uppercase font-bold" style={{ color: 'rgba(107,31,49,0.5)' }}>
                        {guests.length} registro{guests.length !== 1 ? 's' : ''} únicos
                    </p>
                    <button onClick={handleDeleteAll}
                        className="font-cinzel text-[9px] tracking-[0.2em] uppercase px-5 py-2.5 transition-all active:scale-95 hover:bg-red-50"
                        style={{ border: '1px solid rgba(220,60,60,0.3)', color: 'rgba(220,60,60,0.8)', borderRadius: '4px' }}>
                        Borrar todos los registros
                    </button>
                </div>
            </div>

        </div>
    );
}
