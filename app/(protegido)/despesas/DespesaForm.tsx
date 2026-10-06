"use client";

import { useActionState } from "react";
import { criarDespesaAction, type EstadoFormulario } from "./actions";
import { Botao, Campo, Input, Textarea } from "@/components/ui";

const ESTADO_INICIAL: EstadoFormulario = {};

export default function DespesaForm() {
  const [estado, formAction, aPendente] = useActionState(criarDespesaAction, ESTADO_INICIAL);
  const hoje = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Campo label="Valor (€)">
        <Input
          name="valor"
          type="number"
          inputMode="decimal"
          step="0.01"
          min={0}
          placeholder="0,00"
          autoFocus
          required
        />
      </Campo>

      <Campo label="De onde veio a despesa">
        <Textarea
          name="descricao"
          rows={3}
          placeholder="Ex.: Produtos de limpeza na Norauto, gasóleo, manutenção da máquina…"
          required
        />
      </Campo>

      <Campo label="Data">
        <Input name="data" type="date" defaultValue={hoje} required />
      </Campo>

      {estado?.erro && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{estado.erro}</p>}

      <Botao disabled={aPendente} className="w-full">
        {aPendente ? "A guardar…" : "Guardar despesa"}
      </Botao>
    </form>
  );
}
