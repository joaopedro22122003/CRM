"use client";

import { useActionState } from "react";
import { criarServicoAction, type EstadoFormulario } from "./actions";
import { Botao, Campo, Input, Textarea } from "@/components/ui";

const ESTADO_INICIAL: EstadoFormulario = {};

export default function ServicoForm({
  pedidoId,
  marcacaoId,
  viaturaId,
  clienteId,
  precoSugerido,
}: {
  pedidoId: string;
  marcacaoId?: string | null;
  viaturaId: string;
  clienteId: string;
  precoSugerido?: number | null;
}) {
  const [estado, formAction, aPendente] = useActionState(criarServicoAction, ESTADO_INICIAL);
  const hoje = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="pedido_id" value={pedidoId} />
      <input type="hidden" name="marcacao_id" value={marcacaoId ?? ""} />
      <input type="hidden" name="viatura_id" value={viaturaId} />
      <input type="hidden" name="cliente_id" value={clienteId} />

      <Campo label="Data de conclusão">
        <Input name="data_conclusao" type="date" defaultValue={hoje} required />
      </Campo>

      <Campo label="Preço final cobrado (€)">
        <Input
          name="preco_final"
          type="number"
          inputMode="decimal"
          step="0.01"
          min={0}
          defaultValue={precoSugerido ?? undefined}
          required
        />
      </Campo>

      <div className="grid grid-cols-2 gap-3">
        <Campo label="Custo de produtos (€)">
          <Input name="custo_produtos" type="number" inputMode="decimal" step="0.01" min={0} defaultValue={0} />
        </Campo>
        <Campo label="Tempo de execução (min)">
          <Input name="tempo_execucao_min" type="number" min={0} step={5} />
        </Campo>
      </div>

      <Campo label="Tempo de deslocação (min, se houve recolha)">
        <Input name="tempo_deslocacao_min" type="number" min={0} step={5} defaultValue={0} />
      </Campo>

      <Campo label="Notas de incidentes (opcional)">
        <Textarea
          name="notas_incidentes"
          rows={2}
          placeholder="Ex.: risco no vidro revelado após remoção de calcário…"
        />
      </Campo>

      <Campo label="Fotos de antes (opcional)">
        <input type="file" name="fotos_antes" accept="image/*" multiple className="text-sm" />
      </Campo>

      <Campo label="Fotos de depois (opcional)">
        <input type="file" name="fotos_depois" accept="image/*" multiple className="text-sm" />
      </Campo>

      {estado?.erro && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{estado.erro}</p>
      )}

      <Botao disabled={aPendente} className="w-full">
        {aPendente ? "A guardar…" : "Registar serviço"}
      </Botao>
    </form>
  );
}
