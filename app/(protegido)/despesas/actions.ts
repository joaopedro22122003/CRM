"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { criarDespesa, apagarDespesa } from "@/lib/data/despesas";

export type EstadoFormulario = { erro?: string };

export async function criarDespesaAction(_estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const valorTexto = String(formData.get("valor") ?? "").replace(",", ".");
  const valor = Number(valorTexto);
  const descricao = String(formData.get("descricao") ?? "").trim();
  const data = String(formData.get("data") ?? "").trim();

  if (!valor || valor <= 0) return { erro: "Indica um valor válido." };
  if (!descricao) return { erro: "Indica de onde veio a despesa." };
  if (!data) return { erro: "Indica a data." };

  await criarDespesa({ valor, descricao, data });

  revalidatePath("/despesas");
  redirect("/despesas");
}

export async function apagarDespesaAction(formData: FormData): Promise<void> {
  const id = String(formData.get("despesa_id") ?? "");
  if (!id) return;

  await apagarDespesa(id);
  revalidatePath("/despesas");
}
