# ASPIRE - Note tehnice (condensate)

## Stack si runtime
- Next.js App Router (React 18, TypeScript) cu rute server in `app/api`.
- Integrare Ratio1 Edge SDK pentru acces la CStore/R1FS.
- UI state si autentificare prin React context + sesiuni semnate.

## Flux tehnic de inferenta (apeluri locale on-edge)
1. `POST /api/cases` apeleaza `storeCaseSubmission` in `lib/data-platform.ts`.
2. Payload-ul cazului este serializat si urcat in R1FS prin `addFileBase64` (apel local catre nodul Edge).
3. Metadatele cazului + jobul sunt persistate in CStore prin `hset`.
4. Jobul este creat cu status `queued`; `edgeNode` si `payloadCid` vin din raspunsurile R1FS.
5. UI afiseaza statusul jobului si rezultatul; inferenta propriu-zisa este executata de serviciile Edge si sincronizata prin CStore.

## Acces la date
- `loadCaseRecords`, `loadCaseRecord`, `loadInferenceJobs`, `loadInferenceJob` folosesc `cstore.hgetall/hget`.
- `loadPlatformStatus` interogheaza `cstore.getStatus` si `r1fs.getStatus` pentru telemetrie.
- Chei CStore: `platformConfig.casesHKey` si `platformConfig.jobsHKey` (override prin env).

## Client Ratio1
- `lib/ratio1-client.ts` creeaza client SDK singleton pe server si client browser separat.
- Configurare prin `R1EN_CHAINSTORE_API_URL`, `R1EN_R1FS_API_URL`, `R1EN_CHAINSTORE_PEERS`.

## Autentificare si sesiuni
- `@ratio1/cstore-auth-ts` (`simple.init` + `simple.authenticate`).
- `app/api/auth/login` seteaza cookie semnat HMAC (`r1-session` implicit) cu `AUTH_SESSION_SECRET`.
- `useAuth` in `components/auth-context.tsx` si gate in `app/(authenticated)/layout.tsx`.
- API admin (`/api/users`) valideaza sesiunea si rolul.

## Date de cohorta
- `data/cohort-seed.json` si `data/cohort-cstore.json` sunt generate din Excel prin `npm run seed:cohort` (script in `scripts/build-cohort.js`).
