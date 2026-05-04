export type CandidateRecommendation = "alto-potencial" | "apto" | "en-desarrollo";

export interface CompanyCandidate {
  id: string;
  name: string;
  initials: string;
  color: string;
  role: string;
  location: string;
  sector: string;
  match: number;
  score: {
    total: number;
    claridad: number;
    confianza: number;
    estructura: number;
    tecnico: number;
  };
  skills: string[];
  softSkills: string[];
  strengths: string[];
  weaknesses: string[];
  recommendation: CandidateRecommendation;
  cvSummary: string;
  interview: {
    duration: string;
    questions: { q: string; transcript: string; score: number }[];
  };
  status: "nuevo" | "revisado" | "invitado" | "contratado";
  available: boolean;
}

export const COMPANY_CANDIDATES: CompanyCandidate[] = [
  {
    id: "c1",
    name: "María Fernanda Quispe",
    initials: "MQ",
    color: "oklch(0.72 0.18 47)",
    role: "Ejecutiva de Atención al Cliente",
    location: "Cusco — Wanchaq",
    sector: "Finanzas",
    match: 94,
    score: { total: 91, claridad: 92, confianza: 88, estructura: 90, tecnico: 86 },
    skills: ["Excel avanzado", "CRM", "Atención al cliente", "Ventas"],
    softSkills: ["Liderazgo", "Comunicación", "Empatía"],
    strengths: ["Respuestas estructuradas con método STAR", "Alto nivel de confianza vocal", "Experiencia previa en banca"],
    weaknesses: ["Inglés intermedio (no avanzado)"],
    recommendation: "alto-potencial",
    cvSummary: "Egresada de Administración con 1.5 años atendiendo +200 clientes/día en cooperativa local.",
    interview: {
      duration: "12:34",
      questions: [
        { q: "Cuéntame sobre ti", transcript: "Soy María, egresada de Administración de la UNSAAC. Durante mi último año trabajé en una cooperativa atendiendo clientes...", score: 92 },
        { q: "Experiencia de liderazgo", transcript: "Lideré un equipo de 4 promotores en una campaña de ahorro infantil. Como integrante, propuse ideas; como líder organicé turnos y métricas.", score: 89 },
        { q: "Trabajo en equipo", transcript: "Tuvimos una diferencia con mi compañero sobre cómo abordar a un cliente difícil. Propusimos cada uno nuestro enfoque, lo combinamos y cerramos la venta.", score: 90 },
      ],
    },
    status: "nuevo",
    available: true,
  },
  {
    id: "c2",
    name: "Carlos Huamán Roca",
    initials: "CH",
    color: "oklch(0.65 0.16 230)",
    role: "Recepcionista Bilingüe",
    location: "Cusco — Centro Histórico",
    sector: "Hotelería",
    match: 88,
    score: { total: 84, claridad: 86, confianza: 82, estructura: 80, tecnico: 88 },
    skills: ["Inglés C1", "Opera PMS", "Reservas", "Quechua"],
    softSkills: ["Servicio", "Paciencia", "Trilingüe"],
    strengths: ["Inglés fluido demostrado en simulación", "Conocimiento cultural local"],
    weaknesses: ["Poca experiencia en hoteles 5★"],
    recommendation: "apto",
    cvSummary: "Técnico en hotelería, 1 año en hostal boutique. Habla quechua, español e inglés.",
    interview: {
      duration: "10:12",
      questions: [
        { q: "Cuéntame sobre ti", transcript: "Soy Carlos, técnico en hotelería del CENFOTUR. Trabajé un año recibiendo turistas extranjeros...", score: 85 },
        { q: "Experiencia de liderazgo", transcript: "Cubrí al jefe de recepción durante una semana. Tuve que coordinar el check-in de 3 grupos simultáneos.", score: 82 },
        { q: "Trabajo en equipo", transcript: "Con la mucama tuvimos una confusión de habitaciones. Acordamos un protocolo de doble verificación.", score: 84 },
      ],
    },
    status: "revisado",
    available: true,
  },
  {
    id: "c3",
    name: "Lucía Mamani Choque",
    initials: "LM",
    color: "oklch(0.7 0.17 145)",
    role: "Promotora de Ventas",
    location: "Cusco — San Sebastián",
    sector: "Retail",
    match: 81,
    score: { total: 78, claridad: 80, confianza: 76, estructura: 75, tecnico: 80 },
    skills: ["Ventas", "Manejo de caja", "Inventarios"],
    softSkills: ["Energía", "Persuasión"],
    strengths: ["Cierre de ventas natural", "Tolerancia a presión"],
    weaknesses: ["Estructura de respuestas mejorable", "Sin manejo de Excel"],
    recommendation: "apto",
    cvSummary: "Estudiante de Marketing, 8 meses como promotora en supermercado regional.",
    interview: {
      duration: "09:45",
      questions: [
        { q: "Cuéntame sobre ti", transcript: "Soy Lucía, estudio Marketing en quinto ciclo. Me apasionan las ventas...", score: 79 },
        { q: "Experiencia de liderazgo", transcript: "En una campaña de fin de año coordiné a dos compañeras nuevas para un stand.", score: 76 },
        { q: "Trabajo en equipo", transcript: "Con mi supervisora tuvimos una diferencia de horarios. Hablamos y rotamos turnos.", score: 78 },
      ],
    },
    status: "invitado",
    available: true,
  },
  {
    id: "c4",
    name: "Diego Apaza Flores",
    initials: "DA",
    color: "oklch(0.78 0.16 70)",
    role: "Analista Junior",
    location: "Cusco — San Jerónimo",
    sector: "Finanzas",
    match: 76,
    score: { total: 73, claridad: 70, confianza: 68, estructura: 78, tecnico: 82 },
    skills: ["Excel avanzado", "Power BI", "SQL básico"],
    softSkills: ["Analítico", "Detallista"],
    strengths: ["Sólido en herramientas técnicas", "Pensamiento estructurado"],
    weaknesses: ["Confianza vocal baja", "Pocas pausas naturales"],
    recommendation: "en-desarrollo",
    cvSummary: "Egresado de Economía, prácticas en cooperativa de ahorro y crédito.",
    interview: {
      duration: "11:20",
      questions: [
        { q: "Cuéntame sobre ti", transcript: "Soy Diego, economista, me interesan los datos y el análisis de cartera...", score: 71 },
        { q: "Experiencia de liderazgo", transcript: "En la universidad lideré un grupo de tesis de 4 personas durante un semestre.", score: 74 },
        { q: "Trabajo en equipo", transcript: "Con un compañero discrepamos sobre la metodología, votamos y aplicamos la mixta.", score: 75 },
      ],
    },
    status: "nuevo",
    available: true,
  },
  {
    id: "c5",
    name: "Andrea Salas Vega",
    initials: "AS",
    color: "oklch(0.62 0.22 27)",
    role: "Asesora Comercial",
    location: "Cusco — Plaza de Armas",
    sector: "Finanzas",
    match: 72,
    score: { total: 70, claridad: 74, confianza: 72, estructura: 68, tecnico: 66 },
    skills: ["Atención al cliente", "Ventas consultivas"],
    softSkills: ["Carisma", "Negociación"],
    strengths: ["Buena dicción", "Empatía natural"],
    weaknesses: ["Falta experiencia bancaria"],
    recommendation: "en-desarrollo",
    cvSummary: "Estudiante de Administración con experiencia en venta de seguros.",
    interview: {
      duration: "08:50",
      questions: [
        { q: "Cuéntame sobre ti", transcript: "Soy Andrea, vendo seguros desde hace un año mientras estudio...", score: 73 },
        { q: "Experiencia de liderazgo", transcript: "En el call center coordiné un equipo nocturno de 3 personas.", score: 68 },
        { q: "Trabajo en equipo", transcript: "Con mi líder tuvimos diferencias de meta, llegamos a acuerdo semanal.", score: 70 },
      ],
    },
    status: "nuevo",
    available: true,
  },
];

