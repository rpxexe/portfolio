"use client";

import { useRef, useState } from "react";
import { Check, Copy, Mail } from "lucide-react";
import { PROFILE } from "@/data/profile";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("Full-time engineering role");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [statusMessage, setStatusMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  function validateField(field: "name" | "email" | "message", val: string) {
    const trimmed = val.trim();
    if (field === "name") {
      return trimmed.length >= 2 ? undefined : "Enter your name (at least 2 characters).";
    }
    if (field === "email") {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
        ? undefined
        : "That address looks incomplete. Write it as name@example.com.";
    }
    return trimmed.length >= 12 ? undefined : "Add a brief message (at least 12 characters).";
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const nextErrors = {
      name: validateField("name", name),
      email: validateField("email", email),
      message: validateField("message", message),
    };
    setErrors(nextErrors);

    if (nextErrors.name) {
      nameRef.current?.focus();
      setStatusMessage("Fix the highlighted fields before continuing.");
      return;
    }
    if (nextErrors.email) {
      emailRef.current?.focus();
      setStatusMessage("Fix the highlighted fields before continuing.");
      return;
    }
    if (nextErrors.message) {
      messageRef.current?.focus();
      setStatusMessage("Fix the highlighted fields before continuing.");
      return;
    }

    setStatusMessage(
      `Nothing was sent automatically: this static portfolio has no mail relay configured yet. Use "Open in email client" below or copy ${PROFILE.email}.`
    );
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      window.location.href = `mailto:${PROFILE.email}`;
    }
  }

  const mailtoSubject = encodeURIComponent(`[Portfolio] ${topic}${name ? ` from ${name.trim()}` : ""}`);
  const mailtoBody = encodeURIComponent(
    `${message.trim() || "Hi Rishabh,"}\n\n${name ? `From: ${name.trim()}\n` : ""}${email ? `Reply-to: ${email.trim()}` : ""}`
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
      <form
        className="lg:col-span-7 panel p-6 sm:p-8 flex flex-col gap-5"
        data-endpoint=""
        noValidate
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="contact-name" className="text-sm font-medium text-ink">
            Name <span className="text-muted">(required)</span>
          </label>
          <input
            ref={nameRef}
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            aria-required="true"
            aria-invalid={Boolean(errors.name)}
            aria-describedby="contact-name-help"
            placeholder="Your name"
            className="field-input"
            value={name}
            onChange={(e) => {
              const v = e.target.value;
              setName(v);
              if (errors.name) setErrors((prev) => ({ ...prev, name: validateField("name", v) }));
            }}
            onBlur={() => setErrors((prev) => ({ ...prev, name: validateField("name", name) }))}
          />
          <p id="contact-name-help" className="text-xs min-h-[1lh] text-error">
            {errors.name ?? ""}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="contact-email" className="text-sm font-medium text-ink">
            Email address <span className="text-muted">(required)</span>
          </label>
          <input
            ref={emailRef}
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            aria-required="true"
            aria-invalid={Boolean(errors.email)}
            aria-describedby="contact-email-help"
            placeholder="name@example.com"
            className="field-input"
            value={email}
            onChange={(e) => {
              const v = e.target.value;
              setEmail(v);
              if (errors.email) setErrors((prev) => ({ ...prev, email: validateField("email", v) }));
            }}
            onBlur={() => setErrors((prev) => ({ ...prev, email: validateField("email", email) }))}
          />
          <p id="contact-email-help" className="text-xs min-h-[1lh] text-error">
            {errors.email ?? ""}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="contact-topic" className="text-sm font-medium text-ink">
            Inquiry type
          </label>
          <select
            id="contact-topic"
            name="topic"
            className="field-input"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          >
            <option value="Full-time engineering role">Full-time engineering role</option>
            <option value="Freelance systems or SaaS project">Freelance systems or SaaS project</option>
            <option value="Technical collaboration">Technical collaboration</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="contact-message" className="text-sm font-medium text-ink">
            Message <span className="text-muted">(required)</span>
          </label>
          <textarea
            ref={messageRef}
            id="contact-message"
            name="message"
            rows={4}
            required
            aria-required="true"
            aria-invalid={Boolean(errors.message)}
            aria-describedby="contact-message-help"
            placeholder="Role details, project scope, or timeline"
            className="field-input min-h-[7rem] resize-y"
            value={message}
            onChange={(e) => {
              const v = e.target.value;
              setMessage(v);
              if (errors.message) setErrors((prev) => ({ ...prev, message: validateField("message", v) }));
            }}
            onBlur={() => setErrors((prev) => ({ ...prev, message: validateField("message", message) }))}
          />
          <p id="contact-message-help" className="text-xs min-h-[1lh] text-error">
            {errors.message ?? ""}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button type="submit" className="btn btn--primary">
            Validate brief
          </button>
          <a
            href={`mailto:${PROFILE.email}?subject=${mailtoSubject}&body=${mailtoBody}`}
            className="btn"
          >
            <Mail size={16} strokeWidth={1.75} aria-hidden="true" />
            <span>Open in email client</span>
          </a>
        </div>

        <p className="text-sm text-ink-2 min-h-[1lh]" aria-live="polite">
          {statusMessage}
        </p>
      </form>

      <aside className="lg:col-span-5 panel p-6 sm:p-8 flex flex-col gap-6">
        <div>
          <h2 style={{ fontSize: "var(--text-xl)" }}>Direct channels</h2>
          <p className="text-sm text-ink-2 mt-2">{PROFILE.availability}</p>
        </div>

        <dl className="grid gap-4 pt-4 border-t border-rule text-sm">
          <div className="grid gap-1">
            <dt className="text-muted">Email</dt>
            <dd className="flex flex-wrap items-center gap-3">
              <a href={`mailto:${PROFILE.email}`} className="text-link font-medium">
                {PROFILE.email}
              </a>
              <button type="button" onClick={handleCopy} className="btn btn--compact">
                {copied ? <Check size={14} strokeWidth={1.75} aria-hidden="true" /> : <Copy size={14} strokeWidth={1.75} aria-hidden="true" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </dd>
          </div>

          <div className="grid gap-1">
            <dt className="text-muted">GitHub</dt>
            <dd>
              <a href={PROFILE.github} target="_blank" rel="noopener noreferrer" className="text-link">
                github.com/rpxexe
              </a>
            </dd>
          </div>

          <div className="grid gap-1">
            <dt className="text-muted">LinkedIn</dt>
            <dd>
              <a href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer" className="text-link">
                linkedin.com/in/rpxexe
              </a>
            </dd>
          </div>

          <div className="grid gap-1">
            <dt className="text-muted">Location</dt>
            <dd className="text-ink-2">{PROFILE.location}</dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}

