(function () {
  "use strict";

  window.__BRAND__ = {
    name: "Sabai",
    thai: "สบาย",
    tagline: "Cocina tailandesa · Madrid",
    location: "Calle de Jorge Juan 18 · Barrio de Salamanca, Madrid",

    contact: {
      phone: "+34 910 24 88 51",
      email: "hola@sabaimadrid.es",
      address: "Calle de Jorge Juan 18, 28001 Madrid",
      metro: "Metro Serrano · L4",
    },

    hours: [
      { d: "Martes — Jueves", h: "13:30 – 16:00 · 20:00 – 23:30" },
      { d: "Viernes — Sábado", h: "13:30 – 16:30 · 20:00 – 00:30" },
      { d: "Domingo", h: "13:30 – 16:30" },
      { d: "Lunes", h: "Cerrado" },
    ],

    // Cada plato apunta a un símbolo SVG dibujado a mano (assets inline).
    dishes: [
      { id: "phad-thai", glyph: "sym-noodles", cat: "Wok", th: "ผัดไทย", name: "Phad Thai Goong", desc: "Fideos de arroz salteados al wok con gambas, tamarindo, cebolleta y cacahuete tostado.", price: "16" },
      { id: "green-curry", glyph: "sym-curry", cat: "Curry", th: "แกงเขียวหวาน", name: "Kaeng Khiao Wan", desc: "Curry verde de pollo de corral, berenjena tailandesa, albahaca sagrada y leche de coco.", price: "17" },
      { id: "tom-yum", glyph: "sym-soup", cat: "Sopa", th: "ต้มยำกุ้ง", name: "Tom Yum Goong", desc: "Sopa picante y ácida de gambas, lemongrass, galanga y hoja de lima kaffir.", price: "14" },
      { id: "som-tam", glyph: "sym-mortar", cat: "Fresco", th: "ส้มตำ", name: "Som Tam", desc: "Ensalada de papaya verde majada al mortero con judía larga, tomate, cacahuete y lima.", price: "12" },
      { id: "satay", glyph: "sym-skewer", cat: "Brasa", th: "สะเต๊ะไก่", name: "Satay Gai", desc: "Brochetas de pollo marinado en cúrcuma y coco, con salsa de cacahuete y encurtido.", price: "11" },
      { id: "spring-rolls", glyph: "sym-rolls", cat: "Fresco", th: "ปอเปี๊ยะสด", name: "Poh Pia Sod", desc: "Rollitos frescos de verdura crujiente y hierbas, con salsa agridulce de tamarindo.", price: "10" },
      { id: "massaman", glyph: "sym-star", cat: "Curry", th: "มัสมั่นเนื้อ", name: "Massaman Nuea", desc: "Curry massaman de ternera cocinado a fuego lento con patata, cacahuete y especias.", price: "19" },
      { id: "mango-rice", glyph: "sym-mango", cat: "Dulce", th: "ข้าวเหนียวมะม่วง", name: "Khao Niao Mamuang", desc: "Mango maduro con arroz glutinoso templado y crema de leche de coco.", price: "8" },
    ],

    ticker: ["ผัดไทย", "Phad Thai", "ต้มยำ", "Tom Yum", "แกงเขียวหวาน", "Curry Verde", "ส้มตำ", "Som Tam", "สะเต๊ะ", "Satay", "มะม่วง", "Mango Sticky Rice"],

    stats: [
      { n: "2014", suf: "", l: "Cocinando Bangkok en Madrid desde" },
      { n: "38", suf: "", l: "Recetas de las cuatro regiones" },
      { n: "4.8", suf: " ★", l: "Valoración media de la casa" },
      { n: "9", suf: "", l: "Hierbas frescas importadas cada semana" },
    ],

    testimonials: [
      { q: "El Tom Yum más honesto que he tomado fuera de Chiang Mai. Picante que abraza, no que castiga.", a: "El Comidista" },
      { q: "Un pedazo de Bangkok en el Barrio de Salamanca. Producto serio y sala que trata bien.", a: "Guía Macarfi" },
    ],
  };
})();
