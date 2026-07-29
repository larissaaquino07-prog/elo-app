# elo

App mobile de atividade física (corrida, musculação, vôlei, natação) focado em conectar
pessoas para treinar juntas. Modelo freemium: R$ 15/mês.

Protótipo React Native + Expo construído a partir da especificação em
`elo — especificação do app`, usando o protótipo visual (React/web) fornecido como
referência exata de identidade visual, componentes e fluxos de tela.

## Stack

- **Frontend**: Expo (SDK 57) + React Native + TypeScript
- **Navegação**: React Navigation (bottom tabs, tab bar customizada)
- **UI**: `react-native-svg` (logo, anel de progresso), `expo-linear-gradient` (cards com
  gradiente), `expo-blur` (barra de navegação), `lucide-react-native` (ícones)
- **Backend recomendado**: Supabase (auth, banco Postgres, storage, realtime para chat/feed)

Este projeto contém apenas o app (frontend) com dados mockados equivalentes aos do
protótipo. Não há integração com Supabase ainda — os hooks de estado em
`src/context/AppStateContext.tsx` são o ponto de entrada natural para plugar
queries/mutations reais.

## Rodando o projeto

```bash
npm install
npm run start   # abre o Metro/Expo com QR code — escaneie com o app Expo Go
npm run web     # roda no navegador (útil para iterar rápido sem device)
npm run ios     # requer macOS
npm run android
```

## Estrutura

```
App.tsx                       # providers (safe area, gesture handler, navegação) + overlays globais
src/
  theme/                      # paleta de cores e metadata por modalidade (cor, ícone, label)
  types.ts                    # tipos compartilhados (Workout, Person, LeaderboardEntry, ...)
  data/mockData.ts            # dados mockados (equivalentes ao protótipo)
  context/AppStateContext.tsx # estado global: premium, paywall, toast, kudos, opt-ins, seção expandida
  components/                 # componentes visuais reutilizáveis (cards, linhas, toggle, modal, toast)
  screens/                    # as 5 telas de tab: Início, Treinos, Ranking, Conectar, Perfil
  navigation/                 # bottom tab navigator + tab bar customizada (blur, ícones, cor ativa)
```

## Identidade visual

- Fundo escuro (`#111417` / `#0e1013`), cards com gradiente sutil (`expo-linear-gradient`)
  e sombra, evitando visual "flat"
- Cores por modalidade: Corrida `#E0663E`, Musculação `#4A90A4`, Vôlei `#C9A24B`,
  Natação `#5B7FA6` — centralizadas em `src/theme/colors.ts` e `src/theme/sports.ts`
- Logo: quatro anéis com gradiente próprio (SVG), renderizada em `src/components/Logo.tsx`

## Telas implementadas

- **Início**: elo score com anel de progresso, gráfico de minutos por dia, stat cards,
  feed de atividade dos contatos com kudos, atalho para registrar treino por modalidade
- **Treinos**: barra de meta semanal, seções expansíveis por modalidade com detalhes
  específicos (pace/distância, séries/carga, sets/parceiros)
- **Ranking**: leaderboard de consistência; 1º e 2º lugar só exibem @ do Instagram se o
  usuário tiver ativado o opt-in; desafio quinzenal para quem treina pouco
- **Conectar**: lista de pessoas próximas só aparece com localização ativada (opt-in);
  filtros avançados são bloqueados (paywall) para quem não é premium
- **Perfil**: dados do usuário, status da assinatura + CTA de upgrade, toggles de
  privacidade (localização e Instagram, ambos nascem ativados aqui só para fins de demo —
  ver nota abaixo sobre regra de privacidade), modalidades praticadas

## Regras de privacidade (não negociáveis, conforme especificação)

- `location_opt_in` e `instagram_opt_in` devem nascer `false` no cadastro real — no mock
  deste protótipo eles começam `true` apenas para que as telas de Ranking/Conectar já
  exibam conteúdo sem exigir uma etapa de onboarding
- Nunca inferir consentimento: exposição é sempre ação explícita do usuário (toggle)
- Desativar o toggle ou perder a posição no ranking deve ocultar o dado imediatamente —
  implementado em `RankingScreen` (Instagram) e `ConnectScreen` (localização)

## Modelo de dados (sugestão de schema Supabase)

```sql
create table users (
  id uuid primary key references auth.users,
  nome text not null,
  foto text,
  cidade text,
  bio text,
  location_opt_in boolean not null default false,
  instagram_handle text,
  instagram_opt_in boolean not null default false
);

create table sports (
  id serial primary key,
  key text unique not null, -- corrida | musculacao | volei | natacao
  label text not null
);

create table user_sports (
  user_id uuid references users(id),
  sport_id int references sports(id),
  nivel text check (nivel in ('iniciante', 'intermediario', 'avancado')),
  primary key (user_id, sport_id)
);

create table workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  sport_id int references sports(id),
  data timestamptz not null default now(),
  duracao_min int not null,
  coletivo boolean not null default false,
  detalhes jsonb -- pace/distancia, series/carga, sets/parceiros, estilo
);

create table connections (
  user_a_id uuid references users(id),
  user_b_id uuid references users(id),
  status text check (status in ('pendente', 'aceito')),
  tipo text check (tipo in ('avulsa', 'dupla_fixa')),
  primary key (user_a_id, user_b_id)
);

create table events (
  id uuid primary key default gen_random_uuid(),
  criador_id uuid references users(id),
  sport_id int references sports(id),
  local text,
  data_hora timestamptz,
  participantes uuid[]
);

create table kudos (
  user_id uuid references users(id),
  workout_id uuid references workouts(id),
  criado_em timestamptz not null default now(),
  primary key (user_id, workout_id)
);

create table subscriptions (
  user_id uuid primary key references users(id),
  status text check (status in ('ativa', 'cancelada', 'expirada')),
  data_expiracao timestamptz
);

create table weekly_goals (
  user_id uuid references users(id),
  minutos_meta int,
  semana_referencia date,
  primary key (user_id, semana_referencia)
);
```

## Free vs. pago (R$ 15/mês)

| Grátis | Pago |
|---|---|
| Registro de treinos (4 modalidades) | Estatísticas avançadas e histórico ilimitado |
| Buscar e conectar com pessoas pra treinar | Filtros de match (nível, horário, localização) |
| Grupos/eventos abertos | Criar grupos privados e eventos recorrentes |
| Ranking e desafio quinzenal | Desafios extras, integração com wearables |

A conexão social básica é gratuita (gancho de crescimento/rede); o pago é refinamento e
conveniência. No app, isso aparece em `PersonCard` (bloqueio de filtro avançado) e no
paywall acionado a partir do Perfil ou de um cartão bloqueado em Conectar.

## Pendência em aberto (herdada da especificação)

A especificação deixa em aberto se a meta semanal em **Treinos** deve ser só de
**minutos totais** (implementado aqui, `weekly_goals.minutos_meta`) ou **por modalidade**
(ex: 2x vôlei + 3x corrida/semana). Essa decisão de produto deve ser tomada antes de
fechar o schema definitivo de `weekly_goals` — o schema acima cobre apenas o caso de
minutos totais.
