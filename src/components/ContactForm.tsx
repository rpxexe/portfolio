"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, Copy, Send } from "lucide-react";
import { RollText } from "@/components/RollText";
import { PROFILE } from "@/data/profile";

const TOPICS = ["Full-time role", "Freelance project", "Collaboration", "Just saying hi"];
const MAX_MESSAGE = 1200;

type Field = "name" | "email" | "message";

function validateField(field: Field, val: string) {
  const v = val.trim();
  if (field === "name") return v.length >= 2 ? undefined : "Enter your name (at least 2 characters).";
  if (field === "email")
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? undefined : "That address looks incomplete. Write it as name@example.com.";
  return v.length >= 12 ? undefined : "Add a brief message (at least 12 characters).";
}

function useIstClock() {
  const [time, setTime] = useState("--:--:--");
  useEffect(() => {
    const tick = () => {
      try {
        setTime(
          new Intl.DateTimeFormat("en-IN", {
            timeZone: "Asia/Kolkata",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          }).format(new Date())
        );
      } catch {
        setTime("IST");
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return time;
}

/** Paper plane looping along a dashed flight path. */
function FlightPath() {
  const path = "M10 120 C 60 20, 140 20, 170 80 S 250 150, 300 40";
  return (
    <svg className="flight" viewBox="0 0 310 150" aria-hidden="true">
      <path d={path} className="flight__trail" />
      <circle cx="10" cy="120" r="4" className="flight__dot" />
      <circle cx="300" cy="40" r="4" className="flight__dot flight__dot--end" />
      <g className="flight__plane">
        <path d="M-9 -7 L11 0 L-9 7 L-5 0 Z" />
        <animateMotion dur="4.2s" repeatCount="indefinite" rotate="auto" path={path} />
      </g>
    </svg>
  );
}

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [status, setStatus] = useState("");
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const time = useIstClock();

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const mailtoHref = () => {
    const subject = encodeURIComponent(`[Portfolio] ${topic}${name ? ` from ${name.trim()}` : ""}`);
    const body = encodeURIComponent(
      `${message.trim() || "Hi Rishabh,"}\n\n${name ? `From: ${name.trim()}\n` : ""}${email ? `Reply-to: ${email.trim()}` : ""}`
    );
    return `mailto:${PROFILE.email}?subject=${subject}&body=${body}`;
  };

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next = {
      name: validateField("name", name),
      email: validateField("email", email),
      message: validateField("message", message),
    };
    setErrors(next);
    const firstBad = (["name", "email", "message"] as Field[]).find((f) => next[f]);
    if (firstBad) {
      ({ name: nameRef, email: emailRef, message: messageRef })[firstBad].current?.focus();
      setSent(false);
      setStatus("Fix the highlighted fields before sending.");
      return;
    }
    // No mail relay on a static site: hand the drafted brief to the visitor's email app
    setSent(true);
    setStatus("Brief drafted. Your email app is opening with everything pre-filled; just hit send.");
    window.setTimeout(() => {
      window.location.href = mailtoHref();
    }, 900);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      window.location.href = `mailto:${PROFILE.email}`;
    }
  }

  const bind = (field: Field, value: string, set: (v: string) => void) => ({
    value,
    "aria-invalid": Boolean(errors[field]),
    "aria-describedby": `contact-${field}-help`,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const v = e.target.value;
      set(v);
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: validateField(field, v) }));
    },
    onBlur: () => value && setErrors((prev) => ({ ...prev, [field]: validateField(field, value) })),
  });

  return (
    <div className="contact">
      <div className="contact__side">
        <div data-reveal className="contact__status" data-anim-zone>
          <FlightPath />
          <div className="contact__status-row">
            <span className="contact__live">
              <span className="hero-eyebrow__dot" aria-hidden="true" /> available
            </span>
            <span className="measured text-muted">Mumbai · IST</span>
          </div>
          <p className="contact__clock measured" aria-label={`Local time in Mumbai: ${time}`}>
            {time}
          </p>
          <p className="text-sm text-ink-2">{PROFILE.availability}</p>
        </div>

        <ul className="contact__channels" data-reveal-stagger>
          <li>
            <button type="button" className="channel" onClick={handleCopy} aria-label={`Copy email address ${PROFILE.email}`}>
              <span className="channel__label measured">email</span>
              <span className="channel__value">
                <RollText text={PROFILE.email} />
              </span>
              <span className="channel__action measured" data-copied={copied}>
                {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
                {copied ? "copied" : "copy"}
              </span>
            </button>
          </li>
          <li>
            <a href={PROFILE.github} target="_blank" rel="noopener noreferrer" className="channel">
              <span className="channel__label measured">github</span>
              <span className="channel__value">
                <RollText text="github.com/rpxexe" />
              </span>
              <ArrowUpRight className="channel__arrow" size={20} strokeWidth={1.5} aria-hidden="true" />
            </a>
          </li>
          <li>
            <a href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer" className="channel">
              <span className="channel__label measured">linkedin</span>
              <span className="channel__value">
                <RollText text="in/rpxexe" />
              </span>
              <ArrowUpRight className="channel__arrow" size={20} strokeWidth={1.5} aria-hidden="true" />
            </a>
          </li>
        </ul>
      </div>

      <form data-reveal className="compose" noValidate onSubmit={handleSubmit} data-sent={sent}>
        <div className="compose__bar">
          <span className="pcard__dots" aria-hidden="true">
            <i /><i /><i />
          </span>
          <span className="measured text-muted">new_message.eml</span>
          <span className="measured text-accent">to: rishabh</span>
        </div>

        <fieldset className="compose__topics">
          <legend className="measured text-muted">What&apos;s this about?</legend>
          <div className="compose__chips">
            {TOPICS.map((t) => (
              <label key={t} className="topic-chip">
                <input type="radio" name="topic" value={t} checked={topic === t} onChange={() => setTopic(t)} />
                <span>
                  <Check size={13} strokeWidth={2} aria-hidden="true" className="topic-chip__check" />
                  {t}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="compose__row">
          <div className="float-field">
            <div className="float-field__control">
              <input
                ref={nameRef}
                id="contact-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                placeholder=" "
                className="float-field__input"
                {...bind("name", name, setName)}
              />
              <label htmlFor="contact-name" className="float-field__label">Your name</label>
              <span className="float-field__line" aria-hidden="true" />
            </div>
            <p id="contact-name-help" className="float-field__error">{errors.name ?? ""}</p>
          </div>

          <div className="float-field">
            <div className="float-field__control">
              <input
                ref={emailRef}
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                required
                placeholder=" "
                className="float-field__input"
                {...bind("email", email, setEmail)}
              />
              <label htmlFor="contact-email" className="float-field__label">Email address</label>
              <span className="float-field__line" aria-hidden="true" />
            </div>
            <p id="contact-email-help" className="float-field__error">{errors.email ?? ""}</p>
          </div>
        </div>

        <div className="float-field">
          <div className="float-field__control">
            <textarea
              ref={messageRef}
              id="contact-message"
              name="message"
              rows={5}
              required
              maxLength={MAX_MESSAGE}
              placeholder=" "
              className="float-field__input float-field__input--area"
              {...bind("message", message, setMessage)}
            />
            <label htmlFor="contact-message" className="float-field__label">Role details, project scope, or timeline</label>
            <span className="float-field__line" aria-hidden="true" />
          </div>
          <div className="float-field__meta">
            <p id="contact-message-help" className="float-field__error">{errors.message ?? ""}</p>
            <span className="measured text-muted">
              {message.length}/{MAX_MESSAGE}
            </span>
          </div>
        </div>

        <div className="compose__actions">
          <button type="submit" className="btn btn--primary send-btn">
            <span className="send-btn__icon" aria-hidden="true">
              <Send size={16} strokeWidth={1.75} className="send-btn__plane" />
              <Check size={16} strokeWidth={2} className="send-btn__check" />
            </span>
            <span>{sent ? "Opening email…" : "Send brief"}</span>
          </button>
          <p className="compose__status text-sm" aria-live="polite">
            {status}
          </p>
        </div>
      </form>
    </div>
  );
}
