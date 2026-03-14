import Link from "next/link";

const platformLinks = [
  { label: "Home", href: "/#home" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Features", href: "/#features" },
  { label: "Security", href: "/#security" },
];

const resourceLinks = [
  { label: "Developer Docs", href: "#" },
  { label: "API Integration", href: "#" },
  { label: "FHIR Overview", href: "#" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
];

const contactLinks = [
  { label: "Email", href: "mailto:support@smartcoiha.com" },
  { label: "Support", href: "/#contact" },
];

function FooterColumn({
  title,
  links,
  useLink = false,
}: {
  title: string;
  links: Array<{ label: string; href: string }>;
  useLink?: boolean;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold tracking-wide text-white">{title}</h3>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            {useLink ? (
              <Link
                href={link.href}
                className="text-sm text-slate-300 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ) : (
              <a
                href={link.href}
                className="text-sm text-slate-300 transition-colors hover:text-white"
              >
                {link.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300">
      {/* Gradient top accent */}
      <div className="h-px w-full bg-linear-to-r from-transparent via-emerald-500/60 to-transparent" />
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-5 lg:px-8">
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-white">
              S
            </span>
            <h2 className="font-display text-xl font-semibold text-white">SmartCoIHA</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Smart Connected System for Integrated Health Administration.
          </p>
        </div>

        <FooterColumn title="Platform" links={platformLinks} useLink />
        <FooterColumn title="Resources" links={resourceLinks} />
        <FooterColumn title="Legal" links={legalLinks} />
        <FooterColumn title="Contact" links={contactLinks} useLink />
      </div>

      <div className="border-t border-slate-800">
        <div className="mx-auto w-full max-w-7xl px-5 py-5 text-xs text-slate-400 lg:px-8">
          © 2026 SmartCoIHA. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
