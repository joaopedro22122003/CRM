// Textos pré-escritos usados nas mensagens enviadas aos clientes.
// Mantidos aqui, num único sítio, para seres fácil de editar.

/** Mensagem de lembrete de manutenção, usada em "Para contactar". */
export function mensagemLembreteManutencao(nome: string, carro: string): string {
  return `Boas ${nome}, tudo bem? 👍 Já passou um mês desde que tratámos do ${carro}. Se quiseres, posso dar-lhe uma manutenção para manter o resultado. Queres que veja datas livres?`;
}

/** Mensagem de confirmação da véspera, usada no lembrete das marcações de amanhã. */
export function mensagemConfirmacaoMarcacao(nome: string, horaTexto: string): string {
  return `Olá ${nome}! Só a confirmar a tua marcação amanhã às ${horaTexto} na Garagem do Jota. Até lá! 🚗`;
}
