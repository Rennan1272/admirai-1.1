export const INITIAL_USERS = [
  { id: 1,  name: "João Silva",       role: "membro",         username: "joao",     password: "123", age: 34, sector: "Congregação",        birthDate: "1991-03-15", photo: null },
  { id: 2,  name: "Maria Santos",     role: "musico",         username: "maria",    password: "123", age: 28, sector: "Conjunto",            birthDate: "1997-07-22", photo: null },
  { id: 3,  name: "Pedro Costa",      role: "obreiro",        username: "pedro",    password: "123", age: 45, sector: "Obreiros",            birthDate: "1980-11-05", photo: null },
  { id: 4,  name: "Ana Lima",         role: "educadora",      username: "ana",      password: "123", age: 31, sector: "Ministério Infantil", birthDate: "1994-04-18", photo: null },
  { id: 5,  name: "Carlos Souza",     role: "circulo_oracao", username: "carlos",   password: "123", age: 40, sector: "Círculo de Oração",   birthDate: "1985-09-30", photo: null },
  { id: 6,  name: "Lúcia Ferreira",   role: "lider_musicos",  username: "lucia",    password: "123", age: 38, sector: "Conjunto",            birthDate: "1987-01-12", photo: null },
  { id: 7,  name: "Roberto Oliveira", role: "lider_infantil", username: "roberto",  password: "123", age: 42, sector: "Ministério Infantil", birthDate: "1983-06-25", photo: null },
  { id: 8,  name: "Fernanda Alves",   role: "lider_obreiros", username: "fernanda", password: "123", age: 50, sector: "Obreiros",            birthDate: "1975-12-08", photo: null },
  { id: 9,  name: "Marcos Pereira",   role: "lider_missoes",  username: "marcos",   password: "123", age: 36, sector: "Missões",             birthDate: "1989-02-14", photo: null },
  { id: 10, name: "Cristina Nunes",   role: "lider_circulo",  username: "cristina", password: "123", age: 44, sector: "Círculo de Oração",   birthDate: "1981-08-03", photo: null },
  { id: 11, name: "Beatriz Rocha",    role: "lider_cantina",  username: "beatriz",  password: "123", age: 29, sector: "Cantina",             birthDate: "1996-05-20", photo: null },
  { id: 12, name: "Pastor José",      role: "pastor",         username: "pastor",   password: "123", age: 55, sector: "Pastoral",            birthDate: "1970-10-01", photo: null },
];

export const ROLE_LABELS = {
  membro:         "Membro",
  musico:         "Músico",
  obreiro:        "Obreiro",
  educadora:      "Educadora Infantil",
  circulo_oracao: "Círculo de Oração",
  lider_musicos:  "Líder do Conjunto",
  lider_infantil: "Líder Min. Infantil",
  lider_obreiros: "Líder dos Obreiros",
  lider_missoes:  "Líder de Missões",
  lider_circulo:  "Líder do Círculo",
  lider_cantina:  "Líder da Cantina",
  pastor:         "Pastor",
};

// Which sector each role belongs to (for schedule filtering)
export const SECTOR_BY_ROLE = {
  musico:         "Conjunto",
  lider_musicos:  "Conjunto",
  obreiro:        "Obreiros",
  lider_obreiros: "Obreiros",
  educadora:      "Ministério Infantil",
  lider_infantil: "Ministério Infantil",
  circulo_oracao: "Círculo de Oração",
  lider_circulo:  "Círculo de Oração",
};

export const INSTRUMENTS = ["Violão", "Contrabaixo", "Bateria", "Teclado", "Guitarra", "Vocal"];

export const INITIAL_POSTS = [
  { id: 1, author: "Marcos Pereira",  role: "lider_missoes", av: "MP", time: "2h",  text: "🙏 Glória a Deus! Nossa equipe chegou ao Maranhão. Já estamos orando com a comunidade local! #Missões #Avivamento", likes: 47,  comments: 12, tag: "Missões" },
  { id: 2, author: "Pastor José",     role: "pastor",        av: "PJ", time: "5h",  text: "📸 Que culto abençoado foi o de domingo! O Senhor se moveu de maneira especial. Testemunhos de cura e libertação! 🔥", likes: 89,  comments: 34, tag: "Culto" },
  { id: 3, author: "Lúcia Ferreira",  role: "lider_musicos", av: "LF", time: "1d",  text: "🎵 Ensaio incrível hoje com o conjunto! Preparando louvores para o culto de domingo. Venham todos!", likes: 31,  comments: 8,  tag: "Louvor" },
  { id: 4, author: "Ana Lima",        role: "educadora",     av: "AL", time: "2d",  text: "🌟 Que alegria trabalhar com as crianças! Hoje ensinamos sobre Davi e Golias. Nossa geração está sendo plantada no amor de Deus! 💛", likes: 56,  comments: 19, tag: "Infantil" },
  { id: 5, author: "Marcos Pereira",  role: "lider_missoes", av: "MP", time: "3d",  text: "🌍 Irmão Daniel chegou a Moçambique! A construção do templo segue firme. Continue orando e contribuindo! #TemploNaÁfrica", likes: 123, comments: 41, tag: "Missões" },
];

