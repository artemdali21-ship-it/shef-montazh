# Настройка Supabase Storage Bucket

## Инструкция по созданию bucket для загрузки фото профилей

1. Открой Supabase Dashboard: https://supabase.com/dashboard

2. Выбери свой проект (`felookybqmganfvpnpnq`)

3. В левом меню перейди в **Storage**

4. Нажми **"New bucket"** (или "+ Create bucket")

5. Заполни форму:
   - **Name**: `avatars` (обязательно именно `avatars`!)
   - **Public bucket**: ВКЛЮЧИ (поставь галочку) - это важно для публичного доступа к фото
   - **File size limit**: можно оставить по умолчанию или поставить 2MB
   - **Allowed MIME types**: `image/jpeg,image/png,image/webp` (или оставь пустым для всех типов)

6. Нажми **"Create bucket"**

7. После создания bucket, нужно настроить RLS политики:
   - Кликни на созданный bucket `avatars`
   - Перейди в раздел **"Policies"**
   - Нажми **"New Policy"**
   - Выбери **"For full customization"**

   **Политика 1: Чтение (SELECT)**
   - Policy name: `Public avatars read`
   - Target roles: `public`
   - WITH CHECK expression: `true`
   - Нажми **"Review"** и **"Save policy"**

   **Политика 2: Загрузка (INSERT)**
   - Policy name: `Users can upload their own avatars`
   - Target roles: `authenticated`
   - WITH CHECK expression: `bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text`
   - Нажми **"Review"** и **"Save policy"**

   **Политика 3: Обновление (UPDATE)**
   - Policy name: `Users can update their own avatars`
   - Target roles: `authenticated`
   - USING expression: `(storage.foldername(name))[1] = auth.uid()::text`
   - WITH CHECK expression: `(storage.foldername(name))[1] = auth.uid()::text`
   - Нажми **"Review"** и **"Save policy"**

8. Готово! Теперь загрузка фото профиля будет работать.

## Проверка

После настройки bucket, перезагрузи страницу профиля и попробуй загрузить фото. Ошибка "Bucket not found" должна исчезнуть.
