# ⛪ Admirai — Sistema da Igreja

Sistema completo de gestão para igrejas. Desenvolvido com React + Vite.

---

## 🚀 Como rodar localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) v18 ou superior
- npm (já incluído no Node)

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/SEU_USUARIO/admirai-church.git
cd admirai-church

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse no navegador: **http://localhost:5173**

### Build para produção

```bash
npm run build
npm run preview
```

---

## 👥 Usuários de demonstração

| Usuário       | Login       | Senha | Perfil                   |
|---------------|-------------|-------|--------------------------|
| João Silva    | `joao`      | 123   | Membro                   |
| Maria Santos  | `maria`     | 123   | Músico                   |
| Pedro Costa   | `pedro`     | 123   | Obreiro                  |
| Ana Lima      | `ana`       | 123   | Educadora Infantil       |
| Carlos Souza  | `carlos`    | 123   | Círculo de Oração        |
| Lúcia Ferreira| `lucia`     | 123   | Líder do Conjunto        |
| Roberto Oliveira | `roberto` | 123 | Líder Min. Infantil     |
| Fernanda Alves| `fernanda`  | 123   | Líder dos Obreiros       |
| Marcos Pereira| `marcos`    | 123   | Líder de Missões         |
| Cristina Nunes| `cristina`  | 123   | Líder do Círculo         |
| Pastor José   | `pastor`    | 123   | Pastor (acesso total)    |

---

## 📱 Funcionalidades

### Feed (todos os perfis)
- Feed estilo Instagram com postagens de cultos, missões e eventos
- Curtidas e publicação de novos posts

### Calendário
- Programação mensal de cultos, eventos e cantinas
- Navegação por mês

### Arrecadações
- Campanhas com barra de progresso e meta
- PIX copiável por campanha
- Aba de PIX rápido para oferta no culto
- Criação de campanhas (Líder de Missões e Pastor)

### Cantina
- Próximos eventos com cardápio e preços

### Escala (por ministério)
- **Músicos** — Criada pelo Líder do Conjunto
- **Obreiros** — Portaria e Santa Ceia, criada pelo Líder dos Obreiros
- **Educadoras** — Ministério Infantil, criada pelo Líder Infantil
- **Círculo de Oração** — Segunda-feira e Domingo

### Admin (Pastor)
- Lista de todos os membros com busca
- Cadastro de novos membros com função e senha

---

## 🗂 Estrutura do projeto

```
src/
├── assets/
│   └── logo.png             ← logo da igreja
├── components/
│   ├── Logo.jsx
│   ├── TopBar.jsx
│   └── BottomNav.jsx
├── tabs/
│   ├── FeedTab.jsx
│   ├── CalendarTab.jsx
│   ├── FundraisingTab.jsx
│   ├── CanteenTab.jsx
│   ├── ScheduleTab.jsx
│   └── AdminTab.jsx
├── data/
│   └── initialData.js       ← todos os dados iniciais
├── utils/
│   └── helpers.js           ← funções utilitárias e controle de acesso
├── App.jsx
├── App.module.css
├── main.jsx
└── index.css
```

---

## 🛠 Tecnologias

- [React 18](https://react.dev/)
- [Vite 5](https://vitejs.dev/)
- CSS Modules

---

## 📌 Próximos passos sugeridos

- [ ] Integração com backend (Firebase / Supabase)
- [ ] Notificações push reais
- [ ] Upload de fotos no feed
- [ ] Autenticação real por e-mail/senha
- [ ] Versão PWA (instalável no celular)
