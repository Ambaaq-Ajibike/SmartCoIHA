import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Fingerprint,
  Globe,
  LockKeyhole,
  Network,
  ShieldCheck,
  Stethoscope,
  UserRound,
  Zap,
} from "lucide-react";
import SectionContainer from "@/components/home/SectionContainer";
import SectionHeader from "@/components/home/SectionHeader";

// ─── Data ─────────────────────────────────────────────────────────────────────

const problemItems = [
  { number: "01", text: "Patient data is fragmented across multiple hospitals" },
  { number: "02", text: "Doctors cannot easily access patient history" },
  { number: "03", text: "Repeated tests and delayed treatment occur" },
  { number: "04", text: "Patients lack control over their medical data" },
];

const solutionItems = [
  {
    title: "License Verification",
    text: "Institutions register and verify their healthcare license before joining the network.",
  },
  {
    title: "FHIR Endpoint Submission",
    text: "Institutions submit their FHIR API endpoints for validation.",
  },
  {
    title: "Endpoint Validation",
    text: "SmartCoIHA validates endpoint health and all supported resource types automatically.",
  },
  {
    title: "Federated Storage",
    text: "Patient records remain stored at the institution — data is never centralized.",
  },
  {
    title: "Biometric Consent Gate",
    text: "Every data request requires explicit patient biometric consent via fingerprint.",
  },
];

const workSteps = [
  "Institution registers and verifies its registration number",
  "Institution submits its FHIR base URL",
  "SmartCoIHA validates the endpoint and supported resources",
  "Patient records become discoverable across the network",
  "A provider requests patient data",
  "Patient verifies request using fingerprint",
  "SmartCoIHA securely retrieves the requested FHIR resource",
];

const keyFeatures = [
  {
    title: "FHIR-Based Interoperability",
    description: "Supports HL7 FHIR for standardized health data exchange across institutions.",
    icon: Network,
    accent: false,
  },
  {
    title: "Patient Biometric Consent",
    description: "Fingerprint authentication ensures patients approve every data access request.",
    icon: Fingerprint,
    accent: true,
  },
  {
    title: "Federated Architecture",
    description: "Patient data remains in institutional systems, reducing central exposure risks.",
    icon: Building2,
    accent: false,
  },
  {
    title: "Secure API Requests",
    description: "Every request is authenticated, authorized, encrypted, and audited.",
    icon: LockKeyhole,
    accent: true,
  },
  {
    title: "Institution Verification",
    description: "Healthcare institutions verify registration before joining the ecosystem.",
    icon: ShieldCheck,
    accent: false,
  },
];

const audienceData = [
  {
    title: "Healthcare Institutions",
    points: ["Hospitals", "Clinics", "Diagnostic labs"],
    icon: Building2,
    gradient: "from-emerald-600 to-teal-500",
    iconBg: "bg-emerald-100",
    iconColor: "text-primary",
    id: undefined as string | undefined,
  },
  {
    title: "Healthcare Providers",
    points: ["Doctors", "Specialists", "Emergency responders"],
    icon: Stethoscope,
    gradient: "from-blue-600 to-sky-500",
    iconBg: "bg-blue-100",
    iconColor: "text-accent",
    id: undefined as string | undefined,
  },
  {
    title: "Patients",
    points: ["Full control over medical record access", "Secure biometric verification"],
    icon: UserRound,
    gradient: "from-violet-600 to-purple-500",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    id: "for-patients",
  },
];

const protections = [
  { label: "Patient-controlled consent", icon: UserRound },
  { label: "Biometric authentication", icon: Fingerprint },
  { label: "Secure FHIR API communication", icon: Globe },
  { label: "Encrypted data transfer", icon: LockKeyhole },
  { label: "Comprehensive audit logs", icon: Activity },
];

