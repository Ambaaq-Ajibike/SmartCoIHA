"use client";

import type { ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, BadgeCheck, LoaderCircle, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  registerInstitutionSchema,
  type RegisterInstitutionInput,
} from "@/features/auth/types/register-institution";
import { registerManager } from "../services/authService";

const fieldClassName =
  "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-emerald-100";

const institutionHighlights = [
  "Manager account linked to your institution registration",
  "Plain-text API response is surfaced directly on success or failure",
  "FHIR onboarding can continue once your institution account is created",
];

export default function RegisterInstitutionForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInstitutionInput>({
    resolver: zodResolver(registerInstitutionSchema),
    defaultValues: {
      email: "",
      fullName: "",
      password: "",
      confirmPassword: "",
      institutionName: "",
      institutionAddress: "",
      institutionRegistrationId: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const responseMessage = await registerManager(values);
      toast.success(responseMessage, {
        duration: 5000,
      });
      reset();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Registration failed.";
      toast.error(message, {
        duration: 6000,
      });
    }
  });

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-4xl border border-white/70 bg-white/90 p-6 shadow-xl shadow-emerald-950/10 backdrop-blur sm:p-8">
        <form className="mt-6 space-y-5" onSubmit={onSubmit} noValidate>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Full name"
              htmlFor="fullName"
              error={errors.fullName?.message}
              input={
                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  className={fieldClassName}
                  placeholder="Amina Okafor"
                  {...register("fullName")}
                />
              }
            />
            <Field
              label="Email"
              htmlFor="email"
              error={errors.email?.message}
              input={
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={fieldClassName}
                  placeholder="admin@institution.org"
                  {...register("email")}
                />
              }
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Password"
              htmlFor="password"
              error={errors.password?.message}
              input={
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  className={fieldClassName}
                  placeholder="At least 8 characters"
                  {...register("password")}
                />
              }
            />
            <Field
              label="Confirm password"
              htmlFor="confirmPassword"
              error={errors.confirmPassword?.message}
              input={
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  className={fieldClassName}
                  placeholder="Re-enter your password"
                  {...register("confirmPassword")}
                />
              }
            />
          </div>

          <Field
            label="Institution name"
            htmlFor="institutionName"
            error={errors.institutionName?.message}
            input={
              <input
                id="institutionName"
                type="text"
                autoComplete="organization"
                className={fieldClassName}
                placeholder="City General Hospital"
                {...register("institutionName")}
              />
            }
          />

          <Field
            label="Institution address"
            htmlFor="institutionAddress"
            error={errors.institutionAddress?.message}
            input={
              <textarea
                id="institutionAddress"
                rows={4}
                className={`${fieldClassName} resize-none`}
                placeholder="12 Health Drive, Ikeja, Lagos"
                {...register("institutionAddress")}
              />
            }
          />

          <Field
            label="Institution registration ID"
            htmlFor="institutionRegistrationId"
            error={errors.institutionRegistrationId?.message}
            input={
              <input
                id="institutionRegistrationId"
                type="text"
                className={fieldClassName}
                placeholder="HEALTH-REG-2026-001"
                {...register("institutionRegistrationId")}
              />
            }
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Submitting registration...
              </>
            ) : (
              <>
                Register institution
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>

      <aside className="relative overflow-hidden rounded-4xl bg-ink p-6 text-white shadow-2xl shadow-emerald-950/20 sm:p-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.24),transparent_45%),linear-gradient(180deg,rgba(8,47,36,0.95),rgba(2,6,23,0.98))]" />

        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
          <ShieldCheck className="h-4 w-4" />
          Institution onboarding
        </div>

        <h3 className="font-display mt-6 text-3xl font-semibold tracking-tight">
          Register once, then continue with verification and FHIR setup.
        </h3>

        <div className="mt-8 space-y-3">
          {institutionHighlights.map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
            >
              <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
              <p className="text-sm leading-6 text-slate-200">{item}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Next steps after approval
          </p>
          <ol className="mt-4 space-y-3 text-sm text-slate-200">
            <li>1. Confirm institution registration details and manager identity.</li>
            <li>2. Verify healthcare licensing and registration identifiers.</li>
            <li>3. Continue with endpoint submission for FHIR validation.</li>
          </ol>
        </div>
      </aside>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  error,
  input,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  input: ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="text-sm font-semibold text-slate-900">{label}</span>
      {input}
      {error ? <span className="mt-2 block text-sm text-red-600">{error}</span> : null}
    </label>
  );
}