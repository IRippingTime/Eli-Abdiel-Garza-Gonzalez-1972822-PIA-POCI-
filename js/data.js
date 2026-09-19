/* Datos de ejemplo para el prototipo (simulan la futura base de datos MySQL) */

const CATEGORIAS = [
  { id: 1, nombre: "IT & Software", descripcion: "Programacion, bases de datos, redes y nube.", creador: "admin", fecha_creacion: "2026-08-10 09:00:00" },
  { id: 2, nombre: "Marketing", descripcion: "Marketing digital, SEO y redes sociales.", creador: "admin", fecha_creacion: "2026-08-10 09:15:00" },
  { id: 3, nombre: "Design", descripcion: "Diseno grafico, UI/UX y animacion.", creador: "admin", fecha_creacion: "2026-08-11 10:00:00" },
  { id: 4, nombre: "Negocios", descripcion: "Emprendimiento, finanzas y gestion.", creador: "admin", fecha_creacion: "2026-08-12 11:00:00" },
  { id: 5, nombre: "Idiomas", descripcion: "Ingles y otros idiomas para profesionales.", creador: "admin", fecha_creacion: "2026-08-12 12:00:00" },
  { id: 6, nombre: "Fotografia", descripcion: "Fotografia digital y edicion.", creador: "admin", fecha_creacion: "2026-08-13 08:30:00" }
];

const CURSOS = [
  {
    id: 101, titulo: "PHP desde Cero con POO y MVC", categoria_id: 1, categoria: "IT & Software",
    instructor: "Instructor 1", precio: 899.00, gratis: false, niveles: 5,
    nivel: "Intermedio", duracion: "18 horas",
    rating: 4.8, vendidos: 320, fecha_publicacion: "2026-08-15",
    activo: true, descripcion: "Aprende PHP puro, programacion orientada a objetos y patron MVC con proyecto real.",
    imagen_clase: "cat-1",
    imagen: "../img/curso-php.svg"
  },
  {
    id: 102, titulo: "JavaScript Moderno y Fetch API", categoria_id: 1, categoria: "IT & Software",
    instructor: "Instructor 1", precio: 0.00, gratis: true, niveles: 4,
    nivel: "Principiante", duracion: "12 horas",
    rating: 4.9, vendidos: 510, fecha_publicacion: "2026-08-20",
    activo: true, descripcion: "DOM, promesas, fetch y consumo de APIs REST con validaciones del lado del cliente.",
    imagen_clase: "cat-5",
    imagen: "../img/curso-js.svg"
  },
  {
    id: 103, titulo: "Marketing Digital para Creadores", categoria_id: 2, categoria: "Marketing",
    instructor: "Instructor 2", precio: 599.00, gratis: false, niveles: 3,
    nivel: "Principiante", duracion: "9 horas",
    rating: 4.6, vendidos: 210, fecha_publicacion: "2026-09-01",
    activo: true, descripcion: "Estrategia de contenidos, embudos y campanas en redes sociales.",
    imagen_clase: "cat-2",
    imagen: "../img/curso-marketing.svg"
  },
  {
    id: 104, titulo: "Diseno UI con Figma", categoria_id: 3, categoria: "Design",
    instructor: "Instructor 2", precio: 749.00, gratis: false, niveles: 4,
    nivel: "Intermedio", duracion: "14 horas",
    rating: 4.7, vendidos: 180, fecha_publicacion: "2026-09-05",
    activo: true, descripcion: "Fundamentos UI/UX, prototipado y sistema de diseno en Figma.",
    imagen_clase: "cat-3",
    imagen: "../img/curso-figma.svg"
  },
  {
    id: 105, titulo: "Ingles Tecnico para TI", categoria_id: 5, categoria: "Idiomas",
    instructor: "Instructor 1", precio: 0.00, gratis: true, niveles: 6,
    nivel: "Todos los niveles", duracion: "20 horas",
    rating: 4.5, vendidos: 400, fecha_publicacion: "2026-07-28",
    activo: true, descripcion: "Vocabulario tecnico, entrevistas y documentacion en ingles.",
    imagen_clase: "cat-4",
    imagen: "../img/curso-ingles.svg"
  },
  {
    id: 106, titulo: "Fotografia Digital Basica", categoria_id: 6, categoria: "Fotografia",
    instructor: "Instructor 2", precio: 499.00, gratis: false, niveles: 3,
    nivel: "Principiante", duracion: "8 horas",
    rating: 4.4, vendidos: 95, fecha_publicacion: "2026-06-10",
    activo: false, descripcion: "Curso dado de baja logica. Solo visible en reportes y kardex. No aparece en busquedas.",
    imagen_clase: "cat-6",
    imagen: "../img/curso-foto.svg"
  }
];

/* Rutas de aprendizaje estilo Pluralsight: agrupan cursos por objetivo profesional */
const RUTAS = [
  { nombre: "Desarrollo Web Full-Stack", descripcion: "De HTML a backend con PHP y APIs REST.", cursos: 3, horas: "44 horas", nivel: "Principiante a Avanzado", clase: "cat-1", imagen: "../img/curso-php.svg" },
  { nombre: "Marketing para Creadores", descripcion: "Contenido, redes y campanas que venden.", cursos: 2, horas: "23 horas", nivel: "Principiante a Intermedio", clase: "cat-2", imagen: "../img/curso-marketing.svg" },
  { nombre: "Diseno UI Profesional", descripcion: "UI/UX con Figma y sistemas de diseno.", cursos: 2, horas: "26 horas", nivel: "Intermedio", clase: "cat-3", imagen: "../img/curso-figma.svg" }
];

function formatoMoneda(valor) {
  return "$" + Number(valor).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatoFecha(fechaISO) {
  const meses = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  const d = new Date(fechaISO);
  if (isNaN(d)) return fechaISO;
  return d.getDate() + " " + meses[d.getMonth()] + " " + d.getFullYear();
}
