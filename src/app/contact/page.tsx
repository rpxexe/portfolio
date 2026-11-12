import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { PROFILE } from "@/data/profile";

export const metadata: Metadata = {
  title: `Contact: ${PROFILE.name}`,
  description:
    "Contact Rishabh Vishwakarma for full-time software engineering opportunities or future freelance projects.",
};

export default function ContactPage() {
  return (
    <section className="band-section--tight" aria-labelledby="contact-heading">
      <div className="container flex flex-col gap-10">
        <div className="flex flex-col gap-4 max-w-3xl">
          <h1 id="contact-heading">Get in touch</h1>
          <p className="lead text-ink-2">
            Reach out for full-stack, AI orchestration, or systems engineering roles.
          </p>
        </div>

        <ContactForm />
      </div>
    </section>
  );
}
