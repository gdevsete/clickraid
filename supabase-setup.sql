-- Run this in the Supabase SQL Editor (supabase.co → project → SQL Editor)

create table if not exists orders (
  id               uuid default gen_random_uuid() primary key,
  user_id          uuid references auth.users on delete set null,
  transaction_id   text unique not null,
  items            jsonb default '[]',
  amount           integer not null,   -- centavos (já com desconto PIX)
  status           text not null default 'pending',
  created_at       timestamptz default now()
);

-- Ativa Row Level Security
alter table orders enable row level security;

-- Usuário logado só vê os próprios pedidos
create policy "Users see own orders"
  on orders for select
  using (auth.uid() = user_id);

-- INSERT e UPDATE só via service_role (API do servidor — bypassa RLS automaticamente)
-- Nenhuma policy de insert/update para anon/authenticated = bloqueado no frontend
