-- Estofos passam a ter um preço único (60€), independente do
-- material dos bancos. O material continua a ser registado na
-- viatura e no orçamento, mas deixa de influenciar o preço.
alter table configuracoes_precos add column preco_estofos numeric(10, 2) not null default 60;
update configuracoes_precos set preco_estofos = 60 where id = 1;
alter table configuracoes_precos drop column preco_pele_sintetico;
alter table configuracoes_precos drop column preco_tecido_alcantara;

-- orcamentos.estofos_material passava a guardar apenas um de dois
-- "tiers" de preço; agora guarda o material real da viatura.
alter table orcamentos drop constraint orcamentos_estofos_material_check;
alter table orcamentos add constraint orcamentos_estofos_material_check check (
  estofos_material in ('pele', 'sintetico', 'tecido', 'alcantara')
);
