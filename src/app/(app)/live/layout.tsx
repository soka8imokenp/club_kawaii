import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Efirlar • Kawaii Club",
    description: "Ijodkorlarning jonli efirlari: bepul, klub a'zolari uchun va chipta bilan.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
