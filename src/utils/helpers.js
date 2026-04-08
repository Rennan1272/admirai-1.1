export const fmtDate = (d) =>
  new Date(d + "T00:00:00").toLocaleDateString("pt-BR")

export const initials = (name) =>
  name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()

export const canAccess = (role, feature) => {
  const access = {
    schedule_musico:    ["musico", "lider_musicos", "pastor"],
    schedule_obreiro:   ["obreiro", "lider_obreiros", "pastor"],
    schedule_educadora: ["educadora", "lider_infantil", "pastor"],
    schedule_circulo:   ["circulo_oracao", "lider_circulo", "pastor"],
    create_schedule:    ["lider_musicos", "lider_infantil", "lider_obreiros", "lider_circulo", "pastor"],
    create_fundraising: ["lider_missoes", "pastor"],
    manage_fundraising: ["pastor"],
    manage_pix:         ["pastor"],
    manage_calendar:    ["pastor"],
    manage_canteen:     ["lider_cantina", "pastor"],
    admin:              ["pastor"],
  }
  return access[feature]?.includes(role) ?? false
}

export const hasScheduleAccess = (role) =>
  ["musico","obreiro","educadora","circulo_oracao",
   "lider_musicos","lider_infantil","lider_obreiros","lider_circulo","pastor"].includes(role)

export const getMembersForTab = (users, tabKey) => {
  const sectorMap = {
    musicos:    "Conjunto",
    obreiros:   "Obreiros",
    educadoras: "Ministério Infantil",
    circulo:    "Círculo de Oração",
  }
  const sector = sectorMap[tabKey]
  if (!sector) return []
  return users.filter(u => u.sector === sector)
}

export const isBirthdayToday = (birthDate) => {
  if (!birthDate) return false
  const today = new Date()
  const bd = new Date(birthDate + "T00:00:00")
  return bd.getMonth() === today.getMonth() && bd.getDate() === today.getDate()
}

export const formatBirthDate = (birthDate) => {
  if (!birthDate) return "—"
  return new Date(birthDate + "T00:00:00").toLocaleDateString("pt-BR")
}
