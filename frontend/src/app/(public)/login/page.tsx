import type { Metadata } from "next";
import SectionContainer from "@/components/home/SectionContainer";
import SectionHeader from "@/components/home/SectionHeader";
import LoginForm from "@/features/auth/components/LoginForm";

export const metadata: Metadata = {
  title: "Login | SmartCoIHA",
  description: "Login to SmartCoIHA with your institution manager credentials.",
};

export default function LoginPage() {
  return (
    <SectionContainer className="relative overflow-hidden bg-[linear-gradient(180deg,rgba(236,253,245,0.35),rgba(255,255,255,0.95))] pb-20 pt-10 sm:pt-14">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-105 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_35%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_28%)]" />

      <div className="mx-auto max-w-3xl text-center">
        <SectionHeader
          eyebrow="Public Access"
          title="Login"
          description="Sign in with the email and password you used during institution registration."
          center
        />
      </div>

      <div className="mt-12">
        <LoginForm />
      </div>
    </SectionContainer>
  );
}
