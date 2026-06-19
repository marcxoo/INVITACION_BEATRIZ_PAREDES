'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Users, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface RsvpModalProps {
    isOpen: boolean;
    onClose: () => void;
    prefilledName?: string;
    eventSlug: string;
}

export default function RsvpModal({ isOpen, onClose, prefilledName, eventSlug }: RsvpModalProps) {
    // Initialize state lazily from localStorage to avoid flicker
    const [step, setStep] = useState<'form' | 'success' | 'alreadyResponded'>(() => {
        if (typeof window !== 'undefined') {
            const hasId = localStorage.getItem('invitation_id');
            if (hasId) return 'alreadyResponded';
        }
        return 'form';
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [name, setName] = useState(() => {
        if (typeof window !== 'undefined') {
            const cachedName = localStorage.getItem('rsvp_name');
            if (cachedName) return cachedName;
        }
        return prefilledName || '';
    });

    const [count, setCount] = useState(1);

    // Initialize ID from local storage
    const [invitationId, setInvitationId] = useState<string | null>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('invitation_id');
        }
        return null;
    });

    // Check Supabase for existing invitation on mount (background sync)
    useEffect(() => {
        if (isOpen) {
            checkExistingInvitation();
        }
    }, [isOpen]);

    async function checkExistingInvitation() {
        const storedId = localStorage.getItem('invitation_id');
        if (!storedId) return;

        try {
            const { data, error } = await supabase
            .from('beatriz_rsvp')
                .select('*')
                .eq('id', storedId)
                .single();

            if (error) {
                // If error (e.g. not found/deleted), clear local storage
                console.error('Error fetching invitation:', error);
                localStorage.removeItem('invitation_id');
                localStorage.removeItem('rsvp_name');
                setStep('form'); // Revert to form
                setInvitationId(null);
                return;
            }

            if (data) {
                setInvitationId(data.id);
                // Update specific fields from server truth
                setName(data.family_name);
                setCount(data.guest_limit || 1);

                // If we didn't have the name locally, this fixes it. 
                // We also update local storage to keep cache fresh
                localStorage.setItem('rsvp_name', data.family_name);

                setStep('alreadyResponded');
            }
        } catch (err) {
            console.error('Unexpected error checking invitation:', err);
        }
    }

    function handleNewRegistration() {
        setInvitationId(null);
        setName('');
        setCount(1);
        setStep('form');
    }

    async function handleSubmit(attending: boolean) {
        if (!name.trim()) {
            setError('Por favor escribe tu nombre');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const invitationData = {
                family_name: name,
                guest_limit: count,
                confirmed_count: attending ? count : 0,
                status: attending ? 'confirmed' : 'declined',
                is_public: true,
            };

            if (invitationId) {
                const { error: deleteError } = await supabase
                    .from('beatriz_rsvp')
                    .delete()
                    .eq('id', invitationId);

                if (deleteError) {
                    console.warn('Error deleting old invitation:', deleteError);
                }
            }

            // Always Insert New Record
            const { data, error: insertError } = await supabase
                .from('beatriz_rsvp')
                .insert([invitationData])
                .select();

            if (insertError) throw insertError;

            // Update ID state with the new record's ID
            if (data && data.length > 0) {
                const newId = data[0].id;
                localStorage.setItem('invitation_id', newId);
                localStorage.setItem('rsvp_name', name); // Cache name for next load
                setInvitationId(newId);
            }

            // Success UI
            if (attending) {
                setStep('success');
            } else {
                alert("Gracias por avisarnos. Lamentamos que no puedas asistir.");
                onClose();
            }
        } catch (err: any) {
            console.error(err);
            const msg = err.message || 'Ocurrió un error al guardar. Intenta de nuevo.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 24, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.95, y: 24, opacity: 0 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        className="relative w-full max-w-md overflow-hidden font-playfair"
                        style={{
                            background: '#FCFBF8',
                            backgroundImage: 'radial-gradient(rgba(107,31,49,0.03) 1px, transparent 1px)',
                            backgroundSize: '20px 20px',
                            border: '1px solid rgba(107,31,49,0.15)',
                            borderRadius: '4px',
                            boxShadow: '0 24px 64px rgba(0,0,0,0.15)',
                        }}
                    >
                        {/* Ambient glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 pointer-events-none"
                            style={{ background: 'radial-gradient(ellipse, rgba(107,31,49,0.05) 0%, transparent 70%)' }} />

                        {/* Top ornament */}
                        <div className="flex items-center gap-2 px-8 pt-6 mb-1">
                            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(107,31,49,0.4))' }} />
                            <svg width="4" height="4" viewBox="0 0 4 4" fill="rgba(107,31,49,0.6)" className="rotate-45"><rect width="4" height="4" /></svg>
                            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(107,31,49,0.4))' }} />
                        </div>

                        {/* CLOSE BUTTON */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-20 transition-opacity opacity-50 hover:opacity-100"
                            style={{ color: '#6B1F31' }}
                        >
                            <X size={22} strokeWidth={1.5} />
                        </button>

                        {step === 'form' ? (
                            <div className="px-8 pb-8 pt-2 space-y-6 relative z-10">
                                {/* Header */}
                                <div className="text-center">
                                    <p className="font-cinzel text-[9px] tracking-[0.4em] mb-3 uppercase" style={{ color: 'rgba(107,31,49,0.6)' }}>
                                        Confirmación de Asistencia
                                    </p>
                                    <h2 className="font-vibes mb-1 text-[#6B1F31]" style={{ fontSize: '2.8rem', lineHeight: 1.1 }}>
                                        ¡Celebremos a Beatriz!
                                    </h2>
                                    <p className="font-playfair italic text-sm" style={{ color: 'rgba(107,31,49,0.7)' }}>
                                        Acompáñanos a festejar este día especial.
                                    </p>
                                </div>

                                <div className="space-y-5">
                                    {/* NAME INPUT */}
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 font-cinzel text-[10px] tracking-[0.25em] uppercase" style={{ color: 'rgba(107,31,49,0.8)' }}>
                                            <User size={13} />
                                            Nombre o Familia
                                        </label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Ej. Familia Pérez"
                                            className="w-full px-4 py-3 outline-none text-base font-playfair transition-all placeholder-[#6B1F31]/30"
                                            style={{
                                                background: 'rgba(107,31,49,0.02)',
                                                border: '1px solid rgba(107,31,49,0.2)',
                                                borderRadius: '2px',
                                                color: '#6B1F31',
                                            }}
                                        />
                                    </div>

                                    {/* COUNT INPUT */}
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 font-cinzel text-[10px] tracking-[0.25em] uppercase" style={{ color: 'rgba(107,31,49,0.8)' }}>
                                            <Users size={13} />
                                            ¿Cuántos vendrán?
                                        </label>
                                        <div className="flex items-center gap-5">
                                            <button
                                                onClick={() => setCount(Math.max(1, count - 1))}
                                                className="w-10 h-10 flex items-center justify-center text-xl transition-all active:scale-90"
                                                style={{ border: '1px solid rgba(107,31,49,0.2)', color: '#6B1F31', borderRadius: '2px' }}
                                            >−</button>
                                            <span className="font-cinzel text-2xl min-w-[28px] text-center" style={{ color: '#6B1F31' }}>{count}</span>
                                            <button
                                                onClick={() => setCount(count + 1)}
                                                className="w-10 h-10 flex items-center justify-center text-xl transition-all active:scale-90"
                                                style={{ background: 'rgba(107,31,49,0.05)', border: '1px solid rgba(107,31,49,0.3)', color: '#6B1F31', borderRadius: '2px' }}
                                            >+</button>
                                        </div>
                                    </div>
                                </div>

                                {error && <p className="text-red-500 text-sm text-center font-cinzel tracking-wider">{error}</p>}

                                {/* Bottom ornament */}
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(107,31,49,0.3))' }} />
                                    <svg width="4" height="4" viewBox="0 0 4 4" fill="rgba(107,31,49,0.5)" className="rotate-45"><rect width="4" height="4" /></svg>
                                    <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(107,31,49,0.3))' }} />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => handleSubmit(false)}
                                        disabled={loading}
                                        className="py-3 px-4 font-cinzel text-[11px] tracking-[0.2em] uppercase transition-all disabled:opacity-40 active:scale-95"
                                        style={{ border: '1px solid rgba(107,31,49,0.3)', color: 'rgba(107,31,49,0.8)', borderRadius: '2px' }}
                                    >
                                        No podré ir
                                    </button>
                                    <button
                                        onClick={() => handleSubmit(true)}
                                        disabled={loading}
                                        className="py-3 px-4 font-cinzel text-[11px] tracking-[0.2em] uppercase transition-all disabled:opacity-40 active:scale-95"
                                        style={{
                                            background: '#6B1F31',
                                            color: '#FCFBF8',
                                            borderRadius: '2px',
                                            boxShadow: '0 4px 16px rgba(107,31,49,0.2)',
                                        }}
                                    >
                                        {loading ? 'Enviando...' : (invitationId ? 'Actualizar' : '¡Sí, asistiré!')}
                                    </button>
                                </div>
                            </div>
                        ) : step === 'alreadyResponded' ? (
                            <div className="px-8 pb-8 pt-2 text-center space-y-5 relative z-10">
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: 'spring', stiffness: 200 }}
                                    className="w-16 h-16 mx-auto flex items-center justify-center"
                                    style={{ border: '1px solid rgba(107,31,49,0.3)', borderRadius: '2px', background: 'rgba(107,31,49,0.02)' }}
                                >
                                    <Check size={28} style={{ color: '#6B1F31' }} strokeWidth={1.5} />
                                </motion.div>
                                <div>
                                    <h2 className="font-vibes mb-1 text-[#6B1F31]" style={{ fontSize: '2.4rem' }}>
                                        ¡Ya respondiste!
                                    </h2>
                                    <p className="font-playfair text-sm italic" style={{ color: 'rgba(107,31,49,0.7)' }}>
                                        Respuesta guardada como <span style={{ color: '#6B1F31', fontWeight: 600 }}>"{name}"</span>
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    <button onClick={onClose}
                                        className="w-full py-3 font-cinzel text-[11px] tracking-[0.2em] uppercase transition-all active:scale-95"
                                        style={{ background: '#6B1F31', color: '#FCFBF8', borderRadius: '2px' }}>
                                        Cerrar
                                    </button>
                                    <div className="flex gap-2">
                                        <button onClick={() => setStep('form')}
                                            className="flex-1 py-2.5 font-cinzel text-[9px] tracking-[0.15em] uppercase transition-all active:scale-95"
                                            style={{ border: '1px solid rgba(107,31,49,0.2)', color: 'rgba(107,31,49,0.7)', borderRadius: '2px' }}>
                                            Corregir
                                        </button>
                                        <button onClick={handleNewRegistration}
                                            className="flex-1 py-2.5 font-cinzel text-[9px] tracking-[0.15em] uppercase transition-all active:scale-95"
                                            style={{ border: '1px solid rgba(107,31,49,0.2)', color: 'rgba(107,31,49,0.7)', borderRadius: '2px' }}>
                                            Otra persona
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="px-8 pb-8 pt-2 text-center space-y-5 relative z-10">
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: 'spring', stiffness: 200 }}
                                    className="w-16 h-16 mx-auto flex items-center justify-center"
                                    style={{ border: '1px solid rgba(107,31,49,0.3)', borderRadius: '2px', background: 'rgba(107,31,49,0.02)' }}
                                >
                                    <Check size={28} style={{ color: '#6B1F31' }} strokeWidth={1.5} />
                                </motion.div>
                                <div>
                                    <h2 className="font-vibes mb-1 text-[#6B1F31]" style={{ fontSize: '2.8rem' }}>
                                        ¡Genial!
                                    </h2>
                                    <p className="font-playfair italic text-sm" style={{ color: 'rgba(107,31,49,0.7)' }}>
                                        ¡Gracias por confirmar!<br />Te esperamos para celebrar juntos.
                                    </p>
                                </div>
                                <button onClick={onClose}
                                    className="py-3 px-10 font-cinzel text-[11px] tracking-[0.2em] uppercase transition-all active:scale-95"
                                    style={{ background: '#6B1F31', color: '#FCFBF8', borderRadius: '2px' }}>
                                    Cerrar
                                </button>
                            </div>
                        )}

                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
