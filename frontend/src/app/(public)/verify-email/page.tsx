import type { Metadata } from "next";
import { Suspense } from "react";
import { LoaderCircle } from "lucide-react";
import SectionContainer from "@/components/home/SectionContainer";
import VerifyEmailStatus from "@/features/auth/components/VerifyEmailStatus";

export const metadata: Metadata = {
  title: "Verify Email | SmartCoIHA",
  description: "Verify your SmartCoIHA email address to complete institution onboarding.",
};

export default function VerifyEmailPage() {
  return (
    <SectionContainer className="relative overflow-hidden bg-[linear-gradient(180deg,rgba(236,253,245,0.35),rgba(255,255,255,0.95))] pb-20 pt-10 sm:pt-14">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-105 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_35%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_28%)]" />

      <div className="mb-12 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Public Verification</p>
        <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
          Confirm your email address
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
          We are validating the verification token from your email link and sending the decoded token to the SmartCoIHA verification endpoint.
        </p>
      </div>

      <Suspense fallback={<VerificationFallback />}>
        <VerifyEmailStatus />
      </Suspense>
    </SectionContainer>
  );
}

function VerificationFallback() {
  return (
    <div className="mx-auto max-w-3xl rounded-4xl border border-white/70 bg-white/90 p-8 text-center shadow-xl shadow-emerald-950/10 backdrop-blur sm:p-10">
      <div className="flex flex-col items-center justify-center gap-3 text-slate-600">
        <LoaderCircle className="h-7 w-7 animate-spin text-accent" aria-hidden="true" />
        <p className="text-base">Loading verification details...</p>
      </div>
    </div>
  );
}