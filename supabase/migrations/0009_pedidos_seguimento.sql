-- "Orçamentos sem resposta": regista quando foi feito o único
-- seguimento permitido por pedido (nunca insiste mais do que uma
-- vez). Coluna nova, sem valor por omissão — todos os pedidos
-- existentes ficam com seguimento_em = null ("ainda não seguido").
alter table pedidos add column seguimento_em date;
