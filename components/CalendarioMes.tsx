"use client";

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { pt } from "date-fns/locale";

const DIAS_SEMANA = ["S", "T", "Q", "Q", "S", "S", "D"];

export default function CalendarioMes({
  mesAtual,
  onMudarMes,
  diaSelecionado,
  onSelecionarDia,
  contarEventosNoDia,
}: {
  mesAtual: Date;
  onMudarMes: (novoMes: Date) => void;
  diaSelecionado: Date | null;
  onSelecionarDia: (dia: Date) => void;
  contarEventosNoDia: (dia: Date) => number;
}) {
  const inicioGrelha = startOfWeek(startOfMonth(mesAtual), { weekStartsOn: 1 });
  const fimGrelha = endOfWeek(endOfMonth(mesAtual), { weekStartsOn: 1 });
  const dias = eachDayOfInterval({ start: inicioGrelha, end: fimGrelha });

  return (
    <div className="mx-auto flex w-full max-w-[280px] flex-col gap-2">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => onMudarMes(subMonths(mesAtual, 1))}
          aria-label="Mês anterior"
          className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-500 active:bg-neutral-200"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <span className="text-xs font-semibold capitalize text-neutral-900">
          {format(mesAtual, "MMMM yyyy", { locale: pt })}
        </span>
        <button
          type="button"
          onClick={() => onMudarMes(addMonths(mesAtual, 1))}
          aria-label="Mês seguinte"
          className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-500 active:bg-neutral-200"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] text-neutral-400">
        {DIAS_SEMANA.map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {dias.map((dia) => {
          const noMes = isSameMonth(dia, mesAtual);
          const selecionado = diaSelecionado !== null && isSameDay(dia, diaSelecionado);
          const hoje = isToday(dia);
          const numEventos = contarEventosNoDia(dia);

          return (
            <button
              key={dia.toISOString()}
              type="button"
              onClick={() => onSelecionarDia(dia)}
              className={`flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg text-xs ${
                selecionado
                  ? "bg-brand text-white font-semibold"
                  : hoje
                    ? "border border-brand text-brand font-semibold"
                    : noMes
                      ? "text-neutral-900"
                      : "text-neutral-300"
              }`}
            >
              {dia.getDate()}
              <span
                className={`h-1 w-1 rounded-full ${
                  numEventos > 0 ? (selecionado ? "bg-white" : "bg-brand") : "bg-transparent"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
