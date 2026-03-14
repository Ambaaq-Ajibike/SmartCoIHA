"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, LoaderCircle, MailWarning, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { decodeVerificationToken, verifyEmail } from "../services/authService";

type VerificationState = "pending" | "success" | "error" | "invalid";

export default function VerifyEmailStatus() {
  const searchParams = useSearchParams();
  const lastHandledKey = useRef<string | null>(null);
  const email = searchParams.get("email");
  const token = searchParams.get("token");
  const verificationKey = email && token ? `${email}|${token}` : "invalid-link";
  const isInvalidLink = !email || !token;
  const [status, setStatus] = useState<VerificationState>("pending");
  const [message, setMessage] = useState("Preparing your verification request...");

  useEffect(() => {
    if (lastHandledKey.current === verificationKey) {
      return;
    }

    if (isInvalidLink) {
      lastHandledKey.current = verificationKey;
      toast.error("Invalid verification link.", {
        description: "The email or token is missing from the verification URL.",
        duration: 6000,
      });
      return;
    }

    lastHandledKey.current = verificationKey;

    const runVerification = async () => {
      try {
        const responseMessage = await verifyEmail({
          email,
          token: decodeVerificationToken(token),
        });

        setStatus("success");
        setMessage(responseMessage);
        toast.success(responseMessage, {
          duration: 5000,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Email verification failed.";
        setStatus("error");
        setMessage(errorMessage);
        toast.error(errorMessage, {
          duration: 6000,
        });
      }
    };

    void runVerification();
  }, [email, isInvalidLink, token, verificationKey]);

  const resolvedStatus = isInvalidLink ? "invalid" : status;
  const resolvedMessage = isInvalidLink
    ? "This verification link is incomplete. Request a new verification email and try again."
    : message;

  return (
    <div className="mx-auto max-w-3xl rounded-4xl border border-white/70 bg-white/90 p-8 shadow-xl shadow-emerald-950/10 backdrop-blur sm:p-10">
      <div className="mx-auto flex max-w-xl flex-col items-center text-center">
        <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${getIconWrapperClassName(resolvedStatus)}`}>
          {getStatusIcon(resolvedStatus)}
        </div>

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Email verification
        </p>
        <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          {getStatusTitle(resolvedStatus)}
        </h2>
        <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">{resolvedMessage}</p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {(resolvedStatus === "error" || resolvedStatus === "invalid") && (
            <Link
              href="/register-institution"
              className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              Register again
            </Link>
          )}
          {resolvedStatus === "success" && (
            <Link
              href="/login"
              className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              Continue to Login
            </Link>
          )}
          <Link
            href="/"
            className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary"
          >
            Back to SmartCoIHA
          </Link>
        </div>
      </div>
    </div>
  );
}

function getStatusIcon(status: VerificationState) {
  if (status === "success") {
    return <CheckCircle2 className="h-8 w-8 text-emerald-600" />;
  }

  if (status === "error") {
    return <TriangleAlert className="h-8 w-8 text-red-600" />;
  }

  if (status === "invalid") {
    return <MailWarning className="h-8 w-8 text-amber-600" />;
  }

  return <LoaderCircle className="h-8 w-8 animate-spin text-accent" />;
}

function getStatusTitle(status: VerificationState) {
  if (status === "success") {
    return "Email verified";
  }

  if (status === "error") {
    return "Verification failed";
  }

  if (status === "invalid") {
    return "Invalid verification link";
  }

  return "Verifying your email";
}

function getIconWrapperClassName(status: VerificationState) {
  if (status === "success") {
    return "bg-emerald-100";
  }

  if (status === "error") {
    return "bg-red-100";
  }

  if (status === "invalid") {
    return "bg-amber-100";
  }

  return "bg-blue-100";
}