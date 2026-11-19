-- Run once in Supabase: SQL Editor > New query > paste > Run.
create table public.profiles (id uuid primary key references auth.users on delete cascade, role text not null default 'member' check (role in ('member','admin')));
create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin insert into public.profiles (id) values (new.id); return new; end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
create function public.is_admin() returns boolean language sql security definer stable set search_path = public as $$
select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') $$;
create table public.documents (id bigint generated always as identity primary key, title text not null, description text default '', category text not null, version text not null,
 access text not null default 'members' check (access in ('public','members')), file_path text not null unique, file_name text not null, size_bytes bigint, uploaded_at timestamptz default now());
alter table public.profiles enable row level security;
alter table public.documents enable row level security;
create policy "read own profile" on public.profiles for select using (id = auth.uid());
create policy "read documents" on public.documents for select using (access = 'public' or auth.uid() is not null);
create policy "admin insert documents" on public.documents for insert with check (public.is_admin());
create policy "admin update documents" on public.documents for update using (public.is_admin());
create policy "admin delete documents" on public.documents for delete using (public.is_admin());
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values ('resources','resources',false,20971520, array[
 'application/pdf','application/msword','application/vnd.ms-excel',
 'application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.openxmlformats-officedocument.presentationml.presentation']) on conflict (id) do nothing;
create policy "read files" on storage.objects for select using (bucket_id = 'resources' and (auth.uid() is not null or exists (select 1 from public.documents d where d.file_path = name and d.access = 'public')));
create policy "admin upload files" on storage.objects for insert with check (bucket_id = 'resources' and public.is_admin());
create policy "admin delete files" on storage.objects for delete using (bucket_id = 'resources' and public.is_admin());
-- After creating YOUR user in Authentication > Users, make yourself administrator (change the email):
-- update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'you@example.com');
