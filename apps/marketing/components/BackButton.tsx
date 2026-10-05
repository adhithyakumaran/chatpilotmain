"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const BackButton = () => {
    return (
        <Link href="/" className="fixed top-6 left-6 z-[60] p-3 bg-white/80 backdrop-blur-md border border-zinc-200 rounded-full shadow-lg hover:bg-white hover:scale-105 transition-all group" aria-label="Back to Home">
            <ArrowLeft size={20} className="text-zinc-600 group-hover:text-black" />
        </Link>
    );
};

export default BackButton;
