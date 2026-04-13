-- Run this in the Supabase SQL Editor (supabase.co → project → SQL Editor)

-- ─────────────────────────────────────────────
-- TABELA: profiles  (dados do cliente)
-- ─────────────────────────────────────────────
create table if not exists profiles (
  id          uuid references auth.users on delete cascade primary key,
  full_name   text,
  phone       text,
  cpf         text,
  address     jsonb,          -- { rua, numero, complemento, bairro, cidade, estado, cep }
  is_admin    boolean default false,
  updated_at  timestamptz default now()
);

alter table profiles enable row level security;

-- Usuário vê e edita somente o próprio perfil
create policy "Users manage own profile"
  on profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);


-- ─────────────────────────────────────────────
-- TABELA: orders  (pedidos)
-- ─────────────────────────────────────────────
create table if not exists orders (
  id               uuid default gen_random_uuid() primary key,
  user_id          uuid references auth.users on delete set null,
  transaction_id   text unique not null,
  items            jsonb default '[]',
  amount           integer not null,   -- centavos (já com desconto PIX)
  status           text not null default 'pending',
  created_at       timestamptz default now()
);

alter table orders enable row level security;

-- Usuário logado só vê os próprios pedidos
create policy "Users see own orders"
  on orders for select
  using (auth.uid() = user_id);

-- INSERT/UPDATE só via service_role (API do servidor — bypassa RLS automaticamente)


-- ─────────────────────────────────────────────
-- TORNAR UM USUÁRIO ADMIN
-- Substitua o e-mail pelo seu e-mail de admin
-- ─────────────────────────────────────────────
-- update profiles set is_admin = true
-- where id = (select id from auth.users where email = 'SEU_EMAIL_ADMIN@email.com');
