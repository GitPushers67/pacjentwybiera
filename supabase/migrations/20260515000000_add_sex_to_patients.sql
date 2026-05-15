alter table patients
  add column if not exists sex text check (sex in ('female', 'male'));
