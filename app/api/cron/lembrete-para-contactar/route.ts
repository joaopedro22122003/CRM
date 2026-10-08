import { NextResponse } from "next/server";
import { listarClientesParaContactar } from "@/lib/data/para-contactar";
import { enviarPushParaTodos } from "@/lib/data/push";
import { mensagemParaContactar } from "@/lib/mensagens";
import { autorizarCron } from "@/lib/cron-auth";

// Chamado uma vez por dia pela Vercel (ver vercel.json). Nunca deve
// ser pré-gerado nem guardado em cache.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!autorizarCron(request)) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  const url = new URL(request.url);
  if (url.searchParams.get("teste") === "1") {
    const resultado = await enviarPushParaTodos({
      titulo: "Garagem do Jota",
      corpo: "Teste: o aviso de clientes para contactar está a funcionar.",
      url: "/para-contactar",
    });
    return NextResponse.json({ teste: true, ...resultado });
  }

  const clientes = await listarClientesParaContactar();

  if (clientes.length === 0) {
    return NextResponse.json({ enviado: false, total: 0 });
  }

  const resultado = await enviarPushParaTodos({
    titulo: "Garagem do Jota",
    corpo: mensagemParaContactar(clientes.length),
    url: "/para-contactar",
  });

  return NextResponse.json({ enviado: true, total: clientes.length, ...resultado });
}
