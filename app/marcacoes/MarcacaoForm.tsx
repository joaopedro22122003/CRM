"use client";

import { useState } from "react";
import { useActionState } from "react";
import { criarMarcacaoAction, type EstadoFormulario } from "./actions";
import { Botao, Campo, Input, Select, Textarea } from "@/components/ui";
import type { TipoMarcacao } from "@/lib/types";

const ESTADO_INICIAL: EstadoFormulario = {};

export default function MarcacaoForm({ pedidoId }: { pedidoId: string }) {
  const [estado, formAction, aPendente] = useActionState(criarMarcacaoAction, ESTADO_INICIAL);
  const [tipo, setTipo] = useState<TipoMarcacao>("cliente_traz");

  const hoje = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="pedido_id" value={pedidoId} />

      <div className="grid grid-cols-2 gap-3">
        <Campo label="Data">
          <Input name="data" type="date" defaultValue={hoje} required />
        </Campo>
        <Campo label="Hora">
          <Input name="hora" type="time" defaultValue="09:00" required />
        </Campo>
      </div>

      <Campo label="Duração estimada (minutos)">
        <Input name="duracao_estimada_min" type="number" step={15} min={30} defaultValue={90} required />
      </Campo>

      <Campo label="Tipo">
        <Select name="tipo" value={tipo} onChange={(e) => setTipo(e.target.value as TipoMarcacao)}>
          <option value="cliente_traz">Cliente traz o carro</option>
          <option value="recolha_entrega">Recolha / entrega</option>
        </Select>
      </Campo>

      {tipo === "recolha_entrega" && (
        <Campo label="Zona">
          <Input name="zona" placeholder="Ex.: Terras de Bouro" required />
        </Campo>
      )}

      <Campo label="Notas (opcional)">
        <Textarea name="notas" rows={2} placeholder="Observações sobre a marcação…" />
      </Campo>

      {estado?.erro && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{estado.erro}</p>
      )}

      <Botao disabled={aPendente} className="w-full">
        {aPendente ? "A marcar…" : "Criar marcação"}
      </Botao>
    </form>
  );
}
