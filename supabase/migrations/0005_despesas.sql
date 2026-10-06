-- Despesas do negócio — registo manual livre (valor + de onde veio a
-- despesa), acessível em "Mais" > "Despesas".
create table despesas (
  id uuid primary key default gen_random_uuid(),
  valor numeric(10, 2) not null,
  descricao text not null,
  data date not null default current_date,
  created_at timestamptz not null default now()
);

create index despesas_data_idx on despesas(data desc);

alter table despesas enable row level security;