export const COMPANY_VACANCIES = [
  { id: "v1", title: "Ejecutiva de Atención al Cliente", sector: "Finanzas", candidates: 28, top: 5, status: "Activa", days: 4 },
  { id: "v2", title: "Recepcionista Bilingüe", sector: "Hotelería", candidates: 19, top: 4, status: "Activa", days: 7 },
  { id: "v3", title: "Promotor de Ventas", sector: "Retail", candidates: 42, top: 8, status: "Activa", days: 2 },
  { id: "v4", title: "Analista Junior de Riesgos", sector: "Finanzas", candidates: 11, top: 3, status: "Borrador", days: 0 },
];

export const COMPANY_METRICS = {
  timeToHire: { value: "9 días", delta: "-62%", label: "Tiempo promedio de contratación" },
  qualityScore: { value: "87/100", delta: "+14%", label: "Calidad promedio del candidato" },
  matchRate: { value: "78%", delta: "+22%", label: "Tasa de match exitoso" },
  retention: { value: "91%", delta: "+18%", label: "Retención a 90 días" },
};

export const SUGGESTED_SKILLS_BY_ROLE: Record<string, { skills: string[]; questions: string[] }> = {
  default: {
    skills: ["Comunicación", "Atención al cliente", "Trabajo en equipo", "Excel intermedio"],
    questions: [
      "Cuéntame una experiencia donde resolviste un problema bajo presión",
      "¿Cómo manejas un cliente molesto?",
      "Describe un logro del que estés orgulloso",
    ],
  },
};

export const PRICING_PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "S/ 0",
    period: "/ mes",
    description: "Para equipos que recién inician su búsqueda",
    features: [
      "Hasta 10 perfiles de candidatos al mes",
      "1 vacante activa",
      "Score básico de IA",
      "Soporte por email",
    ],
    cta: "Empezar gratis",
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "S/ 499",
    period: "/ mes",
    description: "Reclutamiento serio, con ranking IA y entrevistas",
    features: [
      "Candidatos ilimitados con ranking IA",
      "Hasta 10 vacantes activas",
      "Acceso completo a simulaciones de entrevista",
      "Sugerencia automática de skills y preguntas",
      "Métricas avanzadas y alertas inteligentes",
      "Soporte prioritario",
    ],
    cta: "Probar Pro 14 días",
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Universidades, gobierno y grandes empresas",
    features: [
      "Dashboard institucional multi-equipo",
      "Tracking de empleabilidad de estudiantes",
      "Reportes agregados y API",
      "Integración ATS / CRM",
      "Onboarding y SLA dedicado",
    ],
    cta: "Hablar con ventas",
    highlighted: false,
  },
];
