-- Catálogo de extras do orçamento — lista pré-definida (em vez de
-- texto livre), editável no Table Editor do Supabase como rede de
-- segurança (adicionar, remover ou mudar preços sem tocar em código).
create table extras_catalogo (
  id uuid primary key default gen_random_uuid(),
  descricao text not null,
  preco numeric(10, 2) not null,
  ativo boolean not null default true,
  ordem integer not null default 0,
  created_at timestamptz not null default now()
);

alter table extras_catalogo enable row level security;

insert into extras_catalogo (descricao, preco, ordem) values
  ('Cera líquida', 10, 1),
  ('Renovação de plásticos exteriores', 10, 2),
  ('Renovação de plásticos interiores', 15, 3),
  ('Remoção de calcário nos vidros', 20, 4),
  ('Limpeza de teto', 15, 5),
  ('Descontaminação de pintura', 40, 6),
  ('Hidratação de bancos em pele', 15, 7),
  ('Restauro de faróis', 30, 8);
