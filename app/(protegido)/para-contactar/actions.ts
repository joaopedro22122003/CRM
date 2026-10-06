"use server";

import { revalidatePath } from "next/cache";
import { marcarClienteContactado } from "@/lib/data/clientes";

export async function marcarClienteContactadoAction(clienteId: string): Promise<void> {
  if (!clienteId) return;
  await marcarClienteContactado(clienteId);
  revalidatePath("/para-contactar");
}
