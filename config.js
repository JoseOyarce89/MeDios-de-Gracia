// ==========================================================================
// CONFIGURACIÓN DEL SITIO (único archivo que hay que editar para las claves)
// Instrucciones paso a paso en CONFIGURACION.md
// ==========================================================================

const CONFIG = {
  // Web3Forms: la clave define a qué Gmail llegan los formularios.
  // Para cambiar el correo, genera una clave nueva en https://web3forms.com
  WEB3FORMS_KEY: "2c354568-db2f-422d-8254-af2b87757f53",

  // Supabase: base de datos donde el pastor publica las noticias.
  // (Project Settings → API). La "anon key" es pública, se puede dejar aquí.
  SUPABASE_URL: "https://cahahbvnpiqejrfmjpwr.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_8x0lRaKwOLtUTBfLz_sFMw_OxfNqZZk",

  // Número de WhatsApp para el botón flotante, solo dígitos con código país
  // (ej: "56912345678"). Si se deja vacío, el botón no se muestra.
  WHATSAPP_NUMERO: ""
};
