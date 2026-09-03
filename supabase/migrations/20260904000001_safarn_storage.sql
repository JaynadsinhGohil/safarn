-- Safarn Storage Foundation

-- Insert private avatar bucket
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', false)
on conflict (id) do nothing;

-- Ensure RLS is enabled on storage objects (it usually is by default, but we declare it to be explicit)
alter table storage.objects enable row level security;

-- Only authenticated users can upload an avatar to their own folder (folder name = user_id)
create policy "Users can upload their own avatar"
on storage.objects for insert
with check (
  bucket_id = 'avatars' and
  auth.role() = 'authenticated' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can update their own avatar
create policy "Users can update their own avatar"
on storage.objects for update
using (
  bucket_id = 'avatars' and
  auth.role() = 'authenticated' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own avatar
create policy "Users can delete their own avatar"
on storage.objects for delete
using (
  bucket_id = 'avatars' and
  auth.role() = 'authenticated' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can view their own avatar securely
create policy "Users can view their own avatar"
on storage.objects for select
using (
  bucket_id = 'avatars' and
  auth.role() = 'authenticated' and
  (storage.foldername(name))[1] = auth.uid()::text
);
