-- Run this in your Supabase SQL editor

-- Enable auth (already enabled by default in Supabase)

-- Sites table
create table if not exists sites (
  id          bigint primary key,
  user_id     uuid references auth.users(id) on delete cascade,
  name        text not null,
  tagline     text,
  type        text,
  location    text,
  price       text,
  theme       text,
  slug        text,
  url         text,
  html        text,
  form_data   jsonb,
  sel_amns    text[],
  c_plans     jsonb,
  versions    jsonb default '[]',
  published   boolean default false,
  views       int default 0,
  joins       int default 0,
  created_at  timestamptz default now()
);

-- Row level security
alter table sites enable row level security;

create policy "Users can manage their own sites"
  on sites for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Published sites visible to everyone
create policy "Published sites are public"
  on sites for select
  using (published = true);

-- Increment views safely
create or replace function increment_views(site_id bigint)
returns void as $$
  update sites set views = views + 1 where id = site_id;
$$ language sql security definer;
