-- migration: 20251008000000_initial_schema
-- description: creates initial database schema including folders and flashcards tables with rls policies
-- author: github copilot
-- tables affected: folders, flashcards
-- notes: 
--   - tables are protected by rls policies
--   - auth.users table is managed by supabase auth
--   - cascade deletion is enabled for folders->flashcards relationship

-- create folders table
create table public.folders (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) not null,
    name varchar not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    -- ensure folder names are unique per user
    constraint folders_user_name_unique unique (user_id, name)
);

-- create index on user_id for better query performance
create index folders_user_id_idx on public.folders(user_id);

-- enable rls on folders table
alter table public.folders enable row level security;

-- create flashcards table
create table public.flashcards (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) not null,
    folder_id uuid references public.folders(id) on delete cascade not null,
    front varchar(200) not null,
    back varchar(500) not null,
    generation_source text not null check (generation_source in ('ai', 'manual')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- create indexes for better query performance
create index flashcards_user_id_idx on public.flashcards(user_id);
create index flashcards_folder_id_idx on public.flashcards(folder_id);

-- enable rls on flashcards table
alter table public.flashcards enable row level security;

-- folders rls policies

-- select policy for authenticated users
create policy "authenticated users can view their folders"
    on public.folders
    for select
    to authenticated
    using (auth.uid() = user_id);

-- select policy for anonymous users (deny all)
create policy "anonymous users cannot view folders"
    on public.folders
    for select
    to anon
    using (false);

-- insert policy for authenticated users
create policy "authenticated users can create folders"
    on public.folders
    for insert
    to authenticated
    with check (auth.uid() = user_id);

-- insert policy for anonymous users (deny all)
create policy "anonymous users cannot create folders"
    on public.folders
    for insert
    to anon
    with check (false);

-- update policy for authenticated users
create policy "authenticated users can update their folders"
    on public.folders
    for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- update policy for anonymous users (deny all)
create policy "anonymous users cannot update folders"
    on public.folders
    for update
    to anon
    using (false);

-- delete policy for authenticated users
create policy "authenticated users can delete their folders"
    on public.folders
    for delete
    to authenticated
    using (auth.uid() = user_id);

-- delete policy for anonymous users (deny all)
create policy "anonymous users cannot delete folders"
    on public.folders
    for delete
    to anon
    using (false);

-- flashcards rls policies

-- select policy for authenticated users
create policy "authenticated users can view their flashcards"
    on public.flashcards
    for select
    to authenticated
    using (auth.uid() = user_id);

-- select policy for anonymous users (deny all)
create policy "anonymous users cannot view flashcards"
    on public.flashcards
    for select
    to anon
    using (false);

-- insert policy for authenticated users
create policy "authenticated users can create flashcards"
    on public.flashcards
    for insert
    to authenticated
    with check (auth.uid() = user_id);

-- insert policy for anonymous users (deny all)
create policy "anonymous users cannot create flashcards"
    on public.flashcards
    for insert
    to anon
    with check (false);

-- update policy for authenticated users
create policy "authenticated users can update their flashcards"
    on public.flashcards
    for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- update policy for anonymous users (deny all)
create policy "anonymous users cannot update flashcards"
    on public.flashcards
    for update
    to anon
    using (false);

-- delete policy for authenticated users
create policy "authenticated users can delete their flashcards"
    on public.flashcards
    for delete
    to authenticated
    using (auth.uid() = user_id);

-- delete policy for anonymous users (deny all)
create policy "anonymous users cannot delete flashcards"
    on public.flashcards
    for delete
    to anon
    using (false);

-- create trigger functions to automatically update updated_at timestamps
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

-- create triggers for folders table
create trigger set_timestamp_folders
    before update on public.folders
    for each row
    execute function public.handle_updated_at();

-- create triggers for flashcards table
create trigger set_timestamp_flashcards
    before update on public.flashcards
    for each row
    execute function public.handle_updated_at();

-- add comment descriptions to tables and columns
comment on table public.folders is 'User folders for organizing flashcards';
comment on column public.folders.id is 'Unique identifier for the folder';
comment on column public.folders.user_id is 'Reference to the auth.users table';
comment on column public.folders.name is 'Name of the folder';
comment on column public.folders.created_at is 'Timestamp when the folder was created';
comment on column public.folders.updated_at is 'Timestamp when the folder was last updated';

comment on table public.flashcards is 'User flashcards stored within folders';
comment on column public.flashcards.id is 'Unique identifier for the flashcard';
comment on column public.flashcards.user_id is 'Reference to the auth.users table';
comment on column public.flashcards.folder_id is 'Reference to the folders table';
comment on column public.flashcards.front is 'Front side content of the flashcard';
comment on column public.flashcards.back is 'Back side content of the flashcard';
comment on column public.flashcards.generation_source is 'Source of the flashcard content (ai or manual)';
comment on column public.flashcards.created_at is 'Timestamp when the flashcard was created';
comment on column public.flashcards.updated_at is 'Timestamp when the flashcard was last updated';