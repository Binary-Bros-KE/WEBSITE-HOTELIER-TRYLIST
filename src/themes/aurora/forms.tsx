"use client";

import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { useFormStatus } from "react-dom";

import type { FormState } from "@/engine/actions";
import { cx } from "./ui";

// Form primitives for Aurora's booking and enquiry forms.

const control = "w-full border-0 border-b border-line bg-transparent px-0 pb-2 pt-1 text-lg text-ink placeholder:text-ink-soft/60 focus:border-accent focus:outline-none focus:ring-0 aria-[invalid=true]:border-red-700/60";

export function FieldError({ state, name }: { state: FormState; name: string }) {
  const message = state.fieldErrors?.[name]?.[0];
  return message ? <span role="alert" className="text-sm text-red-800">{message}</span> : null;
}

export function TextField({ label, name, state, hint, className, ...input }: { label: string; name: string; state: FormState; hint?: string } & InputHTMLAttributes<HTMLInputElement>) {
  const invalid = Boolean(state.fieldErrors?.[name]?.length);
  return (
    <label className={cx("flex flex-col gap-2", className)}>
      <span className="aurora-eyebrow">{label}{input.required && <span aria-hidden> *</span>}</span>
      <input name={name} aria-invalid={invalid} className={control} {...input} />
      {hint && !invalid && <span className="text-xs text-ink-soft">{hint}</span>}
      <FieldError state={state} name={name} />
    </label>
  );
}

export function TextAreaField({ label, name, state, className, ...input }: { label: string; name: string; state: FormState } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className={cx("flex flex-col gap-2", className)}>
      <span className="aurora-eyebrow">{label}</span>
      <textarea name={name} rows={4} aria-invalid={Boolean(state.fieldErrors?.[name]?.length)} className={cx(control, "resize-y")} {...input} />
      <FieldError state={state} name={name} />
    </label>
  );
}

export function SelectField({ label, name, state, children, className, ...input }: { label: string; name: string; state: FormState; children: ReactNode } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className={cx("flex flex-col gap-2", className)}>
      <span className="aurora-eyebrow">{label}</span>
      <select name={name} className={control} {...input}>{children}</select>
      <FieldError state={state} name={name} />
    </label>
  );
}

/** Invisible to people, irresistible to bots — the API rejects any value. */
export function Honeypot() {
  return (
    <div aria-hidden className="absolute -left-[9999px] size-px overflow-hidden">
      <label>Company <input type="text" name="company" tabIndex={-1} autoComplete="off" defaultValue="" /></label>
    </div>
  );
}

export function FormError({ state }: { state: FormState }) {
  return state.error ? <p role="alert" className="border-l-2 border-red-800/60 bg-red-50 px-5 py-4 text-sm text-red-900">{state.error}</p> : null;
}

export function SubmitButton({ children, pendingLabel, className, disabled }: { children: ReactNode; pendingLabel: string; className?: string; disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className={cx(
        "inline-flex items-center justify-center gap-3 bg-brand px-8 py-4 text-[0.7rem] font-medium uppercase tracking-[0.24em] text-paper transition-colors duration-300 hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
    >
      {pending && <span aria-hidden className="size-3 animate-spin rounded-full border border-paper/40 border-t-paper" />}
      {pending ? pendingLabel : children}
    </button>
  );
}