const archNodes = [
  { label: "Healthcare Institution Systems", variant: "default" },
  { label: "FHIR APIs", variant: "default" },
  { label: "SmartCoIHA Interoperability Layer", variant: "highlight" },
  { label: "Consent Verification", variant: "blue" },
  { label: "Secure Data Retrieval", variant: "default" },
] as const;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PublicHomePage() {
  return (
    <>
      {/* ── Hero ── */}
      <SectionContainer
        id="home"
        className="relative overflow-hidden bg-ink pb-24 pt-12 text-white sm:pt-20"
      >
        {/* Ambient glow orbs */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-secondary/20 blur-[120px]" />
          <div className="absolute -right-40 bottom-0 h-[400px] w-[400px] rounded-full bg-accent/15 blur-[100px]" />
        </div>

        <div className="grid items-center gap-14 lg:grid-cols-[1fr_460px]">
          {/* Left – Copy */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-secondary" />
              FHIR + Biometric Consent
            </span>
            <h1 className="font-display mt-6 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Secure Healthcare Data Exchange{" "}
              <span className="bg-linear-to-r from-secondary to-teal-300 bg-clip-text text-transparent">
                with Patient-Controlled Consent
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
              SmartCoIHA enables healthcare institutions to securely exchange patient medical
              records using the FHIR interoperability standard while ensuring privacy through
              biometric patient consent verification.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#for-institutions"
                className="inline-flex items-center gap-2 rounded-full bg-secondary px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-secondary/30 transition hover:bg-emerald-400"
              >
                Register Your Institution
                <ArrowRight size={16} />
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                Learn How It Works
              </a>
            </div>
            {/* Stats strip */}
            <div className="mt-10 flex flex-wrap gap-8 border-t border-white/10 pt-8">
              {[
                { value: "FHIR R4", label: "Interoperability Standard" },
                { value: "Federated", label: "Data Architecture" },
                { value: "Biometric", label: "Patient Consent" },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="text-lg font-semibold text-white">{value}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right – Live network visualization card */}
          <aside className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl">
            {/* Card header */}
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity size={13} className="text-secondary" />
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-300">
                  Live Network
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/20 px-2.5 py-1 text-xs font-medium text-secondary">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-secondary" />
                Active
              </span>
            </div>

            {/* Institution A */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-900/30 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20">
                    <Building2 size={16} className="text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">City General Hospital</p>
                    <p className="text-xs text-slate-400">FHIR R4 · 12 resource types</p>
                  </div>
                </div>
                <span className="flex shrink-0 items-center gap-1 rounded-full bg-secondary/20 px-2 py-0.5 text-xs text-secondary">
                  <BadgeCheck size={10} /> Verified
                </span>
              </div>
            </div>

            {/* Connector A → Hub */}
            <div className="my-2.5 flex flex-col items-center gap-1">
              <div className="h-4 w-px border-l border-dashed border-white/20" />
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-0.5 text-xs text-slate-400">
                Secure Channel · TLS 1.3
              </span>
              <div className="h-4 w-px border-l border-dashed border-white/20" />
            </div>

            {/* SmartCoIHA Hub */}
            <div className="rounded-2xl border border-accent/30 bg-blue-900/30 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/20">
                  <ShieldCheck size={16} className="text-accent" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">SmartCoIHA Hub</p>
                  <p className="text-xs text-slate-400">Consent + Request Orchestration</p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    <span className="flex items-center gap-1 rounded-full bg-secondary/20 px-2 py-0.5 text-xs text-secondary">
                      <Fingerprint size={10} /> Biometric ✓
                    </span>
                    <span className="flex items-center gap-1 rounded-full bg-secondary/20 px-2 py-0.5 text-xs text-secondary">
                      <LockKeyhole size={10} /> Consent ✓
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Connector Hub → B */}
            <div className="my-2.5 flex flex-col items-center gap-1">
              <div className="h-4 w-px border-l border-dashed border-white/20" />
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-0.5 text-xs text-slate-400">
                Authorized FHIR Request
              </span>
              <div className="h-4 w-px border-l border-dashed border-white/20" />
            </div>

            {/* Institution B */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-900/30 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20">
                    <Building2 size={16} className="text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Metro Specialist Clinic</p>
                    <p className="text-xs text-slate-400">Resource delivered securely</p>
                  </div>
                </div>
                <span className="flex shrink-0 items-center gap-1 rounded-full bg-secondary/20 px-2 py-0.5 text-xs text-secondary">
                  <BadgeCheck size={10} /> Received
                </span>
              </div>
            </div>
          </aside>
        </div>
      </SectionContainer>

      {/* ── Problem ── */}
      <SectionContainer id="problem" className="bg-white">
        <SectionHeader
          eyebrow="The Problem"
          title="Healthcare data is siloed, slow, and hard to trust"
          description="Current clinical workflows break when records are scattered across disconnected systems."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {problemItems.map(({ number, text }) => (
            <article
              key={number}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
            >
              <span className="pointer-events-none absolute -right-2 -top-3 select-none text-8xl font-black text-slate-100 transition group-hover:text-emerald-50">
                {number}
              </span>
              <p className="relative text-sm leading-7 text-slate-700">{text}</p>
            </article>
          ))}
        </div>
      </SectionContainer>

      {/* ── Solution ── */}
      <SectionContainer id="solution" className="bg-emerald-50/60">
        <SectionHeader
          eyebrow="The SmartCoIHA Solution"
          title="Interoperability with privacy, verification, and patient control"
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {solutionItems.map(({ title, text }) => (
            <article
              key={title}
              className="flex gap-4 rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm"
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
              <div>
                <p className="text-sm font-semibold text-slate-900">{title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
              </div>
            </article>
          ))}
        </div>
      </SectionContainer>

      {/* ── How It Works ── */}
      <SectionContainer id="how-it-works" className="bg-white">
        <SectionHeader
          eyebrow="How It Works"
          title="A verified, consent-driven flow from request to retrieval"
          center
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {workSteps.map((step, index) => (
            <article
              key={step}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-ink text-sm font-bold text-white">
                {String(index + 1).padStart(2, "0")}
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-700">{step}</p>
            </article>
          ))}
        </div>
      </SectionContainer>

      {/* ── Features — dark section ── */}
      <SectionContainer id="features" className="bg-ink text-white">
        <SectionHeader
          eyebrow="Key Features"
          title="Everything required for trusted health interoperability"
          center
          invert
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {keyFeatures.map(({ title, description, icon: Icon, accent }) => (
            <article
              key={title}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10"
            >
              <div
                className={`inline-flex rounded-xl p-2.5 ${
                  accent ? "bg-blue-500/20 text-accent" : "bg-emerald-500/20 text-secondary"
                }`}
              >
                <Icon size={20} />
              </div>
              <h3 className="font-display mt-4 text-lg font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-300">{description}</p>
            </article>
          ))}
        </div>
      </SectionContainer>

      {/* ── Who It's For ── */}
      <SectionContainer id="for-institutions" className="bg-white">
        <SectionHeader
          eyebrow="Who The Platform Is For"
          title="Built for institutions, providers, and patients"
          center
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {audienceData.map(({ title, points, icon: Icon, gradient, iconBg, iconColor, id }) => (
            <article
              id={id}
              key={title}
              className="scroll-mt-28 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className={`bg-linear-to-r ${gradient} h-1.5 w-full`} />
              <div className="px-6 pb-4 pt-6">
                <div className={`inline-flex rounded-xl ${iconBg} p-2.5`}>
                  <Icon size={20} className={iconColor} />
                </div>
                <h3 className="font-display mt-4 text-xl font-semibold text-slate-900">{title}</h3>
              </div>
              <ul className="space-y-3 border-t border-slate-100 px-6 py-5">
                {points.map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </SectionContainer>

      {/* ── Security — dark section ── */}
      <SectionContainer id="security" className="bg-slate-950 text-white">
        <SectionHeader
          eyebrow="Security & Privacy"
          title="Patient-first protections at every interaction"
          center
          invert
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {protections.map(({ label, icon: Icon }) => (
            <article
              key={label}
              className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-secondary">
                <Icon size={22} />
              </div>
              <p className="text-sm leading-6 text-slate-300">{label}</p>
            </article>
          ))}
        </div>
      </SectionContainer>

      {/* ── Architecture ── */}
      <SectionContainer id="architecture" className="bg-white">
        <SectionHeader
          eyebrow="System Architecture Overview"
          title="High-level SmartCoIHA interoperability flow"
          center
        />
        <div className="mt-12 rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-10">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {archNodes.map((node, i, arr) => (
              <div key={node.label} className="flex items-center gap-3">
                <div
                  className={`rounded-2xl border px-5 py-3.5 text-center text-sm font-medium ${
                    node.variant === "highlight"
                      ? "border-emerald-300 bg-emerald-700 text-white shadow-lg shadow-emerald-700/30"
                      : node.variant === "blue"
                        ? "border-blue-200 bg-blue-50 text-blue-900"
                        : "border-slate-200 bg-white text-slate-800"
                  }`}
                >
                  {node.label}
                </div>
                {i < arr.length - 1 && (
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
                )}
              </div>
            ))}
          </div>
        </div>
      </SectionContainer>

      {/* ── CTA ── */}
      <SectionContainer className="bg-linear-to-br from-emerald-800 via-primary to-teal-800 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em]">
            <Zap size={12} /> Get Started
          </span>
          <h2 className="font-display mt-6 text-3xl font-semibold tracking-tight sm:text-5xl">
            Join the SmartCoIHA Network
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-emerald-100 sm:text-lg">
            Connect your healthcare system and enable secure, interoperable patient data exchange.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#"
              className="rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-emerald-900 shadow-lg transition hover:bg-emerald-50"
            >
              Register Institution
            </a>
            <a
              href="#"
              className="rounded-full border border-white/40 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              View Developer Documentation
            </a>
          </div>
        </div>
      </SectionContainer>

      {/* ── Contact ── */}
      <SectionContainer id="contact" className="bg-white pt-8">
        <SectionHeader
          eyebrow="Contact"
          title="Talk with our team"
          description="We help institutions integrate quickly and securely into the SmartCoIHA network."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <a
            href="mailto:support@smartcoiha.com"
            className="group rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:border-emerald-300 hover:bg-emerald-50/50"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</p>
            <p className="mt-2 text-lg font-semibold text-slate-900 transition group-hover:text-primary">
              support@smartcoiha.com
            </p>
          </a>
          <a
            href="#"
            className="group rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:border-emerald-300 hover:bg-emerald-50/50"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Support</p>
            <p className="mt-2 text-lg font-semibold text-slate-900 transition group-hover:text-primary">
              Request Integration Support
            </p>
          </a>
        </div>
      </SectionContainer>
    </>
  );
}
