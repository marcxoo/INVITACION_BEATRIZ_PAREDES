'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLanding() {
    const router = useRouter();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const hostname = window.location.hostname;

            // If domain has 'arelys', auto-redirect to Arelys Admin
            if (hostname.includes('arelys')) {
                router.replace('/admin/arelys');
                return;
            }

            // If domain has 'rosita' or 'rosita-maria', auto-redirect to Rosita Admin
            // (Only if not localhost to avoid confusion during dev)
            if (hostname.includes('rosita')) {
                router.replace('/admin/rosita-maria');
                return;
            }

            // If neither (e.g. localhost or generic), stay here to choose
            setChecking(false);
        }
    }, [router]);

    if (checking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
                <div className="animate-pulse text-[#7A2D3E] font-vibes text-2xl">Verificando sitio...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF7] p-6 space-y-8">
            <h1 className="text-4xl text-[#7A2D3E] font-bold font-vibes">Selecciona el Panel de Admin</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                <Link href="/admin/rosita-maria"
                    className="block p-8 bg-white border-2 border-[#D4AF37] rounded-2xl text-center hover:scale-105 transition-transform shadow-lg cursor-pointer">
                    <h2 className="text-2xl font-bold text-[#7A2D3E] mb-2">Rosita María</h2>
                    <span className="text-gray-400 text-sm">Ver Asistencia</span>
                </Link>

                <Link href="/admin/arelys"
                    className="block p-8 bg-white border-2 border-[#D4AF37] rounded-2xl text-center hover:scale-105 transition-transform shadow-lg cursor-pointer">
                    <h2 className="text-2xl font-bold text-[#7A2D3E] mb-2">Arelys</h2>
                    <span className="text-gray-400 text-sm">Ver Asistencia</span>
                </Link>
            </div>
        </div>
    );
}
