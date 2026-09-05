import { Navbar } from "@/components/layout/navbar";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Memory } from "@/components/landing/memory";
import { HumanAI } from "@/components/landing/human-ai";
import { CTA } from "@/components/landing/cta";
import { Footer } from "@/components/layout/footer";
import type { Metadata } from "next";
import { Marquee } from "@/components/landing/marquee";
import { Comparison } from "@/components/landing/comparison";
import { SocialProof } from "@/components/landing/social-proof";
import { WhyAisitey } from "@/components/landing/why-aisitey";
import { Newsletter } from "@/components/landing/newsletter";
import { VideoSection } from "@/components/landing/video-section";
import { Skills } from "@/components/landing/skills";

export const metadata: Metadata = {
  title: "Build with Context, Not Chaos",
  description:
    "aisitey helps you turn ideas into real products with AI that understands your project context, architecture, and decisions.",
};

export default async function Home() {

  return (
    <main className="flex min-h-screen flex-col bg-base">
      <Navbar />
      <div className="flex-1">
        <section id="hero">
          <Hero />
        </section>

        {/* الشريط المتحرك */}
        <Marquee />


        <SocialProof />

        <section id="how-it-works">
          <HowItWorks />
        </section>

        <VideoSection />
        
        <section id="comparison">
          <Comparison />
        </section>

        <Skills />

        <section id="memory">
          <Memory />
        </section>

        <section id="human-ai">
          <HumanAI />
        </section>

        <WhyAisitey />

        <Newsletter />

        <section id="start">
          <CTA />
        </section>
      </div>
      <Footer />
    </main>
  );
}