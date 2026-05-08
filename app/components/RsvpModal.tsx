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
                .from('invitations')
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
                event_slug: eventSlug
            };

            if (invitationId) {
                // UPDATE Workaround: 
                // Since RLS policies often block UPDATE but allow INSERT/DELETE for anon users,
                // we delete the old record and create a new one to simulate an update.
                const { error: deleteError } = await supabase
                    .from('invitations')
                    .delete()
                    .eq('id', invitationId);

                if (deleteError) {
                    console.warn('Error deleting old invitation:', deleteError);
                }
            }

            // Always Insert New Record
            const { data, error: insertError } = await supabase
                .from('invitations')
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
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="bg-paper border-2 border-gold rounded-[30px] w-full max-w-md p-8 relative shadow-2xl overflow-hidden font-playfair"
                    >
                        {/* POLKA DOT OVERLAY REMOVED */}

                        {/* CLOSE BUTTON */}
                        <button
                            onClick={onClose}
                            className="absolute top-5 right-5 text-plum hover:scale-110 transition-transform z-20"
                        >
                            <X size={28} strokeWidth={3} />
                        </button>

                        {step === 'form' ? (
                            <div className="space-y-6 relative z-10">
                                <div className="text-center">
                                    <h2 className="text-plum text-5xl font-bold mb-2 font-vibes">¡Celebremos a Rosita!</h2>
                                    <p className="text-plum opacity-90 text-lg">Acompáñanos a festejar este día especial.</p>
                                </div>

                                <div className="space-y-5">
                                    {/* NAME INPUT */}
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-plum font-semibold text-lg">
                                            <User size={20} className="text-gold" />
                                            Nombre o Familia
                                        </label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Ej. Familia Pérez"
                                            className="w-full p-4 border-2 border-baby-pink rounded-2xl focus:border-plum outline-none bg-white text-plum text-lg font-medium transition-all"
                                        />
                                    </div>

                                    {/* COUNT INPUT */}
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-plum font-semibold text-lg">
                                            <Users size={20} className="text-gold" />
                                            ¿Cuántos vendrán?
                                        </label>
                                        <div className="flex items-center gap-6 bg-white p-2 rounded-2xl w-fit border-2 border-baby-pink">
                                            <button
                                                onClick={() => setCount(Math.max(1, count - 1))}
                                                className="w-12 h-12 rounded-xl bg-paper text-plum shadow-sm hover:shadow-md active:scale-95 transition-all text-2xl font-bold flex items-center justify-center border border-baby-pink"
                                            >
                                                -
                                            </button>
                                            <span className="text-3xl font-bold text-plum min-w-[30px] text-center font-vibes">{count}</span>
                                            <button
                                                onClick={() => setCount(Math.max(1, count + 1))}
                                                className="w-12 h-12 rounded-xl bg-plum text-white shadow-sm hover:shadow-md active:scale-95 transition-all text-2xl font-bold flex items-center justify-center"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {error && <p className="text-red-500 font-medium text-center bg-red-50 p-2 rounded-lg">{error}</p>}

                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    <button
                                        onClick={() => handleSubmit(false)}
                                        disabled={loading}
                                        className="py-4 px-4 bg-white text-plum border-2 border-plum/20 rounded-2xl hover:bg-gray-50 font-bold transition-all disabled:opacity-50 text-base"
                                    >
                                        No podré ir
                                    </button>
                                    <button
                                        onClick={() => handleSubmit(true)}
                                        disabled={loading}
                                        className="py-4 px-4 bg-plum text-white rounded-2xl shadow-lg active:shadow-none active:translate-y-[2px] font-bold transition-all disabled:opacity-50 text-base"
                                    >
                                        {loading ? 'Enviando...' : (invitationId ? 'Actualizar' : '¡Sí, asistiré!')}
                                    </button>
                                </div>
                            </div>
                        ) : step === 'alreadyResponded' ? (
                            <div className="text-center py-6 space-y-6 relative z-10">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-24 h-24 bg-white text-gold rounded-full flex items-center justify-center mx-auto shadow-xl border-4 border-gold/20"
                                >
                                    <Check size={50} strokeWidth={3} />
                                </motion.div>
                                <div className="space-y-2">
                                    <h2 className="text-plum text-4xl font-bold font-vibes">¡Ya respondiste!</h2>
                                    <p className="text-plum text-lg font-medium">
                                        Hemos guardado tu respuesta como <br />
                                        <span className="font-bold text-plum">"{name}"</span>
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    <button
                                        onClick={onClose}
                                        className="w-full py-3 px-6 bg-plum text-white rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg"
                                    >
                                        Entendido, Cerrar
                                    </button>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setStep('form')}
                                            className="flex-1 py-3 px-2 bg-transparent text-plum border-2 border-plum/30 rounded-2xl font-bold hover:bg-plum/5 transition-all text-sm"
                                        >
                                            Corregir mi respuesta
                                        </button>
                                        <button
                                            onClick={handleNewRegistration}
                                            className="flex-1 py-3 px-2 bg-transparent text-plum border-2 border-plum/30 rounded-2xl font-bold hover:bg-plum/5 transition-all text-sm"
                                        >
                                            Registrar a otra persona
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-6 space-y-6 relative z-10">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-24 h-24 bg-white text-gold rounded-full flex items-center justify-center mx-auto shadow-xl border-4 border-gold/20"
                                >
                                    <Check size={50} strokeWidth={3} />
                                </motion.div>
                                <div className="space-y-2">
                                    <h2 className="text-plum text-5xl font-bold font-vibes">¡Genial!</h2>
                                    <p className="text-plum text-xl font-medium">
                                        ¡Gracias por confirmar!<br />
                                        Te esperamos para celebrar juntos.
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="py-3 px-10 bg-plum text-white rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg"
                                >
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
