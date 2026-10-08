"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Campo, Input, Botao } from "@/components/ui";
import { criarPedidoRapidoAction, type EstadoPedidoRapido } from "./actions";

const ESTADO_INICIAL: EstadoPedidoRapido = {};

const PACOTES = [
  { valor: "inicial", rotulo: "Inicial" },
  { valor: "detalhe", rotulo: "Detalhe" },
  { valor: "completo", rotulo: "Completo" },
  { valor: "nao_sei", rotulo: "Não sei" },
];

export default function PedidoRapidoForm() {
  const router = useRouter();
  const [estado, formAction, aPendente] = useActionState(criarPedidoRapidoAction, ESTADO_INICIAL);
  const [confirmado, setConfirmado] = useState(false);

  useEffect(() => {
    if (!estado?.sucesso) return;
    setConfirmado(true);
    const temporizador = setTimeout(() => router.back(), 900);
    return () => clearTimeout(temporizador);
  }, [estado?.sucesso, router]);

  if (confirmado) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <p className="text-3xl">✓</p>
        <p className="text-base font-semibold text-neutral-900">Registado</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Campo label="Telemóvel">
        <Input name="telefone" type="tel" required autoFocus placeholder="Ex.: 912 345 678" />
      </Campo>

      <Campo label="Nome">
        <Input name="nome" required placeholder="Ex.: João Silva" />
      </Campo>

      <Campo label="Carro">
        <Input name="carro" required placeholder="Ex.: Golf 7" />
      </Campo>

      <Campo label="Pacote (opcional)">
        <div className="grid grid-cols-2 gap-2">
          {PACOTES.map((p) => (
            <label
              key={p.valor}
              className="flex cursor-pointer items-center justify-center rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-3 text-center text-sm font-semibold text-neutral-700 has-[:checked]:border-brand has-[:checked]:bg-brand-50 has-[:checked]:text-brand-300"
            >
              <input
                type="radio"
                name="pacote"
                value={p.valor}
                defaultChecked={p.valor === "nao_sei"}
                className="sr-only"
              />
              {p.rotulo}
            </label>
          ))}
        </div>
      </Campo>

      {estado?.erro && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{estado.erro}</p>}

      <Botao disabled={aPendente} className="w-full">
        {aPendente ? "A guardar…" : "Guardar"}
      </Botao>
    </form>
  );
}
