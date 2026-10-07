// Cálculo de datas em hora de Lisboa, sem precisar de nenhuma
// biblioteca extra — só com o Intl que já vem no Node/browser. Usado
// para saber exatamente que marcações contam como "amanhã",
// independentemente de estarmos em hora de inverno ou de verão.

function obterOffsetMinutos(data: Date, timeZone: string): number {
  const partes: Record<string, string> = {};
  for (const parte of new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(data)) {
    if (parte.type !== "literal") partes[parte.type] = parte.value;
  }

  const comoUtc = Date.UTC(
    Number(partes.year),
    Number(partes.month) - 1,
    Number(partes.day),
    Number(partes.hour),
    Number(partes.minute),
    Number(partes.second)
  );
  return (comoUtc - data.getTime()) / 60_000;
}

/** Início e fim (em ISO/UTC) do dia de amanhã, em hora de Lisboa —
 * pronto a usar em listarMarcacoesEntre. Devolve também a data em
 * "YYYY-MM-DD" (dataTexto), para mostrar/formatar sem reconverter o
 * instante UTC — assim fica consistente com o resto da app, que já
 * grava e lê as horas das marcações como hora local "ingénua". */
export function limitesDeAmanhaEmLisboa(): { inicioIso: string; fimIso: string; dataTexto: string } {
  const agora = new Date();
  // Offset calculado perto de amanhã, não de hoje, para já vir certo
  // mesmo no dia em que muda a hora de verão/inverno.
  const offsetMin = obterOffsetMinutos(new Date(agora.getTime() + 24 * 60 * 60 * 1000), "Europe/Lisbon");

  const hojeLisboa = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Lisbon" }).format(agora);
  const amanha = new Date(`${hojeLisboa}T00:00:00Z`);
  amanha.setUTCDate(amanha.getUTCDate() + 1);
  const anoMesDia = amanha.toISOString().slice(0, 10);

  const inicioUtc = new Date(`${anoMesDia}T00:00:00Z`).getTime() - offsetMin * 60_000;
  const fimUtc = inicioUtc + 24 * 60 * 60 * 1000;

  return {
    inicioIso: new Date(inicioUtc).toISOString(),
    fimIso: new Date(fimUtc).toISOString(),
    dataTexto: anoMesDia,
  };
}
