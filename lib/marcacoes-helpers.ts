// Fora de lib/data/marcacoes.ts de propósito: esse ficheiro tem
// "server-only" e não pode ser importado por componentes cliente, mesmo
// só para reaproveitar uma função pura como esta.
import type { MarcacaoResumo } from "@/lib/data/marcacoes";

/** true se algum serviço ligado a esta marcação já estiver pago. */
export function marcacaoEstaPaga(m: MarcacaoResumo): boolean {
  return (m.servicos ?? []).some((s) => {
    const f = s.faturacao;
    if (!f) return false;
    return Array.isArray(f) ? f.some((x) => x.estado === "pago") : f.estado === "pago";
  });
}
