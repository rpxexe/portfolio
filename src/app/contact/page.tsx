import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { SectionHeading } from "@/components/SectionHeading";
import { PROFILE } from "@/data/profile";

export const metadata: Metadata = {
  title: `Contact: ${PROFILE.name}`,
  description:
    "Contact Rishabh Vishwakarma for full-time software engineering opportunities or future freelance projects.",
};

export default function ContactPage() {
  return (
    <section className="band-section--tight" aria-labelledby="contact-heading">
      <div className="container flex flex-col gap-12">
        <div className="contact-head">
          <SectionHeading as="h1" index="@" kicker="contact" title="Start a *conversation*" id="contact-heading" />
          <p data-reveal className="lead text-ink-2">
            Hiring for a full-stack, AI orchestration, or systems role? Have a build in mind? Send a brief and it lands
            straight in my inbox.
          </p>
        </div>

        <ContactForm />
      </div>
    </section>
  );
}
