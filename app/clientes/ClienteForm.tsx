"use client";

import { useActionState } from "react";
import { guardarCliente, type EstadoFormulario } from "./actions";
import { Botao, Campo, Input, Select, Textarea } from "@/components/ui";
import type { Cliente } from "@/lib/types";

const ESTADO_INICIAL: EstadoFormulario = {};

export default function ClienteForm({ cliente }: { cliente?: Cliente }) {
  const [estado, formAction, aPendente] = useActionState(guardarCliente, ESTADO_INICIAL);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {cliente && <input type="hidden" name="cliente_id" value={cliente.id} />}

      <Campo label="Nome">
        <Input name="nome" defaultValue={cliente?.nome} required autoFocus placeholder="Ex.: João Silva" />
      </Campo>

      <Campo label="Contacto (telemóvel)">
        <Input
          name="telefone"
          type="tel"
          defaultValue={cliente?.telefone}
          required
          placeholder="Ex.: 912 345 678"
        />
      </Campo>

      <Campo label="Como te encontrou">
        <Select name="fonte" defaultValue={cliente?.fonte ?? "instagram"}>
          <option value="instagram">Instagram</option>
          <option value="passa_palavra">Passa-palavra</option>
          <option value="outro">Outro</option>
        </Select>
      </Campo>

      <Campo label="Notas (opcional)">
        <Textarea name="notas" defaultValue={cliente?.notas ?? ""} rows={3} placeholder="Preferências, observações…" />
      </Campo>

      {estado?.erro && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{estado.erro}</p>
      )}

      <Botao disabled={aPendente} className="w-full">
        {aPendente ? "A guardar…" : cliente ? "Guardar alterações" : "Criar cliente"}
      </Botao>
    </form>
  );
}
