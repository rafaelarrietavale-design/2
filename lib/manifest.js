/* ============================================================================
   TATU TRAVEL — datos de marca (window.__BRAND__)
   Editá acá el contacto real (WhatsApp, email, Instagram) y se propaga a todo
   el sitio: botón flotante, CTAs por destino, formulario y footer.
   ========================================================================== */
window.__BRAND__ = {
  name: "Tatu Travel",

  /* ----- CONTACTO (reemplazá por los datos reales) ----- */
  contact: {
    // Número de WhatsApp en formato internacional, solo dígitos (sin + ni espacios).
    // Ej: Argentina 54 9 11 2345 6789 -> "5491123456789"
    whatsapp: "5493543631125",
    whatsappDisplay: "+54 3543 63-1125",
    email: "hola@tatutravel.com",    // (ejemplo — reemplazar por el real)
    instagram: "tatu.travel",        // sin @ (ejemplo — reemplazar por el real)
    city: "Córdoba · Argentina",
  },

  /* Mensaje base para WhatsApp */
  waGreeting: "¡Hola Tatu Travel! Quiero información para viajar a Brasil",

  /* ----- DESTINOS (para el selector del formulario y CTAs) ----- */
  destinations: [
    { id: "rio",      name: "Rio de Janeiro",  region: "Rio de Janeiro" },
    { id: "pipa",     name: "Pipa",            region: "Rio Grande do Norte" },
    { id: "floripa",  name: "Florianópolis",   region: "Santa Catarina" },
    { id: "maranhao", name: "Maranhão",        region: "Lençóis Maranhenses" },
    { id: "abierto",  name: "Todavía no lo decidí", region: "" },
  ],
};

/* Alias temático (mismo objeto) */
window.__TATU__ = window.__BRAND__;
