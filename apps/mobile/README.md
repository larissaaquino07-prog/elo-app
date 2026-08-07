# apps/mobile

The Expo (React Native + TypeScript) client for the personal AI English coach. This is one package inside the project's monorepo — see the repository root for the actual documentation:

- `../../README.md` — repository overview and documentation index
- `../../AGENTS.md` — required reading before writing or modifying any code here
- `../../ARCHITECTURE.md` / `../../ARCHITECTURE_DECISIONS.md` — the frozen architecture and its ADRs (this package implements ADR-019/ADR-022 specifically: React Native + Expo, Expo Router)
- `../../IMPLEMENTATION_PLAN.md` — the task-by-task build plan this package is being built against

## Local development

```bash
npm install
npx expo start
```

Routes live under `src/app` (Expo Router, file-based). Application code that is not itself a screen or layout belongs in `src/`, not `src/app`.
