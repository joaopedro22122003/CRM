-- Garagem do Jota — esquema inicial da base de dados
-- Todas as tabelas usam RLS ativo sem políticas: só a chave de serviço
-- (usada apenas no servidor Next.js) consegue ler/escrever. Isto é
-- suficiente porque a app não usa autenticação Supabase — tem uma
-- palavra-passe simples ao nível da aplicação.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Clientes
-- ---------------------------------------------------------------------
create table clientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  telefone text not null,
  fonte text not null default 'instagram'
    check (fonte in ('instagram', 'passa_palavra', 'outro')),
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Viaturas (associadas a um cliente)
-- ---------------------------------------------------------------------
create table viaturas (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id) on delete cascade,
  marca text not null,
  modelo text not null,
  matricula text,
  -- obrigatório definir antes de orçamentar limpeza de estofos
  material_bancos text not null default 'por_definir'
    check (material_bancos in ('pele', 'sintetico', 'tecido', 'alcantara', 'por_definir')),
  notas text,
  created_at timestamptz not null default now()
);

create index viaturas_cliente_id_idx on viaturas(cliente_id);

-- ---------------------------------------------------------------------
-- Configuração de preços — tabela de uma única linha, editável
-- diretamente no editor visual do Supabase como rede de segurança.
-- ---------------------------------------------------------------------
create table configuracoes_precos (
  id smallint primary key default 1 check (id = 1),
  preco_inicial numeric(10, 2) not null default 30,
  preco_detalhe numeric(10, 2) not null default 45,
  preco_completo numeric(10, 2) not null default 80,
  preco_pele_sintetico numeric(10, 2) not null default 60,
  preco_tecido_alcantara numeric(10, 2) not null default 70,
  desconto_combo numeric(10, 2) not null default 10,
  updated_at timestamptz not null default now()
);

insert into configuracoes_precos (id) values (1);

-- ---------------------------------------------------------------------
-- Pedidos / Leads
-- ---------------------------------------------------------------------
create table pedidos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id) on delete cascade,
  viatura_id uuid references viaturas(id) on delete set null,
  estado text not null default 'novo'
    check (estado in ('novo', 'qualificado', 'orcamentado', 'marcado', 'concluido', 'perdido')),
  resumo_problema text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index pedidos_cliente_id_idx on pedidos(cliente_id);
create index pedidos_estado_idx on pedidos(estado);

-- ---------------------------------------------------------------------
-- Orçamentos
-- ---------------------------------------------------------------------
create table orcamentos (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references pedidos(id) on delete cascade,
  pacote text not null check (pacote in ('inicial', 'detalhe', 'completo')),
  tem_estofos boolean not null default false,
  estofos_material text check (estofos_material in ('pele_sintetico', 'tecido_alcantara')),
  combo_aplicado boolean not null default false,
  preco_base numeric(10, 2) not null,
  preco_estofos numeric(10, 2) not null default 0,
  desconto_combo numeric(10, 2) not null default 0,
  total_extras numeric(10, 2) not null default 0,
  preco_entrada numeric(10, 2) not null,
  notas_variacao text,
  created_at timestamptz not null default now(),
  -- estofos_material é obrigatório quando tem_estofos é verdadeiro
  constraint estofos_material_coerente check (
    (tem_estofos = false and estofos_material is null) or
    (tem_estofos = true and estofos_material is not null)
  ),
  -- o combo só pode ser aplicado a Completo + estofos
  constraint combo_apenas_completo_estofos check (
    combo_aplicado = false or (pacote = 'completo' and tem_estofos = true)
  )
);

create index orcamentos_pedido_id_idx on orcamentos(pedido_id);

create table orcamento_extras (
  id uuid primary key default gen_random_uuid(),
  orcamento_id uuid not null references orcamentos(id) on delete cascade,
  descricao text not null,
  preco numeric(10, 2) not null default 0
);

create index orcamento_extras_orcamento_id_idx on orcamento_extras(orcamento_id);

-- ---------------------------------------------------------------------
-- Marcações
-- ---------------------------------------------------------------------
create table marcacoes (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references pedidos(id) on delete cascade,
  data_hora timestamptz not null,
  duracao_estimada_min integer not null default 90,
  tipo text not null default 'cliente_traz'
    check (tipo in ('cliente_traz', 'recolha_entrega')),
  zona text,
  estado text not null default 'agendado'
    check (estado in ('agendado', 'concluido', 'cancelado')),
  notas text,
  created_at timestamptz not null default now()
);

create index marcacoes_pedido_id_idx on marcacoes(pedido_id);
create index marcacoes_data_hora_idx on marcacoes(data_hora);

-- ---------------------------------------------------------------------
-- Serviços realizados
-- ---------------------------------------------------------------------
create table servicos (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references pedidos(id) on delete cascade,
  marcacao_id uuid references marcacoes(id) on delete set null,
  viatura_id uuid not null references viaturas(id),
  cliente_id uuid not null references clientes(id),
  data_conclusao date not null default current_date,
  preco_final numeric(10, 2) not null,
  custo_produtos numeric(10, 2) not null default 0,
  tempo_execucao_min integer,
  tempo_deslocacao_min integer not null default 0,
  notas_incidentes text,
  created_at timestamptz not null default now()
);

create index servicos_cliente_id_idx on servicos(cliente_id);
create index servicos_viatura_id_idx on servicos(viatura_id);
create index servicos_data_conclusao_idx on servicos(data_conclusao);

create table servico_fotos (
  id uuid primary key default gen_random_uuid(),
  servico_id uuid not null references servicos(id) on delete cascade,
  tipo text not null check (tipo in ('antes', 'depois')),
  url text not null,
  created_at timestamptz not null default now()
);

create index servico_fotos_servico_id_idx on servico_fotos(servico_id);

-- ---------------------------------------------------------------------
-- Faturação
-- ---------------------------------------------------------------------
create table faturacao (
  id uuid primary key default gen_random_uuid(),
  servico_id uuid not null unique references servicos(id) on delete cascade,
  valor numeric(10, 2) not null,
  data_pagamento date,
  metodo_pagamento text,
  estado text not null default 'pendente' check (estado in ('pago', 'pendente')),
  notas text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Row Level Security — ativa em todas as tabelas, sem políticas.
-- Só a chave de serviço (server-side) acede aos dados.
-- ---------------------------------------------------------------------
alter table clientes enable row level security;
alter table viaturas enable row level security;
alter table configuracoes_precos enable row level security;
alter table pedidos enable row level security;
alter table orcamentos enable row level security;
alter table orcamento_extras enable row level security;
alter table marcacoes enable row level security;
alter table servicos enable row level security;
alter table servico_fotos enable row level security;
alter table faturacao enable row level security;

-- ---------------------------------------------------------------------
-- Storage: bucket para fotos de antes/depois
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('fotos-servicos', 'fotos-servicos', true)
on conflict (id) do nothing;
