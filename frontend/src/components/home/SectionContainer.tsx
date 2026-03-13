import { ReactNode } from "react";

type SectionContainerProps = {
  id?: string;
  className?: string;
  children: ReactNode;
};

export default function SectionContainer({
  id,
  className = "",
  children,
}: SectionContainerProps) {
  return (
    <section id={id} className={`scroll-mt-28 py-16 sm:py-20 ${className}`}>
      <div className="mx-auto w-full max-w-7xl px-5 lg:px-8">{children}</div>
    </section>
  );
}
