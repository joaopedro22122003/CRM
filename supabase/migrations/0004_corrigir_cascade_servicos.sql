-- Corrige o erro ao apagar um cliente. servicos.viatura_id e
-- servicos.cliente_id não tinham "on delete cascade", o que entra em
-- conflito com o cascade que já acontece pelo caminho
-- cliente -> pedido -> serviço, causando um erro de integridade
-- referencial ao apagar um cliente.
alter table servicos drop constraint if exists servicos_viatura_id_fkey;
alter table servicos add constraint servicos_viatura_id_fkey
  foreign key (viatura_id) references viaturas(id) on delete cascade;

alter table servicos drop constraint if exists servicos_cliente_id_fkey;
alter table servicos add constraint servicos_cliente_id_fkey
  foreign key (cliente_id) references clientes(id) on delete cascade;
