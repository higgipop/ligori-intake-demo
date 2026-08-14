import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

export const metadata: Metadata = {
  title: "Personal Injury Case Evaluation",
  description: "Tell us about your situation and find out if you may have a case.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col" style={{ background: "var(--mist)" }}>
        <header className="py-5 px-6" style={{ background: "var(--charcoal)", borderBottom: "3px solid var(--crimson)" }}>
          <div className="max-w-2xl mx-auto">
            <p className="text-white font-bold text-lg tracking-wide">Case Evaluation</p>
            <p className="text-xs tracking-widest uppercase" style={{ color: "var(--gold)" }}>Personal Injury Intake</p>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="py-6 px-6 text-center text-xs text-gray-400" style={{ borderTop: "1px solid #e2e2e8" }}>
          <p>This form does not constitute legal advice or create an attorney-client relationship.</p>
          <p className="mt-1">© {new Date().getFullYear()} · All Rights Reserved</p>
        </footer>
      </body>
      <GoogleAnalytics gaId="G-6GSZ0QPM8L" />
    </html>
  );
}
