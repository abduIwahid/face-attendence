import {
  ArrowRight,
  Camera,
  CheckCircle2,
  ClipboardList,
  FileSpreadsheet,
  Lock,
  MapPin,
  ScanFace,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";
import BrandMark from "../components/BrandMark";
import RotatingWord from "../components/RotatingWord";

/**
 * Landing page (Aurora rebuild, ADR-011) — follows the Aurora landing
 * pattern (library: pages/pages-landing-homepage): top nav → hero with
 * the rotating-word headline → trust strip → how it works → features →
 * showcase cards for the two flows → honest limits → footer. Copy stays
 * factual only — the strip lists the checks the system actually runs,
 * never invented stats or testimonials.
 */

function rise(delayMs: number): CSSProperties {
  return { "--rise-delay": `${delayMs}ms` } as CSSProperties;
}

const PROOF_POINTS = [
  { icon: ScanFace, label: "Face match, verified on the server" },
  { icon: MapPin, label: "GPS radius, judged with the phone's own accuracy" },
  { icon: Lock, label: "One PRESENT per student per day" },
  { icon: ClipboardList, label: "Every attempt logged with its distance" },
];

const STEPS = [
  {
    icon: UserPlus,
    title: "1. Register once",
    body: "A student registers with their name, roll number and one live selfie. The face is stored as a mathematical descriptor — with consent asked before the camera even opens.",
  },
  {
    icon: Camera,
    title: "2. Verify in class",
    body: "To mark attendance, the student takes a live selfie and shares their phone's location. Both are sent to the server — the phone's own claims are never trusted.",
  },
  {
    icon: CheckCircle2,
    title: "3. Present, with proof",
    body: "Attendance is recorded only when the face matches AND the phone is inside the class radius. The log stores the match result and the distance in metres for every attempt.",
  },
];

const FEATURES = [
  {
    icon: ScanFace,
    title: "Face matching",
    body: "A 128-number face descriptor is compared against the registered one, on the server, at a fixed distance threshold. A friend holding your phone cannot mark you present.",
  },
  {
    icon: MapPin,
    title: "GPS radius check",
    body: "The phone samples its GPS for the most accurate fix, and the server judges the distance with the phone's own accuracy in mind — indoor drift does not expel students who are actually in the room.",
  },
  {
    icon: ClipboardList,
    title: "Teacher log + Excel export",
    body: "The teacher sees every attempt for the day — present and failed, with reasons — and downloads the same log as an .xlsx file for records.",
  },
  {
    icon: ShieldCheck,
    title: "Privacy by design",
    body: "Consent before capture, descriptors instead of photo matching, photos in a private bucket, and a real deletion path: one teacher action removes a student's record, photo and history.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Header — Aurora landing nav: mark, links, Log In */}
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <BrandMark />
          <nav aria-label="Sections" className="hidden items-center gap-7 text-sm font-medium text-secondary md:flex">
            <a href="#how-it-works" className="transition-colors hover:text-primary">How it works</a>
            <a href="#features" className="transition-colors hover:text-primary">Features</a>
            <a href="#privacy" className="transition-colors hover:text-primary">Privacy</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="inline-flex min-h-11 items-center justify-center rounded-lg px-3 text-sm font-semibold text-accent-strong transition-colors hover:bg-accent-soft"
            >
              Log in
            </Link>
            <Link
              href="/verify"
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-strong"
            >
              Mark attendance
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero — Aurora: headline with rotating word, sub-copy, two CTAs */}
        <section className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-20">
          <div>
            <p className="animate-rise text-xs font-bold uppercase tracking-widest text-accent-strong" style={rise(0)}>
              Attendance without the proxy
            </p>
            <h1
              className="animate-rise mt-3 font-bold leading-[1.08] text-primary"
              style={{ ...rise(70), fontSize: "clamp(2.3rem, 5.5vw, 3.6rem)" }}
            >
              Attendance that verifies{" "}
              <RotatingWord words={["faces.", "places.", "presence."]} />
            </h1>
            <p className="animate-rise mt-4 max-w-xl text-lg leading-relaxed text-secondary" style={rise(140)}>
              A student marks attendance with a live selfie — and it only
              counts when the face matches their registered photo{" "}
              <strong className="text-primary">and</strong> their phone is
              inside the class radius. One check can be fooled; both together
              are the point.
            </p>
            <div className="animate-rise mt-7 flex flex-wrap gap-3" style={rise(210)}>
              <Link
                href="/verify"
                className="hover-lift inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-accent px-6 text-base font-semibold text-white shadow-md transition-colors hover:bg-accent-strong"
              >
                Mark attendance
                <ArrowRight className="h-5 w-5" aria-hidden />
              </Link>
              <Link
                href="/register"
                className="hover-lift inline-flex min-h-11 items-center justify-center rounded-lg bg-accent-soft px-6 text-base font-semibold text-accent-strong shadow-sm transition-colors hover:bg-field"
              >
                Register your face
              </Link>
            </div>
            <p className="animate-rise mt-4 text-sm text-secondary" style={rise(280)}>
              Students need no account — a roll number and a face are enough.
            </p>
          </div>

          {/* The double check, shown as the product shows it */}
          <div className="animate-rise" style={rise(200)}>
            <div className="hover-lift mx-auto w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-lg">
              <p className="flex items-center gap-2 text-sm font-bold text-primary">
                <ScanFace className="h-5 w-5 text-accent-strong" aria-hidden />
                Attendance check
              </p>
              <ul className="mt-5 flex flex-col gap-4">
                <li className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2.5 text-base text-primary">
                    <ScanFace className="h-5 w-5 text-secondary" aria-hidden />
                    Face match
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-3 py-1 text-sm font-semibold text-success-strong">
                    <CheckCircle2 className="h-4 w-4" aria-hidden />
                    Matched
                  </span>
                </li>
                <li className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2.5 text-base text-primary">
                    <MapPin className="h-5 w-5 text-secondary" aria-hidden />
                    Location
                  </span>
                  <span className="text-sm font-medium text-secondary">
                    23 m away · inside the 100 m radius
                  </span>
                </li>
                <li className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2.5 text-base text-primary">
                    <Lock className="h-5 w-5 text-secondary" aria-hidden />
                    Server re-check
                  </span>
                  <span className="text-sm font-medium text-secondary">
                    Face + distance verified again
                  </span>
                </li>
              </ul>
              <div className="mt-6 rounded-lg bg-success px-4 py-3 text-center text-base font-bold tracking-wide text-white">
                PRESENT
              </div>
              <p className="mt-3 text-center text-xs text-secondary">
                An illustration of a passing check — the real distance is
                measured and stored on every attempt.
              </p>
            </div>
          </div>
        </section>

        {/* Proof strip — Aurora's trust strip, adapted honestly: the
            checks themselves, not other people's logos or numbers. */}
        <section className="border-y border-border bg-surface-muted">
          <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
            <p className="text-center text-xs font-bold uppercase tracking-widest text-secondary">
              Every attempt, checked the same way
            </p>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {PROOF_POINTS.map((point) => (
                <li
                  key={point.label}
                  className="flex items-center justify-center gap-2.5 text-center text-sm font-semibold text-primary"
                >
                  <point.icon className="h-5 w-5 shrink-0 text-accent-strong" aria-hidden />
                  {point.label}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-widest text-accent-strong">How it works</p>
          <h2 className="mt-2 text-2xl font-bold text-primary sm:text-3xl">
            Three steps, under half a minute
          </h2>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-secondary">
            For the student it is three steps — and there is no paper register
            for the teacher.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <article
                key={step.title}
                className="animate-rise hover-lift rounded-xl border border-border bg-surface p-6 shadow-sm"
                style={rise(index * 90)}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent-soft text-accent-strong">
                  <step.icon className="h-6 w-6" aria-hidden />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-primary">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-secondary">{step.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Features — Aurora's "packed with essential abilities" grid */}
        <section id="features" className="border-t border-border bg-surface-muted">
          <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
            <p className="text-xs font-bold uppercase tracking-widest text-accent-strong">Features</p>
            <h2 className="mt-2 text-2xl font-bold text-primary sm:text-3xl">Built to be believed</h2>
            <p className="mt-2 max-w-2xl text-base leading-relaxed text-secondary">
              Every attempt leaves evidence: what matched, how far away the
              phone was, and why an attempt failed when it did.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {FEATURES.map((feature, index) => (
                <article
                  key={feature.title}
                  className="animate-rise hover-lift rounded-xl border border-border bg-surface p-6 shadow-sm"
                  style={rise(index * 90)}
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent-soft text-accent-strong">
                    <feature.icon className="h-6 w-6" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-primary">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-secondary">{feature.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Showcase — Aurora's selected-works cards, one per real flow */}
        <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-widest text-accent-strong">Two sides</p>
          <h2 className="mt-2 text-2xl font-bold text-primary sm:text-3xl">One system, two jobs</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <article className="animate-rise hover-lift flex flex-col rounded-xl border border-border bg-surface p-7 shadow-sm" style={rise(0)}>
              <h3 className="text-xl font-bold text-primary">For students</h3>
              <p className="mt-2 flex-1 text-base leading-relaxed text-secondary">
                Register once, then mark attendance from your own phone in
                seconds. If a check fails, the page tells you why — face not
                matched, too far, or GPS too rough — and lets you retry. A
                failed check is never an accusation.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/verify"
                  className="inline-flex min-h-11 items-center justify-center rounded-lg bg-accent px-5 text-base font-semibold text-white transition-colors hover:bg-accent-strong"
                >
                  Mark attendance
                </Link>
                <Link
                  href="/register"
                  className="inline-flex min-h-11 items-center justify-center rounded-lg bg-accent-soft px-5 text-base font-semibold text-accent-strong transition-colors hover:bg-field"
                >
                  Register your face
                </Link>
              </div>
            </article>
            <article className="animate-rise hover-lift flex flex-col rounded-xl border border-border bg-surface p-7 shadow-sm" style={rise(90)}>
              <h3 className="text-xl font-bold text-primary">For teachers</h3>
              <p className="mt-2 flex-1 text-base leading-relaxed text-secondary">
                Set the class location and radius once, then read the
                day&apos;s log — every attempt with its match result and
                distance — and export it to Excel for your records.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/teacher"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-accent px-5 text-base font-semibold text-white transition-colors hover:bg-accent-strong"
                >
                  <FileSpreadsheet className="h-5 w-5" aria-hidden />
                  Open the teacher dashboard
                </Link>
              </div>
            </article>
          </div>
        </section>

        {/* Honest limits */}
        <section id="privacy" className="border-t border-border bg-surface-muted">
          <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
            <div className="rounded-xl border border-border bg-surface p-7 shadow-sm">
              <h2 className="flex items-center gap-2 text-xl font-bold text-primary">
                <ShieldCheck className="h-6 w-6 text-accent-strong" aria-hidden />
                Honest limits, stated up front
              </h2>
              <ul className="mt-4 grid gap-3 text-sm leading-relaxed text-secondary md:grid-cols-3">
                <li>
                  <strong className="text-primary">No liveness check yet.</strong>{" "}
                  A photo of a face may pass the matcher in this version — the
                  location check is what still has to be satisfied in person.
                </li>
                <li>
                  <strong className="text-primary">GPS is evidence, not proof.</strong>{" "}
                  Phone GPS drifts indoors and can be spoofed with effort; the
                  raw distance and accuracy are stored on every row so a
                  marginal pass can be questioned.
                </li>
                <li>
                  <strong className="text-primary">Your data, deletable.</strong>{" "}
                  Registration asks for consent first, and any student can ask
                  the teacher to delete their record completely — descriptor,
                  photo and history.
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <BrandMark />
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-secondary">
              Attendance that needs the right person in the right place — a
              live face match and a live location check, decided on the
              server.
            </p>
          </div>
          <nav aria-label="Product" className="flex flex-col gap-2.5 text-sm">
            <p className="font-bold text-primary">Product</p>
            <Link href="/register" className="text-secondary transition-colors hover:text-primary">Register</Link>
            <Link href="/verify" className="text-secondary transition-colors hover:text-primary">Mark attendance</Link>
            <Link href="/teacher" className="text-secondary transition-colors hover:text-primary">Teacher dashboard</Link>
          </nav>
          <nav aria-label="About" className="flex flex-col gap-2.5 text-sm">
            <p className="font-bold text-primary">About</p>
            <a href="#how-it-works" className="text-secondary transition-colors hover:text-primary">How it works</a>
            <a href="#features" className="text-secondary transition-colors hover:text-primary">Features</a>
            <a href="#privacy" className="text-secondary transition-colors hover:text-primary">Privacy &amp; limits</a>
          </nav>
        </div>
        <div className="border-t border-border">
          <p className="mx-auto w-full max-w-6xl px-4 py-4 text-xs text-secondary sm:px-6">
            Face Attendance System — face + location verified attendance.
          </p>
        </div>
      </footer>
    </div>
  );
}
