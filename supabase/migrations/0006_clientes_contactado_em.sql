-- "Para contactar": guarda quando um cliente foi contactado pela última
-- vez a convidar para nova manutenção. Coluna nova, sem valor por
-- omissão — todos os clientes existentes ficam com contactado_em = null
-- ("nunca contactado"). Não mexe em mais nenhum dado.
alter table clientes add column contactado_em date;

-- "Serviço feito" pode gravar um serviço sem orçamento associado (preço
-- sugerido 0€). Esta flag marca essa linha de faturação como tendo um
-- valor ainda por confirmar, para nunca entrar nas somas de faturação/
-- lucro como se fosse dinheiro real. Linhas existentes ficam todas
-- "false" (nenhuma foi criada "por confirmar").
alter table faturacao add column valor_por_confirmar boolean not null default false;
