# CLAUDE.md — OneByOne App (Frontend)

> Guia do frontend para o Claude Code e desenvolvedores.
> Tudo em **português** (componentes, funções, variáveis, comentários), assim
> como no backend. Mantenha esse padrão.

---

## 1. O que é

Frontend do **OneByOne** — o sistema de reuniões 1:1 entre **gestor** e
**liderado**. Consome a API Go (`../onebyone-api`).

**Princípios de design (inegociáveis):**
- **Nada com cara de "app de IA".** Identidade própria, tátil, humana.
- **As duas personas juntas** (gestor + liderado), experiência "co-op".
- **Dinâmico e interativo**: drag-and-drop, gamificação, micro-animações.
- **UI/UX é a prioridade número 1** do produto.

---

## 2. Stack

- **React 19 + TypeScript** — tipagem estática (como C#, ajuda quem vem do .NET)
- **Vite** — build e dev server instantâneos
- **Tailwind CSS v4** — estilização por utilitários, tema via variáveis CSS
- **React Router** — navegação por URL
- **TanStack Query** — cache/sincronização dos dados da API
- **axios** — cliente HTTP
- **Framer Motion** — micro-interações (hover/tap, transições)
- **dnd-kit** — drag-and-drop (para a montagem da pauta — próximas etapas)

---

## 3. Como rodar

### Desenvolvimento (dia a dia, com hot reload)

```bash
# Sobe o banco + API (no outro repositório)
cd ../onebyone-api && docker compose up -d

# Sobe o frontend com hot reload
cd ../onebyone-app && npm run dev
# → http://localhost:5273
```

O Vite faz **proxy** de `/api` para `http://localhost:8090` (a API Go), então
não há problema de CORS em dev. Veja `vite.config.ts`.

> Portas do projeto (escolhidas para não conflitar com outros): App **3100**,
> API **8090**, Vite dev **5273**, MySQL **3307**.

### Tudo em Docker (de ponta a ponta)

Há um `docker-compose.yml` na **raiz** (`/home/ubuntu/onebyone`) que sobe banco
+ API + app juntos:

```bash
cd .. && docker compose up --build
# App ..... http://localhost:3100
# API ..... http://localhost:8090/api/v1
```

### Comandos úteis

```bash
npm run dev      # servidor de desenvolvimento
npm run build    # type-check (tsc) + build de produção em dist/
npm run lint     # ESLint
npm run preview  # pré-visualiza o build de produção localmente
```

---

## 4. Mapa de pastas

```
onebyone-app/
├── index.html            ← HTML raiz; carrega as fontes dos temas
├── vite.config.ts        ← Vite: plugin Tailwind, alias "@", proxy /api
├── src/
│   ├── main.tsx          ← ponto de entrada; monta os provedores globais
│   ├── App.tsx           ← mapa de rotas
│   ├── index.css         ← SISTEMA DE DESIGN: tokens + os 3 temas (ver §6)
│   ├── lib/              ← infraestrutura sem regra de negócio
│   │   ├── api.ts        ← axios + injeção do JWT + tratamento de erro
│   │   └── queryClient.ts← config do TanStack Query
│   ├── recursos/         ← "features": cada domínio com sua lógica
│   │   ├── auth/         ← contexto de sessão, API e tipos de autenticação
│   │   ├── tema/         ← contexto do tema visual (troca de aparência)
│   │   └── pauta/        ← tipos e dados do Tabuleiro do 1:1 (drag-and-drop)
│   ├── componentes/      ← componentes reutilizáveis de UI
│   │   ├── ui/           ← Botao, Campo (blocos básicos)
│   │   ├── marca/        ← Logo
│   │   ├── pauta/        ← Tabuleiro do 1:1: TabuleiroPauta, ColunaTabuleiro, CartaoTema
│   │   ├── PainelCoop.tsx← a visualização "co-op" da marca
│   │   └── SeletorTema.tsx← seletor flutuante de tema
│   └── paginas/          ← uma tela por arquivo
│       ├── PaginaInicial.tsx   (landing pública)
│       ├── LayoutAuth.tsx      (moldura split das telas de auth)
│       ├── PaginaLogin.tsx
│       ├── PaginaRegistro.tsx
│       └── PaginaPainel.tsx    (pós-login: o Tabuleiro do 1:1)
├── Dockerfile            ← build → nginx (serve estáticos + proxy /api)
└── nginx.conf            ← config do nginx em produção
```

> O alias **`@`** aponta para `src/`. Importe `@/componentes/...` em vez de
> caminhos relativos longos (`../../...`).

---

## 5. Como os provedores se encaixam (`main.tsx`)

Para quem vem de C#/.NET: os "Providers" são como serviços de escopo global
disponibilizados para toda a árvore de componentes. Ordem (de fora para dentro):

```
TemaProvider     → aparência/tema visual escolhido (aplica data-tema no <html>)
  BrowserRouter  → navegação por URL
    QueryClient  → cache dos dados da API
      AuthProvider → sessão (usuário logado, token)
        App      → as rotas
```

Acessa-se cada um por um hook: `useTema()`, `useAuth()`, etc.

---

## 6. Sistema de design e os 3 temas (importante)

Toda a aparência vem de **variáveis CSS (tokens)** definidas em
[src/index.css](src/index.css). Os componentes **nunca** usam cor fixa — usam
os tokens (ex.: classe `bg-areia`, `text-tinta`, `border-borda`). Por isso
trocar de tema é só trocar os valores das variáveis: **todos os componentes se
adaptam sozinhos.**

Há **três temas**, escolhidos pelo usuário (botão 🎨 flutuante, `SeletorTema`):

| Tema (`data-tema`) | Nome           | Cara |
|--------------------|----------------|------|
| `coop` (PADRÃO)    | Co-op humano   | Quente, terroso, humano (Fraunces + Plus Jakarta) |
| `brutalista`       | Neo-brutalista | Bordas pretas, sombras duras, cores sólidas (Space Grotesk) |
| `energetico`       | Gamificado     | Vibrante, cantos redondos, cara de jogo (Baloo 2 + Nunito) |

O tema ativo vira o atributo `data-tema` no `<html>`; cada bloco
`html[data-tema="..."]` no `index.css` sobrescreve os tokens. A escolha é
salva no `localStorage` (`TemaProvider`). O padrão é `coop`.

**Regra de ouro:** ao criar um componente, use **só os tokens** (cores `*-areia`,
`*-tinta`, `*-gestor`, `*-liderado`, `*-juncao`, `*-borda`, etc., e os
`var(--radius-*)` / `var(--shadow-*)`). Nunca cravar hex direto — senão o
componente não acompanha a troca de tema.

### Personas têm cores próprias

- **Gestor** → `gestor` (no padrão, petróleo)
- **Liderado** → `liderado` (no padrão, terracota)
- **Junção/sincronia da dupla** → `juncao`

Use essas cores para reforçar quem é quem na interface.

---

## 7. Animações — regra de robustez (leia)

**Animações de entrada que escondem conteúdo devem ser feitas em CSS**, não em
JavaScript. Use as classes `.animar-surgir` / `.animar-pop` (definidas no
`index.css`) com `style={{ animationDelay: '...' }}` para escalonar.

Motivo: se o conteúdo começa invisível (`opacity:0`) e depende de JS para
aparecer, qualquer travada deixa a tela vazia. Com CSS, o conteúdo **sempre**
termina visível (e há `prefers-reduced-motion` respeitado).

> **Lição aprendida (importante):** até a `.animar-surgir` pode falhar em
> **componentes visuais ricos e aninhados** (vários elementos com `animar-surgir`/
> `animar-pop` escalonados dentro de um pai que também anima) — o conteúdo ficou
> invisível em `MockLiderados` e `PainelCoop`. Regra prática: nesses componentes
> de "vitrine" (cards de dados, painéis), **NÃO use animação de entrada** — deixe
> o conteúdo estático e visível. Reserve `animar-surgir` para blocos simples de
> um nível só (título do hero, formulário).

O **Framer Motion** é usado só para **interações** que não escondem conteúdo:
`whileHover`, `whileTap`, e o dropdown do `SeletorTema` (`AnimatePresence`).

---

## 8. Falando com a API Go

- Toda chamada passa pelo cliente `api` em [src/lib/api.ts](src/lib/api.ts), que
  injeta o token JWT automaticamente (lido do `localStorage`).
- A API responde sempre no envelope `{ sucesso, dados, erro }`. Use
  `extrairDados()` para pegar o `dados` e `extrairMensagemErro()` para mensagens.
- Os tipos do frontend espelham os DTOs do Go (ex.:
  [src/recursos/auth/tipos.ts](src/recursos/auth/tipos.ts) ↔ `usuario/dto.go`).
  Ao mudar um DTO no backend, atualize o tipo aqui.
- Papel técnico ↔ persona: `LIDER` = **Gestor**, `COLABORADOR` = **Liderado**.

---

## 9. Convenções

- **Idioma:** português em tudo (componentes, props, funções, comentários).
- **Componentes:** um por arquivo, com cabeçalho de comentário
  `// Arquivo: ... // Descrição: ...` (igual ao backend).
- **Páginas** em `paginas/`, **features** em `recursos/`, **UI reutilizável** em
  `componentes/`. Regra de negócio não mora em componente de UI.
- **Estado de servidor** (dados da API) → TanStack Query. **Estado de sessão/tema**
  → contextos. Evite `useState` solto para dados que vêm da API.
- **Cores/raios/sombras** → sempre via tokens do tema (§6).

---

## 10. Estado atual e próximos passos

**Pronto:**
- Sistema de design com 3 temas trocáveis + seletor.
- Landing, Login e Criar Conta (com seletor de persona), todas no visual co-op.
- Autenticação ligada à API (login, registro, sessão persistida, rota protegida).
- **Painel pós-login — "Tabuleiro do 1:1"**: drag-and-drop da pauta (dnd-kit) em 3
  colunas (Banco de temas → Pauta de hoje → Conversado), com cartões coloridos por
  persona, adicionar tema, e gamificação ao vivo (XP + medidor de sincronia).
  Componentes em `componentes/pauta/`, dados em `recursos/pauta/`. **Hoje o estado
  do tabuleiro é local (em memória)** — ainda não persiste na API.

**Próximos passos (sugeridos):**
- Persistir o tabuleiro na API: puxar os temas de `template`/`templatebloco` e
  gravar o que foi conversado em `registroonebyone`/`valorregistro`.
- Tela de 1:1 ao vivo (gestor + liderado lado a lado, em tempo real).
- Gamificação real: sequências (streak) e conquistas vindas do backend.
- Telas de organização/equipe/colaborador consumindo os módulos da API.
- (Opcional) Login com Google — ver conversa; precisa de OAuth Client ID no Google Cloud.

---

## 11. Lembretes para o Claude Code

- Responda e comente **em português**.
- **UI/UX é prioridade.** Capriche; nada com cara de IA.
- **Sempre use os tokens do tema** — nunca cor fixa (quebraria a troca de tema).
- **Animação de entrada = CSS** (`.animar-surgir`/`.animar-pop`); Framer só para interação.
- Tipos do frontend devem espelhar os DTOs do Go.
- Verifique o resultado no navegador antes de afirmar que está pronto.
