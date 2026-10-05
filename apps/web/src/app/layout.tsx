import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";

const fontSans = Inter({
    subsets: ["latin"],
    variable: "--font-sans",
    display: "swap",
});

export const metadata = {
    title: "ChatPilot — WhatsApp CRM",
    description: "Manage WhatsApp conversations, broadcasts, flows, and customers.",
};

import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body
                className={cn(
                    "min-h-screen bg-slate-50 font-sans antialiased text-zinc-900",
                    fontSans.variable
                )}
                suppressHydrationWarning
            >
                <AuthProvider>{children}</AuthProvider>
                <Toaster richColors position="top-center" />
            </body>
        </html>
    );
}
