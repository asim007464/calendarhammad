-- Storage bucket for activity images and logos

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'activity-images',
  'activity-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read activity images" on storage.objects;
create policy "Public read activity images"
  on storage.objects for select
  using (bucket_id = 'activity-images');

drop policy if exists "Allow activity image uploads" on storage.objects;
create policy "Allow activity image uploads"
  on storage.objects for insert
  with check (bucket_id = 'activity-images');

drop policy if exists "Allow activity image updates" on storage.objects;
create policy "Allow activity image updates"
  on storage.objects for update
  using (bucket_id = 'activity-images');

drop policy if exists "Allow activity image deletes" on storage.objects;
create policy "Allow activity image deletes"
  on storage.objects for delete
  using (bucket_id = 'activity-images');
