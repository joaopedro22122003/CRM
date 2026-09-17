"use client";

import { useActionState } from "react";
import { guardarViatura, type EstadoFormulario } from "./actions";
import { Botao, Campo, Input, Select, Textarea } from "@/components/ui";
import type { Viatura } from "@/lib/types";

const ESTADO_INICIAL: EstadoFormulario = {};

export default function ViaturaForm({ clienteId, viatura }: { clienteId: string; viatura?: Viatura }) {
  const [estado, formAction, aPendente] = useActionState(guardarViatura, ESTADO_INICIAL);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="cliente_id" value={clienteId} />
      {viatura && <input type="hidden" name="viatura_id" value={viatura.id} />}

      <Campo label="Marca">
        <Input name="marca" defaultValue={viatura?.marca} required autoFocus placeholder="Ex.: Volkswagen" />
      </Campo>

      <Campo label="Modelo">
        <Input name="modelo" defaultValue={viatura?.modelo} required placeholder="Ex.: Golf" />
      </Campo>

      <Campo label="Matrícula (opcional)">
        <Input name="matricula" defaultValue={viatura?.matricula ?? ""} placeholder="Ex.: AA-00-BB" />
      </Campo>

      <Campo label="Material dos bancos">
        <Select name="material_bancos" defaultValue={viatura?.material_bancos ?? "por_definir"}>
          <option value="por_definir">Por definir</option>
          <option value="pele">Pele</option>
          <option value="sintetico">Sintético</option>
          <option value="tecido">Tecido</option>
          <option value="alcantara">Alcântara</option>
        </Select>
        <p className="text-xs text-neutral-500">
          Necessário definir antes de orçamentar limpeza de estofos. Se houver mais que um material, escolhe o mais caro.
        </p>
      </Campo>

      <Campo label="Notas (opcional)">
        <Textarea name="notas" defaultValue={viatura?.notas ?? ""} rows={3} placeholder="Estado do carro, observações…" />
      </Campo>

      {estado?.erro && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{estado.erro}</p>
      )}

      <Botao disabled={aPendente} className="w-full">
        {aPendente ? "A guardar…" : viatura ? "Guardar alterações" : "Adicionar viatura"}
      </Botao>
    </form>
  );
}
