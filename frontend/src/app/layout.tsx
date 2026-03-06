import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/ui/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "LifeOS — Personal Dashboard",
    description: "Your life, quantified and visualized.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <link
                    rel="stylesheet"
                    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                    integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
                    crossOrigin=""
                />
            </head>
            <body className={`${inter.className} bg-slate-100 text-slate-900 antialiased`}>
                <div className="flex h-screen overflow-hidden p-3">
                    <Sidebar />
                    <div className="flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <main className="h-full overflow-y-auto p-6 lg:p-8">
                            {children}
                        </main>
                    </div>
                </div>
            </body>
        </html>
    );
}
