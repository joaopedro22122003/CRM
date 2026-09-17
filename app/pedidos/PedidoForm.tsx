"use client";

import { useActionState } from "react";
import { criarPedidoAction, type EstadoFormulario } from "./actions";
import { Botao, Campo, Select, Textarea } from "@/components/ui";
import type { Viatura } from "@/lib/types";

const ESTADO_INICIAL: EstadoFormulario = {};

export default function PedidoForm({ clienteId, viaturas }: { clienteId: string; viaturas: Viatura[] }) {
  const [estado, formAction, aPendente] = useActionState(criarPedidoAction, ESTADO_INICIAL);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="cliente_id" value={clienteId} />

      <Campo label="Viatura">
        <Select name="viatura_id" defaultValue="">
          <option value="">Por definir</option>
          {viaturas.map((v) => (
            <option key={v.id} value={v.id}>
              {v.marca} {v.modelo} {v.matricula ? `(${v.matricula})` : ""}
            </option>
          ))}
        </Select>
        {viaturas.length === 0 && (
          <p className="text-xs text-neutral-500">Este cliente ainda não tem viaturas — podes continuar sem escolher.</p>
        )}
      </Campo>

      <Campo label="Resumo do pedido (opcional)">
        <Textarea
          name="resumo_problema"
          rows={3}
          placeholder="Ex.: quer limpeza de estofos, carro com cheiro a fumo…"
        />
      </Campo>

      {estado?.erro && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{estado.erro}</p>
      )}

      <Botao disabled={aPendente} className="w-full">
        {aPendente ? "A criar…" : "Criar pedido"}
      </Botao>
    </form>
  );
}
