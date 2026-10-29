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
  imagen_path text
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

## 3. Botón flotante de WhatsApp (opcional)
En `config.js`, escribe el número solo con dígitos, incluido el código de país:
```js
WHATSAPP_NUMERO: "56912345678",
```
Si queda vacío, el botón no aparece.

---

## 4. Publicar el sitio
Sube la carpeta a **Netlify** (arrastrar y soltar en <https://app.netlify.com/drop>) o a **GitHub Pages**. Ambos son gratuitos.
`pastor.html` queda en `tu-sitio/pastor.html`. No está enlazada desde el menú y está marcada para que Google no la muestre.
