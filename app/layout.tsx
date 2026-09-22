import type { Metadata } from "next";
import Image from "next/image";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

export const metadata: Metadata = {
  title: "Case Evaluation | Ligori Law",
  description: "Tell us about your situation and find out if you may have a case.",
  /* NOINDEX — this is a demo built to close Ligori Law, not a live intake.
   *
   * Two reasons it must stay out of the index until they are a client and the
   * page carries proper attribution. First, an indexable page soliciting
   * personal-injury clients that names no lawyer or firm is the shape Florida
   * Bar Rule 4-7 governs, and that exposure would be the firm's as much as
   * ULTRA's. Second, nothing about ranking helps close a deal that is being
   * demonstrated over a screen share.
   *
   * The 404 page already carried noindex while the homepage did not, which was
   * exactly backwards. */
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col" style={{ background: "var(--mist)" }}>
        <header className="py-5 px-6" style={{ background: "var(--charcoal)", borderBottom: "3px solid var(--crimson)" }}>
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <Image src="/pen-shield-logo.svg" alt="" width={44} height={44} priority />
            <div>
              {/* Their name, not a generic label. The entire job of this demo is
                  to let them picture it as their own intake, and seeing the
                  firm in the header does more of that than any feature does.
                  Verify the exact legal name (P.A. / PLLC) before showing it —
                  the CRM holds only "Ligori Law". */}
              <p className="text-white font-bold text-lg tracking-wide">Ligori Law</p>
              <p className="text-xs tracking-widest uppercase" style={{ color: "var(--gold)" }}>Personal Injury &amp; Wrongful Death Intake</p>
            </div>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="py-6 px-6 text-center text-xs text-gray-400" style={{ borderTop: "1px solid #e2e2e8" }}>
          <p>This form does not constitute legal advice or create an attorney-client relationship.</p>
          <p className="mt-1">© {new Date().getFullYear()} Ligori Law · All Rights Reserved</p>
          {/* Demo build for Ligori Law by ULTRA Design Agency. Remove this line
              only when the page becomes a real, attributed intake. */}
          <p className="mt-1">Demonstration build · ULTRA Design Agency</p>
        </footer>
      </body>
      <GoogleAnalytics gaId="G-6GSZ0QPM8L" />
    </html>
  );
}
