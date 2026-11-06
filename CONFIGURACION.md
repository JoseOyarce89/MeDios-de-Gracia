# Configuración del sitio MeDios de Gracia

Todas las claves se pegan en **`config.js`**. Ningún otro archivo necesita cambios.

---

## 1. Formularios de Oración y Contacto → Gmail (Web3Forms)

1. Entra a <https://web3forms.com> y haz clic en **Create your Access Key**.
2. Escribe el correo donde quieres recibir los mensajes (por ahora `jose.oyarce.g@gmail.com`).
3. Te llegará un correo con la **Access Key** (algo como `a1b2c3d4-....`).
4. Pégala en `config.js`:
   ```js
   WEB3FORMS_KEY: "a1b2c3d4-....",
   ```

**Cambiar el correo más adelante:** repite los pasos 1 a 4 con el Gmail nuevo de la iglesia y reemplaza la clave.

Límite gratuito: 250 envíos al mes.

### Cómo llegan las peticiones de oración
- Asunto: `🙏 Petición de oración por <nombre>`.
- Si la persona marcó **confidencial**, el asunto dice `🔒 [CONFIDENCIAL]` y **no** incluye el enlace de WhatsApp.
- Si no es confidencial, el correo trae un campo **"Compartir en WhatsApp"**. Al tocar el enlace desde el celular se abre WhatsApp con el mensaje ya redactado (sin los datos de contacto de quien lo envió). Solo hay que elegir el grupo de oración y enviar.

---

## 2. Noticias del pastor (Supabase)

Las noticias se guardan en una base de datos gratuita para que **todos** los visitantes las vean. Solo la cuenta del pastor puede publicar o borrar.

### 2.1 Crear el proyecto
1. Crea una cuenta en <https://supabase.com> y luego un proyecto nuevo (región: *South America (São Paulo)*).
2. Ve a **Project Settings → API** y copia en `config.js`:
   - **Project URL** → `SUPABASE_URL`
   - **anon public key** → `SUPABASE_ANON_KEY`

### 2.2 Crear la tabla y los permisos
Ve a **SQL Editor → New query**, pega todo esto y presiona **Run**:

```sql
-- Tabla de noticias
create table public.noticias (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  titulo text not null,
  contenido text not null,
  imagen_url text,
  imagen_path text,
  imagenes jsonb not null default '[]'::jsonb  -- hasta 15 fotos por noticia
);

alter table public.noticias enable row level security;

-- Cualquier visitante puede LEER las noticias
create policy "Lectura pública" on public.noticias
  for select using (true);

-- Solo usuarios con sesión iniciada (el pastor) pueden publicar y borrar
create policy "Pastor publica" on public.noticias
  for insert to authenticated with check (true);
create policy "Pastor borra" on public.noticias
  for delete to authenticated using (true);

-- Carpeta pública para las imágenes de las noticias
insert into storage.buckets (id, name, public) values ('noticias', 'noticias', true);

create policy "Pastor sube imágenes" on storage.objects
  for insert to authenticated with check (bucket_id = 'noticias');
create policy "Pastor borra imágenes" on storage.objects
  for delete to authenticated using (bucket_id = 'noticias');
```

### 2.3 Crear la cuenta del pastor (y bloquear registros nuevos)
1. **Authentication → Sign In / Providers → Email**: desactiva **"Allow new users to sign up"**.
   Esto es lo que impide que otra persona cree una cuenta.
2. **Authentication → Users → Add user → Create new user**: escribe el correo y la contraseña del pastor y marca **Auto Confirm User**.
3. Con ese correo y esa contraseña se entra a `pastor.html`.

---

## 3. Ministerio de Mujeres (Supabase)

La página pública es `ministerio-mujeres.html` (está en el menú). Las noticias y los encuentros se publican desde `mujeres.html`, con:

- **Usuario:** `pastoramediosdegracia@gmail.com`
- **Contraseña:** `Mediosdegracia.2026`

### 3.1 Crear la tabla, la carpeta de archivos y los permisos
En **SQL Editor → New query**, pega esto y presiona **Run**.
Si cambias el correo de la pastora, reemplaza `pastoramediosdegracia@gmail.com` en todo el bloque (y en `config.js`).

