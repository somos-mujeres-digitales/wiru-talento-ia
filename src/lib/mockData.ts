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
  "Cuéntame sobre ti: ¿quién eres, qué estudiaste y por qué quieres trabajar en Caja Cusco?",
  "Cuéntame una experiencia de liderazgo: ¿cómo la resolviste, primero como integrante del equipo y luego como líder?",
  "¿Cómo trabajas en equipo? Dame un ejemplo concreto donde tuvieron una diferencia y cómo llegaron a un acuerdo.",
];

// Detailed interview script — used to render rich, realistic mocks per question
export const MOCK_INTERVIEW_DETAILS = [
  {
    intent: "Romper el hielo + motivación de marca",
    expectedSeconds: [60, 90] as [number, number],
    keywords: ["administración", "atención al cliente", "Caja Cusco", "Cusco", "finanzas", "ahorro"],
    starExpected: false,
    idealAnswer:
      "Soy María Fernanda, egresada de Administración de la UNSAAC. En mis prácticas atendí a más de 200 clientes diarios en una cooperativa local manteniendo 95% de satisfacción. Quiero trabajar en Caja Cusco porque conecto con su misión regional: acercar productos financieros a las familias cusqueñas, especialmente en zonas donde la banca tradicional no llega.",
    followUp: "¿Y por qué Caja Cusco y no un banco más grande como BCP o BBVA?",
    tips: [
      "Empieza con tu nombre y formación en una sola frase.",
      "Conecta tu experiencia con un dato cuantificable (% o número).",
      "Cierra con una razón específica de la empresa, no genérica.",
    ],
  },
  {
    intent: "Liderazgo + autoconciencia (rol dual)",
    expectedSeconds: [90, 150] as [number, number],
    keywords: ["lideré", "equipo", "objetivo", "resultado", "aprendí", "delegué", "coordiné"],
    starExpected: true,
    idealAnswer:
      "(S) En la campaña de ahorro infantil de la cooperativa éramos 4 promotores. (T) La meta era abrir 80 cuentas en 2 semanas. (A) Como integrante propuse usar visitas a colegios; cuando me ascendieron a líder de campaña organicé turnos por zona, métricas diarias y un tablero compartido. (R) Cerramos con 112 cuentas, 40% sobre la meta, y aprendí que delegar con métricas claras motiva más que supervisar.",
    followUp: "¿Qué harías distinto si volvieras a liderar esa campaña hoy?",
    tips: [
      "Usa la estructura STAR: Situación, Tarea, Acción, Resultado.",
      "Menciona el cambio concreto entre tu rol de integrante y de líder.",
      "Cierra siempre con un número o porcentaje.",
    ],
  },
  {
    intent: "Trabajo en equipo + resolución de conflictos",
    expectedSeconds: [75, 120] as [number, number],
    keywords: ["compañero", "diferencia", "escuchar", "acuerdo", "cliente", "propuse"],
    starExpected: true,
    idealAnswer:
      "Con un compañero teníamos enfoques opuestos para atender a un cliente molesto: él quería escalar al supervisor, yo prefería resolver en ventanilla. En vez de imponer, le pedí que me explicara su lógica, expuse la mía y juntos combinamos: yo atendía al cliente mientras él preparaba el escalamiento por si fallaba. Resolvimos en ventanilla y desde entonces aplicamos ese protocolo para casos difíciles.",
    followUp: "¿Cómo manejas a un compañero que no cumple su parte del trabajo?",
    tips: [
      "Describe la diferencia sin culpar al otro.",
      "Muestra que escuchaste antes de proponer.",
      "Termina con un acuerdo o protocolo que quedó instalado.",
    ],
  },
];

// Filler words ("muletillas") detector — used to score live answers
export const SPANISH_FILLERS = [
  "este", "eh", "ehm", "mmm", "o sea", "tipo", "como que", "pues", "bueno",
  "digamos", "ya", "sabes", "no sé", "entonces",
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
