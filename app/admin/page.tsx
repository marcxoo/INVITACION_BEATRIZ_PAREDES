'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLanding() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/admin/beatriz-paredes');
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center"
            style={{ background: '#000' }}>
            <div className="w-2 h-2 rounded-full" style={{ background: '#C5A059' }} />
        </div>
    );
}
