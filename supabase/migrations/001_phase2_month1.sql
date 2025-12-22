-- Create notices table
create table if not exists public.notices (
  id uuid not null default gen_random_uuid(),
  title text not null,
  content text not null,
  category text not null check (category in ('Maintenance', 'Events', 'Emergency', 'General')),
  urgent boolean default false,
  published_date timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint notices_pkey primary key (id)
);

-- RLS for notices
alter table public.notices enable row level security;
create policy "Notices are viewable by everyone" on public.notices for select using (true);

-- Create events table
create table if not exists public.events (
  id uuid not null default gen_random_uuid(),
  title text not null,
  description text,
  date date not null,
  time text,
  location text,
  image_url text,
  google_calendar_event_id text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint events_pkey primary key (id)
);

-- RLS for events
alter table public.events enable row level security;
create policy "Events are viewable by everyone" on public.events for select using (true);

-- Create documents table
create table if not exists public.documents (
  id uuid not null default gen_random_uuid(),
  title text not null,
  category text not null,
  google_drive_id text,
  google_drive_url text,
  description text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint documents_pkey primary key (id)
);

-- RLS for documents
alter table public.documents enable row level security;
create policy "Documents are viewable by everyone" on public.documents for select using (true);

-- Create audit_logs table
create table if not exists public.audit_logs (
  id uuid not null default gen_random_uuid(),
  admin_email text,
  action text not null,
  resource text not null,
  details jsonb, 
  created_at timestamp with time zone default now(),
  constraint audit_logs_pkey primary key (id)
);

-- RLS for audit_logs (Private - Admin only)
alter table public.audit_logs enable row level security;
-- No public policies, accessible only via service role
