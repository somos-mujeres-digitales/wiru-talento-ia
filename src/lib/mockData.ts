export const MOCK_USER = {
  name: "María Fernanda",
  fullName: "María Fernanda Quispe",
  email: "maria.quispe@gmail.com",
  location: "Cusco",
  stage: "Recién egresada",
  career: "Administración",
  sectors: ["Sector financiero", "Retail y comercio"],
};

export const MOCK_TARGET = {
  role: "Ejecutiva de Atención al Cliente",
  company: "Caja Cusco",
};

export const MOCK_COMPANIES = [
  "Caja Cusco", "BCP", "BBVA", "Scotiabank", "Marriott",
  "Casa Andina", "Plaza Vea", "LATAM", "Sodimac",
];

export const MOCK_CV_SCORE = {
  total: 71,
  categories: [
    { name: "Resumen profesional", score: 91, status: "good" as const },
    { name: "Educación", score: 85, status: "good" as const },
    { name: "Experiencia laboral", score: 78, status: "warn" as const },
    { name: "Habilidades", score: 70, status: "warn" as const },
    { name: "Contacto", score: 40, status: "bad" as const },
  ],
  recommendations: [
    {
      type: "warning" as const,
      title: "Agrega LinkedIn y teléfono con prefijo +51",
      detail: "Falta tu LinkedIn y el prefijo internacional para que reclutadores te ubiquen rápido.",
    },
    {
      type: "warning" as const,
      title: "Cuantifica tu impacto laboral",
      detail: "'Atendí 200+ clientes diarios' pesa más que 'atendí clientes'.",
    },
    {
      type: "success" as const,
      title: "Resumen profesional sólido",
      detail: "Liderazgo y orientación al cliente — exactamente lo que busca Caja Cusco.",
    },
  ],
  improvedSummary:
    "Egresada de Administración con experiencia liderando equipos de atención al cliente y enfoque en resultados. Atendí más de 200 clientes diarios manteniendo 95% de satisfacción. Apasionada por el sector financiero y el desarrollo de productos accesibles para Cusco.",
};

export const MOCK_VACANCIES = [
  {
    id: "1",
    company: "Caja Cusco",
    role: "Ejecutiva de Atención al Cliente",
    description: "Atención presencial en agencias del Cusco. Asesoría de productos de ahorro y crédito.",
    requirements: ["Atención al cliente", "Manejo de Excel", "Trato amable"],
    location: "Cusco — Plaza de Armas",
    closing: "15 MAY",
    match: 74,
    locked: false,
  },
  {
    id: "2",
    company: "BCP",
    role: "Promotora de Ventas",
    description: "Promoción de productos financieros en agencias y campañas externas.",
    requirements: ["Ventas", "Comunicación", "Proactividad"],
    location: "Cusco — Av. El Sol",
    closing: "20 MAY",
    match: 68,
    locked: true,
  },
  {
    id: "3",
    company: "BBVA",
    role: "Asesora Comercial",
    description: "Atención y venta de productos bancarios a clientes premium.",
    requirements: ["Trato premium", "Banca personal", "Inglés básico"],
    location: "Cusco — Wanchaq",
    closing: "30 MAY",
    match: 61,
    locked: true,
  },
  {
    id: "4",
    company: "Scotiabank",
    role: "Analista Junior",
    description: "Análisis de cartera de clientes y soporte al equipo de riesgos.",
    requirements: ["Excel avanzado", "Análisis de datos", "Banca"],
    location: "Cusco — San Sebastián",
    closing: "05 JUN",
    match: 54,
    locked: true,
  },
];

export type ApplicationStatus = "applied" | "review" | "interview" | "offer" | "rejected";

export const MOCK_APPLICATIONS: Array<{
  id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  appliedAgo: string;
  nextAction: string;
  match: number;
  initials: string;
  color: string;
}> = [
  {
    id: "a1",
    company: "Caja Cusco",
    role: "Ejecutiva de Atención al Cliente",
    status: "review",
    appliedAgo: "hace 5 días",
    nextAction: "Hacer seguimiento · 3 días",
    match: 74,
    initials: "CC",
    color: "oklch(0.72 0.18 47)",
  },
  {
    id: "a2",
    company: "Casa Andina",
    role: "Recepcionista bilingüe",
    status: "applied",
    appliedAgo: "hace 2 días",
    nextAction: "Esperando respuesta",
    match: 66,
    initials: "CA",
    color: "oklch(0.65 0.16 230)",
  },
  {
    id: "a3",
    company: "Plaza Vea",
    role: "Anfitriona de tienda",
    status: "interview",
    appliedAgo: "hace 9 días",
    nextAction: "Entrevista el viernes",
    match: 71,
    initials: "PV",
    color: "oklch(0.7 0.17 145)",
  },
  {
    id: "a4",
    company: "BCP",
    role: "Promotora de Ventas",
    status: "applied",
    appliedAgo: "hace 1 día",
    nextAction: "Esperando respuesta",
    match: 68,
    initials: "BC",
    color: "oklch(0.78 0.16 70)",
  },
];

export const MOCK_INTERVIEW_QUESTIONS = [
  "Cuéntame sobre ti y por qué quieres trabajar en Caja Cusco.",
  "¿Cómo manejarías a un cliente molesto que lleva 30 minutos esperando?",
  "Describe una situación donde tuvieras que trabajar bajo presión.",
  "¿Qué sabes sobre los productos de Caja Cusco?",
  "¿Dónde te ves en 2 años dentro de la empresa?",
];

export const SECTORS = [
  { id: "fin", icon: "🏦", title: "Sector financiero", subtitle: "Bancos, cajas, financieras" },
  { id: "tur", icon: "🏨", title: "Turismo y hotelería", subtitle: "Hoteles, restaurantes, agencias" },
  { id: "ret", icon: "🏪", title: "Retail y comercio", subtitle: "Tiendas, supermercados, ventas" },
  { id: "sal", icon: "🏥", title: "Salud", subtitle: "Clínicas, farmacias, laboratorios" },
  { id: "pub", icon: "🏛️", title: "Sector público", subtitle: "Municipalidades, gobiernos regionales" },
  { id: "tec", icon: "💻", title: "Tecnología", subtitle: "Startups, empresas de software" },
];

export const STAGES = [
  { id: "est", title: "Estudiante", subtitle: "Cursando carrera universitaria o técnica" },
  { id: "egr", title: "Recién egresado", subtitle: "Menos de 2 años desde que terminé" },
  { id: "exp", title: "Con experiencia", subtitle: "Tengo experiencia laboral activa" },
  { id: "cam", title: "Cambio de carrera", subtitle: "Busco un nuevo rubro" },
];
