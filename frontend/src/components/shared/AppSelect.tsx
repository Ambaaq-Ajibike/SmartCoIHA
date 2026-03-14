"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export interface AppSelectOption {
  value: string;
  label: string;
  description?: string;
}

interface AppSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: AppSelectOption[];
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

export default function AppSelect({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  error,
  disabled,
}: AppSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const selected = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="relative space-y-1" ref={rootRef}>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>

      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={`group mt-1 flex w-full items-center justify-between rounded-xl border bg-white px-3 py-2.5 text-left text-sm shadow-sm transition outline-none ${
          error
            ? "border-red-300 focus:ring-4 focus:ring-red-100"
            : "border-slate-200 focus:border-primary focus:ring-4 focus:ring-emerald-100"
        } ${disabled ? "cursor-not-allowed opacity-60" : "hover:border-emerald-300"}`}
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
      >
        <span className="min-w-0">
          <span className={`block truncate ${selected ? "text-slate-900" : "text-slate-400"}`}>
            {selected?.label ?? placeholder}
          </span>
          {selected?.description ? (
            <span className="mt-0.5 block truncate text-xs text-muted">{selected.description}</span>
          ) : null}
        </span>
        <ChevronDown
          className={`ml-3 size-4 shrink-0 text-muted transition-transform ${open ? "rotate-180" : "rotate-0"}`}
        />
      </button>

      {open ? (
        <div
          id={`${id}-listbox`}
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-2 max-h-56 overflow-auto rounded-xl border border-emerald-100 bg-white p-1 shadow-xl"
        >
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex w-full items-start justify-between gap-3 rounded-lg px-3 py-2 text-left transition ${
                  isSelected ? "bg-emerald-50 text-primary" : "text-ink hover:bg-slate-50"
                }`}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{option.label}</span>
                  {option.description ? (
                    <span className="mt-0.5 block truncate text-xs text-muted">{option.description}</span>
                  ) : null}
                </span>
                {isSelected ? <Check className="mt-0.5 size-4 shrink-0" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}

      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
