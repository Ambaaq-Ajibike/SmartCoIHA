type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  center?: boolean;
  invert?: boolean;
};

export default function SectionHeader({
  eyebrow,
  title,
  description,
  center = false,
  invert = false,
}: SectionHeaderProps) {
  return (
    <div className={center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {eyebrow ? (
        <p
          className={`text-xs font-semibold uppercase tracking-[0.2em] ${
            invert ? "text-secondary" : "text-accent"
          }`}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={`font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl ${
          invert ? "text-white" : "text-slate-900"
        }`}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={`mt-4 text-base leading-7 sm:text-lg ${
            invert ? "text-slate-300" : "text-slate-600"
          }`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
