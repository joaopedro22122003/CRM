"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { criarCliente, atualizarCliente } from "@/lib/data/clientes";
import { criarViatura, atualizarViatura } from "@/lib/data/viaturas";
import type { Fonte, MaterialBancos } from "@/lib/types";

export type EstadoFormulario = { erro?: string };

function textoOuNull(valor: FormDataEntryValue | null): string | null {
  const texto = String(valor ?? "").trim();
  return texto === "" ? null : texto;
}

export async function guardarCliente(_estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const nome = String(formData.get("nome") ?? "").trim();
  const telefone = String(formData.get("telefone") ?? "").trim();
  const fonte = String(formData.get("fonte") ?? "instagram") as Fonte;
  const notas = textoOuNull(formData.get("notas"));
  const clienteId = textoOuNull(formData.get("cliente_id"));

  if (!nome) return { erro: "Indica o nome do cliente." };
  if (!telefone) return { erro: "Indica o contacto (telemóvel) do cliente." };

  let id = clienteId;
  if (clienteId) {
    await atualizarCliente(clienteId, { nome, telefone, fonte, notas });
  } else {
    const cliente = await criarCliente({ nome, telefone, fonte, notas });
    id = cliente.id;
  }

  revalidatePath("/clientes");
  redirect(`/clientes/${id}`);
}

export async function guardarViatura(_estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const clienteId = String(formData.get("cliente_id") ?? "");
  const viaturaId = textoOuNull(formData.get("viatura_id"));
  const marca = String(formData.get("marca") ?? "").trim();
  const modelo = String(formData.get("modelo") ?? "").trim();
  const matricula = textoOuNull(formData.get("matricula"));
  const materialBancos = String(formData.get("material_bancos") ?? "por_definir") as MaterialBancos;
  const notas = textoOuNull(formData.get("notas"));

  if (!clienteId) return { erro: "Falta o cliente associado." };
  if (!marca) return { erro: "Indica a marca da viatura." };
  if (!modelo) return { erro: "Indica o modelo da viatura." };

  const dados = { marca, modelo, matricula, material_bancos: materialBancos, notas };

  if (viaturaId) {
    await atualizarViatura(viaturaId, dados);
  } else {
    await criarViatura(clienteId, dados);
  }

  revalidatePath(`/clientes/${clienteId}`);
  redirect(`/clientes/${clienteId}`);
}
