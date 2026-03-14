"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, BadgeCheck, LoaderCircle, LockKeyhole } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { login } from "@/features/auth/services/authService";
import { loginSchema, type LoginInput } from "@/features/auth/types/login";

const fieldClassName =
  "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-emerald-100";

export default function LoginForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const result = await login(values);

      if (result.token) {
        window.localStorage.setItem("auth_token", result.token);
      }

      toast.success(result.message, {
        duration: 5000,
      });

      router.push("/");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed.";
      toast.error(message, {
        duration: 6000,
      });
    }
  });

  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="rounded-4xl border border-white/70 bg-white/90 p-6 shadow-xl shadow-emerald-950/10 backdrop-blur sm:p-8">

        <form className="mt-6 space-y-5" onSubmit={onSubmit} noValidate>
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

          <Field
            label="Password"
            htmlFor="password"
            error={errors.password?.message}
            input={
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className={fieldClassName}
                placeholder="Enter your password"
                {...register("password")}
              />
            }
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Login
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>

      <aside className="relative overflow-hidden rounded-4xl bg-ink p-6 text-white shadow-2xl shadow-emerald-950/20 sm:p-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.24),transparent_45%),linear-gradient(180deg,rgba(8,47,36,0.95),rgba(2,6,23,0.98))]" />

        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
          <LockKeyhole className="h-4 w-4" />
          Secure access
        </div>

        <h3 className="font-display mt-6 text-3xl font-semibold tracking-tight">
          Access your SmartCoIHA institution workspace.
        </h3>


        <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Need an account?
          </p>
          <p className="mt-4 text-sm leading-6 text-slate-200">
            Register your healthcare institution first, then verify your email before signing in.
          </p>
          <Link
            href="/register-institution"
            className="mt-4 inline-flex rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Register institution
          </Link>
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
  input: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="text-sm font-semibold text-slate-900">{label}</span>
      {input}
      {error ? <span className="mt-2 block text-sm text-red-600">{error}</span> : null}
    </label>
  );
}
