'use client';

import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';

export default function AdminDashboard({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = use(params);
    const eventSlug = `invitacion-${resolvedParams.slug}`;

    const [guests, setGuests] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Metrics
    const [stats, setStats] = useState({ responses: 0, people: 0, declined: 0 });

    useEffect(() => {
        fetchGuests();
    }, [resolvedParams.slug]);

    async function fetchGuests() {
        setLoading(true);
        const { data, error } = await supabase
            .from('invitations')
            .select('*')
            .eq('event_slug', eventSlug)
            .order('created_at', { ascending: false });

        if (error) {
            alert('Error: ' + error.message);
            setLoading(false);
            return;
        }

        const allVotes = data || [];

        // Deduplication (Last Vote Wins)
        const uniqueGuests = new Map();
        for (const vote of allVotes) {
            if (!vote.family_name) continue;
            const key = vote.family_name.trim().toLowerCase();
            // We only keep the latest one because we ordered by created_at desc (but actually supabase order is desc, so first is latest)
            // But if we iterate, the first one we see is the latest.
            if (!uniqueGuests.has(key)) {
                uniqueGuests.set(key, vote);
            }
        }
        const finalGuests = Array.from(uniqueGuests.values());
        setGuests(finalGuests);

        // Calc Stats
        const yesGroups = finalGuests.filter(g => g.status === 'confirmed');
        const noResponse = finalGuests.filter(g => g.status === 'declined');
        const totalPax = yesGroups.reduce((acc, g) => acc + (g.confirmed_count || 1), 0);

        setStats({
            responses: yesGroups.length,
            people: totalPax,
            declined: noResponse.length
        });

        setLoading(false);
    }

    async function handleDeleteAll() {
        if (prompt("ADMIN PASSWORD:") !== "rositamaria") return alert("Incorrecto");
        if (!confirm(`¿Estás seguro de borrar SOLO los datos de ${resolvedParams.slug}?`)) return;

        // Delete only this event's records
        await supabase
            .from('invitations')
            .delete()
            .eq('event_slug', eventSlug);

        fetchGuests();
    }



    // New Color Palette:
    // Plum: #7A2D3E
    // Gold: #D4AF37
    // Paper: #FDFBF7
    // Pink (Light): #FFD1DC

    return (
        <div className="min-h-screen flex flex-col items-center p-6 bg-[#FDFBF7] relative overflow-x-hidden"
            style={{ fontFamily: '"Playfair Display", serif' }}>

            {/* PATTERN BACKGROUND */}
            <div
                className="absolute inset-0 z-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(#7A2D3E 2px, transparent 2px)',
                    backgroundSize: '30px 30px'
                }}
            />

            {/* MASTHEAD */}
            <div className="relative z-10 text-center mb-10 mt-4">
                <h1 className="text-5xl md:text-7xl font-bold text-[#7A2D3E] font-vibes drop-shadow-sm capitalize">{resolvedParams.slug.replace('-', ' ')}</h1>
                <div className="bg-[#7A2D3E] text-[#D4AF37] px-8 py-2 rounded-full text-sm font-bold uppercase tracking-widest mt-4 inline-block border-2 border-[#D4AF37]">
                    Reporte de Asistencia
                </div>
            </div>

            {/* METRICS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl relative z-10 mb-10">
                <div className="bg-white p-8 rounded-[30px] border-2 border-[#D4AF37]/30 shadow-xl text-center">
                    <span className="text-[#7A2D3E] font-bold uppercase text-xs tracking-wider block mb-2">Familias Confirmadas</span>
                    <div className="text-6xl font-black text-[#7A2D3E] font-sans">{stats.responses}</div>
                </div>

                <div className="bg-[#7A2D3E] p-8 rounded-[30px] border-4 border-[#D4AF37] shadow-xl text-center scale-110 relative z-20">
                    <span className="text-[#D4AF37] font-bold uppercase text-xs tracking-wider block mb-2">Total Personas</span>
                    <div className="text-7xl font-black text-white font-sans">{stats.people}</div>
                </div>

                <div className="bg-white p-8 rounded-[30px] border-2 border-[#D4AF37]/30 shadow-xl text-center">
                    <span className="text-gray-400 font-bold uppercase text-xs tracking-wider block mb-2">Declinaron</span>
                    <div className="text-6xl font-black text-gray-400 font-sans">{stats.declined}</div>
                </div>
            </div>

            {/* TABLE */}
            <div className="w-full max-w-5xl bg-white rounded-[30px] border-2 border-[#D4AF37]/20 overflow-hidden shadow-2xl relative z-10 mb-12">
                <div className="bg-[#7A2D3E] p-6 text-white flex justify-between items-center border-b-4 border-[#D4AF37]">
                    <h2 className="text-2xl font-bold font-vibes">Lista de Invitados</h2>
                    <button onClick={fetchGuests} className="bg-[#D4AF37] text-[#7A2D3E] px-4 py-1 rounded-full text-xs font-bold hover:bg-white transition-colors">
                        ↻ Actualizar
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#FDFBF7] text-[#7A2D3E] text-xs uppercase font-bold border-b border-[#D4AF37]/20">
                            <tr>
                                <th className="p-6">Nombre / Familia</th>
                                <th className="p-6 text-center">Cupos</th>
                                <th className="p-6 text-right">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#7A2D3E]/10">
                            {guests.length === 0 ? (
                                <tr><td colSpan={3} className="p-10 text-center text-gray-400 italic">No hay registros para '{resolvedParams.slug}' aún...</td></tr>
                            ) : (
                                guests.map((g, i) => {
                                    const isYes = g.status === 'confirmed';
                                    return (
                                        <tr key={i} className={`hover:bg-[#FFF5F7] transition-colors ${!isYes ? 'opacity-60' : ''}`}>
                                            <td className="p-6">
                                                <div className="font-bold text-xl text-[#7A2D3E]">{g.family_name}</div>
                                                <div className="text-xs text-gray-400 font-mono">ID: {g.id.slice(0, 8)}</div>
                                            </td>
                                            <td className="p-6 text-center">
                                                {isYes ? (
                                                    <span className="inline-block px-3 py-1 rounded-lg bg-[#FDFBF7] border border-[#7A2D3E]/20 font-bold text-[#7A2D3E]">
                                                        {g.confirmed_count}
                                                    </span>
                                                ) : <span className="text-gray-300">-</span>}
                                            </td>
                                            <td className="p-6 text-right">
                                                {isYes ? (
                                                    <span className="bg-[#7A2D3E] text-white px-4 py-1 rounded-full text-xs font-bold">ASISTIRÁ</span>
                                                ) : (
                                                    <span className="bg-gray-100 text-gray-400 px-4 py-1 rounded-full text-xs font-bold">NO PODRÁ</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* FOOTER ACTIONS */}
            <div className="flex gap-4 mb-20">
                <button
                    onClick={handleDeleteAll}
                    className="px-6 py-3 rounded-xl text-xs font-bold text-red-300 border border-red-200 hover:bg-red-50 hover:text-red-500 transition-all"
                >
                    BORRAR BASE DE DATOS ({resolvedParams.slug})
                </button>
            </div>

        </div>
    );
}