export const INITIAL_FUNDRAISING = [
  { id: 1, theme: "Construção do Templo na África", goal: 15000, raised: 9200,  pix: "missoes@admirai.com.br", expires: "2025-12-31", objective: "Construir um templo em Moçambique alcançando mais de 200 pessoas.", active: true },
  { id: 2, theme: "Missão no Nordeste",              goal: 5000,  raised: 3100,  pix: "missoes@admirai.com.br", expires: "2025-09-30", objective: "Enviar equipe ao interior do Maranhão para evangelismo e plantação de igrejas.", active: true },
  { id: 3, theme: "Reforma da Sede",                 goal: 8000,  raised: 2500,  pix: "igreja@admirai.com.br",  expires: "2025-11-30", objective: "Reforma geral da sede da Igreja para acomodar melhor membros e visitantes.", active: true },
];

export const INITIAL_CALENDAR_EVENTS = [
  { id: 1,  date: "2025-04-06", type: "culto",   title: "Culto de Domingo",       time: "19:00" },
  { id: 2,  date: "2025-04-07", type: "oracao",  title: "Círculo de Oração",      time: "20:00" },
  { id: 3,  date: "2025-04-09", type: "infantil",title: "Culto Infantil",          time: "18:30" },
  { id: 4,  date: "2025-04-13", type: "culto",   title: "Culto de Domingo",       time: "19:00" },
  { id: 5,  date: "2025-04-14", type: "oracao",  title: "Círculo de Oração",      time: "20:00" },
  { id: 6,  date: "2025-04-18", type: "cantina", title: "Cantina — Pastéis",      time: "18:00" },
  { id: 7,  date: "2025-04-20", type: "culto",   title: "Culto de Domingo",       time: "19:00" },
  { id: 8,  date: "2025-04-26", type: "evento",  title: "Congresso de Jovens",    time: "18:00" },
  { id: 9,  date: "2025-04-27", type: "culto",   title: "Culto de Domingo",       time: "19:00" },
  { id: 10, date: "2025-05-01", type: "cantina", title: "Cantina — Feijoada",     time: "12:00" },
  { id: 11, date: "2025-05-18", type: "evento",  title: "Seminário de Missões",   time: "09:00" },
  { id: 12, date: "2025-06-15", type: "evento",  title: "Festa Junina da Igreja", time: "17:00" },
];

export const INITIAL_SCHEDULES = {
  musicos: [
    { id: 1, name: "Maria Santos", dates: ["2025-04-06", "2025-04-20"], instrument: "Violão" },
    { id: 2, name: "Paulo Mendes", dates: ["2025-04-13", "2025-04-27"], instrument: "Bateria" },
    { id: 3, name: "Sara Gomes",   dates: ["2025-04-06", "2025-04-13"], instrument: "Teclado" },
  ],
  obreiros: [
    { id: 1, name: "Pedro Costa",   dates: ["2025-04-06", "2025-04-13"], type: "portaria" },
    { id: 2, name: "Raimundo Neto", dates: ["2025-04-20", "2025-04-27"], type: "portaria" },
    { id: 3, name: "Pedro Costa",   dates: ["2025-04-13"],               type: "santa_ceia" },
    { id: 4, name: "Raimundo Neto", dates: ["2025-04-27"],               type: "santa_ceia" },
  ],
  educadoras: [
    { id: 1, name: "Ana Lima",      dates: ["2025-04-06", "2025-04-20"] },
    { id: 2, name: "Joice Ribeiro", dates: ["2025-04-13", "2025-04-27"] },
  ],
  circulo: [
    { id: 1, name: "Carlos Souza",  dates: ["2025-04-07", "2025-04-14"], type: "segunda" },
    { id: 2, name: "Beatriz Rocha", dates: ["2025-04-07"],               type: "segunda" },
    { id: 3, name: "Carlos Souza",  dates: ["2025-04-13"],               type: "domingo" },
  ],
};

export const INITIAL_CANTEEN_ITEMS = [
  { id: 1, date: "2025-04-18", name: "Pastéis Variados",  price: 5.00,  desc: "Recheios: Frango, Carne e Queijo", reservations: [] },
  { id: 2, date: "2025-05-01", name: "Feijoada Completa", price: 25.00, desc: "Inclui arroz, farofa e couve",       reservations: [] },
  { id: 3, date: "2025-06-15", name: "Festa Junina",      price: 10.00, desc: "Buffet completo de comidas típicas", reservations: [] },
];

export const INITIAL_PIX = {
  igreja:  "igreja@admirai.com.br",
  missoes: "missoes@admirai.com.br",
};

export const SCHED_TABS_BY_ROLE = {
  musico:         [["musicos",    "🎵 Conjunto"]],
  obreiro:        [["obreiros",   "🚪 Obreiros"]],
  educadora:      [["educadoras", "🌟 Infantil"]],
  circulo_oracao: [["circulo",    "🙏 Círculo"]],
  lider_musicos:  [["musicos",    "🎵 Conjunto"]],
  lider_infantil: [["educadoras", "🌟 Infantil"]],
  lider_obreiros: [["obreiros",   "🚪 Obreiros"]],
  lider_circulo:  [["circulo",    "🙏 Círculo"]],
  pastor: [["musicos","🎵 Conjunto"],["obreiros","🚪 Obreiros"],["educadoras","🌟 Infantil"],["circulo","🙏 Círculo"]],
};

export const TYPE_LABELS = {
  portaria:   "Portaria",
  santa_ceia: "Santa Ceia",
  segunda:    "2ª Feira",
  domingo:    "Domingo",
};

export const TYPE_ICONS = {
  culto:    "⛪",
  oracao:   "🙏",
  infantil: "🌟",
  cantina:  "🍽️",
  evento:   "🎉",
};

export const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
export const DAYS_SHORT = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
