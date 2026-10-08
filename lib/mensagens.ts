// Textos pré-escritos usados nas mensagens enviadas aos clientes.
// Mantidos aqui, num único sítio, para seres fácil de editar.

/** Mensagem de lembrete de manutenção, usada em "Para contactar". */
export function mensagemLembreteManutencao(nome: string, carro: string): string {
  return `Boas ${nome}, tudo bem? 👍 Já passou um mês desde que tratámos do ${carro}. Se quiseres, posso dar-lhe uma revisão para manter o resultado. Queres que veja datas livres?`;
}

/** Mensagem de confirmação da véspera, usada no lembrete das marcações de amanhã. */
export function mensagemConfirmacaoMarcacao(nome: string, horaTexto: string): string {
  return `Olá ${nome}! Só a confirmar a tua marcação amanhã às ${horaTexto} na Garagem do Jota. Até lá! 🚗`;
}

/** Corpo da notificação diária de "Para contactar", com singular/plural correto. */
export function mensagemParaContactar(quantidade: number): string {
  return quantidade === 1 ? "Tens 1 cliente para contactar." : `Tens ${quantidade} clientes para contactar.`;
}

/** Mensagem de seguimento a um orçamento sem resposta, usada no ecrã
 * "Orçamentos sem resposta". Tem uma variante sem carro, para quando
 * o pedido não tem viatura associada. */
export function mensagemOrcamentoSemResposta(nome: string, carro: string | null): string {
  return carro
    ? `Boas ${nome}, tudo bem? 👍 Já passou algum tempo desde a última vez que falámos e queria só saber se ainda tens interesse em tratar do ${carro}, ou preferes deixar para mais à frente?`
    : `Boas ${nome}, tudo bem? 👍 Já passou algum tempo desde a última vez que falámos e queria só saber se ainda tens interesse em marcar o serviço, ou preferes deixar para mais à frente?`;
}

/** Corpo da notificação diária combinada (9h), com as duas contagens —
 * "Para contactar" e "Orçamentos sem resposta". Singular/plural
 * corretos em cada parte; omite a parte cuja contagem seja 0. */
export function mensagemAvisoDiario(paraContactar: number, semResposta: number): string {
  const partes: string[] = [];
  if (paraContactar > 0) {
    partes.push(
      paraContactar === 1
        ? "1 cliente para contactar (manutenção)"
        : `${paraContactar} clientes para contactar (manutenção)`
    );
  }
  if (semResposta > 0) {
    partes.push(semResposta === 1 ? "1 orçamento sem resposta" : `${semResposta} orçamentos sem resposta`);
  }
  return `Tens ${partes.join(" e ")}.`;
}