```sql
-- Noticias y encuentros del Ministerio de Mujeres
create table public.mujeres_publicaciones (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  tipo text not null check (tipo in ('noticia', 'encuentro', 'recurso')),
  titulo text not null,
  contenido text not null,
  fecha_evento date,
  imagen_url text,
  imagen_path text,
  imagenes jsonb not null default '[]'::jsonb,  -- hasta 15 fotos por noticia
  pdf_url text,
  pdf_path text,
  pdf_nombre text
);

alter table public.mujeres_publicaciones enable row level security;

-- Cualquier visitante puede LEER
create policy "Lectura pública" on public.mujeres_publicaciones
  for select using (true);

-- Solo la cuenta de la pastora puede publicar y borrar
create policy "Pastora publica" on public.mujeres_publicaciones
  for insert to authenticated
  with check ((auth.jwt() ->> 'email') = 'pastoramediosdegracia@gmail.com');
create policy "Pastora borra" on public.mujeres_publicaciones
  for delete to authenticated
  using ((auth.jwt() ->> 'email') = 'pastoramediosdegracia@gmail.com');

-- Carpeta pública para imágenes y PDF (máx. 10 MB por archivo)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('mujeres', 'mujeres', true, 10485760, array['image/jpeg', 'application/pdf']);

create policy "Pastora sube archivos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'mujeres' and (auth.jwt() ->> 'email') = 'pastoramediosdegracia@gmail.com');
create policy "Pastora borra archivos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'mujeres' and (auth.jwt() ->> 'email') = 'pastoramediosdegracia@gmail.com');
```

### 3.2 Crear la cuenta de la pastora
1. **Authentication → Users → Add user → Create new user**.
2. Correo: `pastoramediosdegracia@gmail.com` (el mismo de `MUJERES_EMAIL` en `config.js`).
3. Contraseña: `Mediosdegracia.2026`. Marca **Auto Confirm User**.
4. Para cambiar la contraseña más adelante: **Authentication → Users → (la cuenta) → Reset password**, o edítala ahí mismo.

### 3.3 Cómo se publica
- En `mujeres.html` se elige la pestaña **Subir Noticias** o **Subir Encuentros**.
- Los encuentros pueden llevar fecha, imagen y un **PDF**; en la página pública aparece el botón **Descargar PDF**.
- La pestaña **Subir Recursos y Guías** pide título, descripción, imagen (opcional) y un **PDF** (obligatorio).
- En `ministerio-mujeres.html` aparecen en orden: Noticias, Encuentros y Recursos y Guías.

### 3.4 Si ya habías creado la tabla antes de agregar "Recursos y Guías"
Ejecuta esto una vez en **SQL Editor** para permitir el nuevo tipo:

```sql
alter table public.mujeres_publicaciones drop constraint mujeres_publicaciones_tipo_check;
alter table public.mujeres_publicaciones
  add constraint mujeres_publicaciones_tipo_check check (tipo in ('noticia', 'encuentro', 'recurso'));
```

### 3.5 Varias fotos por noticia (máximo 15)
En `pastor.html` y en la pestaña **Subir Noticias** de `mujeres.html` se pueden elegir hasta **15 fotos** a la vez; la primera es la portada.
En la página pública, al tocar **Ver más** las fotos aparecen en un carrusel que se desliza con el dedo (o con las flechas).

**Si las tablas ya existían**, ejecuta esto una vez en **SQL Editor** (sin esto, publicar dará error):

```sql
alter table public.noticias
  add column if not exists imagenes jsonb not null default '[]'::jsonb;
alter table public.mujeres_publicaciones
  add column if not exists imagenes jsonb not null default '[]'::jsonb;
```

Las noticias antiguas (con una sola imagen) siguen mostrándose igual.

---

## 4. Botón flotante de WhatsApp (opcional)
En `config.js`, escribe el número solo con dígitos, incluido el código de país:
```js
WHATSAPP_NUMERO: "56912345678",
```
Si queda vacío, el botón no aparece.

---

## 5. Publicar el sitio
Sube la carpeta a **Netlify** (arrastrar y soltar en <https://app.netlify.com/drop>) o a **GitHub Pages**. Ambos son gratuitos.
`pastor.html` y `mujeres.html` quedan en `tu-sitio/pastor.html` y `tu-sitio/mujeres.html`. No están enlazadas desde el menú y están marcadas para que Google no las muestre.
