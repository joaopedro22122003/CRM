-- Guarda as subscrições de notificações push (um registo por telemóvel/
-- navegador que ativar "Lembretes") — usado para mandar o lembrete da
-- véspera das marcações. Tabela nova, não mexe em mais nada.
create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

alter table push_subscriptions enable row level security;
