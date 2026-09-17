import Link from "next/link";
import type { ReactNode } from "react";

export function PageHeader({
  titulo,
  voltarPara,
  acao,
}: {
  titulo: string;
  voltarPara?: string;
  acao?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-neutral-200 bg-neutral-50/95 px-4 py-3 backdrop-blur">
      {voltarPara && (
        <Link
          href={voltarPara}
          aria-label="Voltar"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-500 active:bg-neutral-200"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
      )}
      <h1 className="flex-1 truncate text-lg font-semibold text-neutral-900">{titulo}</h1>
      {acao}
    </header>
  );
}

export function Cartao({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

const variantes = {
  primario: "bg-neutral-900 text-white active:bg-neutral-700",
  secundario: "bg-neutral-100 text-neutral-900 active:bg-neutral-200",
  perigo: "bg-red-50 text-red-700 active:bg-red-100",
};

export function BotaoLink({
  href,
  children,
  variante = "primario",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variante?: keyof typeof variantes;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-xl px-4 py-3 text-center text-base font-semibold ${variantes[variante]} ${className}`}
    >
      {children}
    </Link>
  );
}

export function Botao({
  children,
  variante = "primario",
  className = "",
  type = "submit",
  disabled,
}: {
  children: ReactNode;
  variante?: keyof typeof variantes;
  className?: string;
  type?: "submit" | "button";
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-xl px-4 py-3 text-center text-base font-semibold disabled:opacity-50 ${variantes[variante]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Campo({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-neutral-700">{label}</span>
      {children}
    </label>
  );
}

const classesInput =
  "w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-base text-neutral-900 focus:border-neutral-900 focus:outline-none";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${classesInput} ${props.className ?? ""}`} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${classesInput} ${props.className ?? ""}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${classesInput} ${props.className ?? ""}`} />;
}

const coresBadge: Record<string, string> = {
  cinza: "bg-neutral-100 text-neutral-700",
  azul: "bg-blue-50 text-blue-700",
  amarelo: "bg-amber-50 text-amber-700",
  verde: "bg-green-50 text-green-700",
  vermelho: "bg-red-50 text-red-700",
  roxo: "bg-purple-50 text-purple-700",
};

export function Badge({ cor = "cinza", children }: { cor?: keyof typeof coresBadge; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${coresBadge[cor]}`}>
      {children}
    </span>
  );
}

export function EstadoVazio({ titulo, descricao, acao }: { titulo: string; descricao?: string; acao?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-neutral-300 px-6 py-12 text-center">
      <p className="text-base font-semibold text-neutral-700">{titulo}</p>
      {descricao && <p className="text-sm text-neutral-500">{descricao}</p>}
      {acao}
    </div>
  );
}
