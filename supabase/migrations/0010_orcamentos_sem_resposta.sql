-- Registos rápidos de "pediu preço, ainda não marcou" (ecrã
-- "Orçamentos sem resposta") — tabela própria e independente de
-- clientes/pedidos/orçamentos, para o registo rápido deixar de criar
-- cliente, viatura, pedido e orçamento e passar a viver só aqui.
create table orcamentos_sem_resposta (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  telefone text not null,
  carro text,
  pacote text,
  criado_em date not null default current_date,
  seguimento_em date,
  estado text not null default 'ativo' check (estado in ('ativo', 'marcou', 'perdido')),
  resolvido_em date,
  created_at timestamptz not null default now()
);

alter table orcamentos_sem_resposta enable row level security;
