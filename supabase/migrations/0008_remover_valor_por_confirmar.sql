-- A coluna valor_por_confirmar nunca chegou a ser usada por nenhum
-- código (o fluxo que a introduziria foi substituído por outro).
-- Remove-a para a base de dados não ter colunas "fantasma".
alter table faturacao drop column valor_por_confirmar;
