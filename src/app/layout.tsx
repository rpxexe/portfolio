import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";
import { PhysicsField } from "@/components/PhysicsField";
import { PageLoader } from "@/components/PageLoader";
import { ScrollProgressSpine } from "@/components/ScrollProgressSpine";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SiteMotion } from "@/components/SiteMotion";
import { PROFILE } from "@/data/profile";

// Display: characterful variable grotesk with optical sizing for big headlines
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
  display: "swap",
});

// Body: neutral, highly legible text face
const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

// Accent: editorial italic serif for emphasis words
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const LITE_SCRIPT = `(function(){try{var m=function(q){return window.matchMedia(q).matches};var n=navigator;var lite=m("(max-width: 60rem)")||m("(pointer: coarse)")||(n.hardwareConcurrency||8)<=4||(n.deviceMemory||8)<=4||!!(n.connection&&n.connection.saveData);if(lite)document.documentElement.setAttribute("data-lite","true")}catch(e){}})();`;

export const metadata: Metadata = {
  title: `${PROFILE.name}: ${PROFILE.role}`,
  description:
    "Engineering portfolio of Rishabh Vishwakarma: TypeScript full-stack SaaS, visual AI DAG orchestration, and native Electron and Win32 systems.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${bricolage.variable} ${geist.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        {/* Decide "lite" motion before first paint: phones, tablets, touch, low-power or data-saver devices */}
        <script dangerouslySetInnerHTML={{ __html: LITE_SCRIPT }} />
      </head>
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
          <SiteMotion />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
