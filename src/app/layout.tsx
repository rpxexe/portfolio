import type { Metadata } from "next";
import { Rethink_Sans, EB_Garamond, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";
import { PhysicsField } from "@/components/PhysicsField";
import { PageLoader } from "@/components/PageLoader";
import { ScrollProgressSpine } from "@/components/ScrollProgressSpine";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PROFILE } from "@/data/profile";

const rethinkSans = Rethink_Sans({
  variable: "--font-rethink",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const ebGaramond = EB_Garamond({
  variable: "--font-garamond",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["italic"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: `${PROFILE.name}: ${PROFILE.role}`,
  description:
    "Engineering portfolio of Rishabh Vishwakarma: TypeScript full-stack SaaS, visual AI DAG orchestration, and native Electron and Win32 systems.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${rethinkSans.variable} ${ebGaramond.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a className="skip" href="#main">
          Skip to content
        </a>
        <SmoothScrollProvider>
          <PhysicsField />
          <PageLoader />
          <ScrollProgressSpine />
          <div className="app-shell">
            <Navbar />
            <main id="main" className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
