import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

import Script from 'next/script'

export const metadata: Metadata = {
    title: 'ChatPilot - Automate Your Growth',
    description: 'The fastest way to automate your growth with WhatsApp broadcasting, AI chatbots, and CRM automation.',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning style={{ scrollBehavior: 'smooth' }}>
            <body className={inter.className}>
                {children}
                <Script
                    src={process.env.NEXT_PUBLIC_WIDGET_SCRIPT_URL ?? 'http://localhost:4000/widget.js'}
                    data-id={process.env.NEXT_PUBLIC_WIDGET_AGENT_ID ?? 'gCBbRZqv1GSkH0cJ3Yjh8Pt0dLz2'}
                    data-chatbot="true"
                    strategy="lazyOnload"
                />
            </body>
        </html>
    )
}
