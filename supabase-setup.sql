-- Run this in the Supabase SQL Editor (supabase.co → project → SQL Editor)

create table if not exists orders (
  id               uuid default gen_random_uuid() primary key,
  user_id          uuid references auth.users on delete set null,
  transaction_id   text unique not null,
  items            jsonb default '[]',
  amount           integer not null,   -- centavos
  status           text not null default 'pending',
  created_at       timestamptz default now()
);

-- Only the user can see their own orders (Row Level Security)
alter table orders enable row level security;

create policy "Users see own orders"
  on orders for select
  using (auth.uid() = user_id);

-- Service role can insert/update (used by API functions)
create policy "Service role full access"
  on orders for all
  using (true)
  with check (true);
