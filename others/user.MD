# ASPIRE - Ghid Utilizator

## Ce este ASPIRE?

**ASPIRE** (Archicava Case Inference Studio) este o platformă clinică inteligentă pentru managementul cazurilor de tulburări din spectrul autist (TSA) și inferență AI descentralizată. Aplicația transformă cercetarea pe cohorte românești de autism într-o interfață interactivă care se integrează cu pipeline-ul de inferență descentralizat Ratio1.

## Scop

Permite operatorilor clinici să captureze date structurate de caz în mod securizat, să trimită sarcini de inferență către nodurile Edge Ratio1 și să revizuiască clasificările probabilistice cu recomandări bazate pe dovezi.

## Funcționalități Principale

### 1. **Autentificare și Management Utilizatori**
- **Login securizat**: Autentificare prin CStore cu sesiuni HMAC
- **Roluri utilizatori**:
  - **User (Operator)**: Acces la workspace, cazuri, lab predictiv, cercetare
  - **Admin**: Toate funcțiile user + management utilizatori, creare conturi, resetare parole

### 2. **Dashboard Workspace** (`/workspace`)
Panoul principal al operatorului oferă:
- **Metrici cohortă**: Număr total de cazuri, prevalență subtipuri, vârstă mediană diagnostic
- **Listă cazuri**: Browser paginat cu ultimele cazuri înregistrate
- **Coada de joburi**: Status joburi active/finalizate de inferență
- **Status platformă**: Indicatori de sănătate pentru CStore și R1FS

### 3. **Management Cazuri**

#### **Creare Caz Nou** (`/cases/new`)
Formular structurat multi-secțiune pentru colectare date clinice:

- **Date demografice**:
  - Etichetă caz, vârstă luni, sex
  - Vârsta parentală, subtip TSA
  - Vârsta diagnosticului, factori prenatali

- **Dezvoltare**:
  - Întârzieri dezvoltare (motor, limbaj, social, cognitiv)
  - Trăsături dismorfice
  - Comorbidități (epilepsie, ADHD, etc.)
  - Regresie observată

- **Evaluări clinice**:
  - Scoruri ADOS și ADIR
  - Anomalii EEG
  - Rezultate RMN
  - Circumferință craniană

- **Comportamente**:
  - Preocupări principale
  - Nivel limbaj
  - Note senzoriale

#### **Vizualizare Cazuri** (`/cases`)
- Browser cu toate cazurile înregistrate
- Filtrare și căutare
- Acces rapid la detalii caz

#### **Detalii Caz** (`/cases/[id]`)
- Vizualizare completă date caz
- Istoric joburi inferență asociate
- Rezultate inferență cu:
  - Predicție principală
  - Distribuție probabilități pentru 3 fenotipuri autism
  - Explicație narrativă
  - Acțiuni recomandate
- Acces rapid la Lab Predictiv cu cazul pre-încărcat

### 4. **Inferență Descentralizată**

**Flux de lucru**:
1. Operator trimite formular caz → sistem creează job
2. Job trimis către Ratio1 Edge Node (status: `queued`)
3. Procesare pe Edge Node (status: `running`)
4. Rezultate returnate și stocate (status: `succeeded/failed`)
5. Operator revizuiește predicții și recomandări

**Beneficii**:
- Procesare locală, securizată
- Inferență pe device fără cloud
- Audit trail complet pentru fiecare job

### 5. **Lab Predictiv** (`/predict`)

Instrument pentru analiza "what-if" bazat pe scenarii:

**Opțiuni**:
- **Pornire de la un caz existent**: Selectează caz din listă și modifică parametrii
- **Configurare manuală**: Definește parametri clinici de la zero

**Algoritm scoring**:
- Softmax normalizat cu ponderare
- **3 fenotipuri autism evaluate**:
  1. **TSA profund cu disregulare senzorială**: Severitate limbaj, încărcare EEG
  2. **TSA high-functioning**: Limbaj preserved, evaluări neuro normale
  3. **TSA sindromic**: Trăsături dismorfice, comorbidități multi-sistem

**Output**:
- Distribuție probabilități pentru cele 3 fenotipuri
- Explicație narrativă pentru scenariul evaluat
- Recomandări personalizate

**Factori de risc analizați**:
- Complicații prenatale
- Întârzieri dezvoltare
- Încărcare comportamentală
- Anomalii EEG/RMN
- Comorbidități

### 6. **Research Insights** (`/research/insights`)

Hub cu informații despre:
- Alinierea cu cercetarea pe cohorte românești TSA
- Prevalența din cohortă pentru subtipuri
- Decizii de produs bazate pe date
- Context științific pentru features

### 7. **Management Utilizatori - Admin** (`/admin`)

Funcții administrative (doar pentru rolul admin):
- **Creare utilizatori noi**: Username, parolă, rol, nume afișare
- **Listare utilizatori**: Vizualizare toate conturile existente
- **Modificare rol**: Promovare/retrogradare user ↔ admin
- **Schimbare parole**: Resetare parole pentru orice utilizator

### 8. **Setări Cont** (`/account`)

Self-service pentru toți utilizatorii:
- Schimbare parolă propriă
- Vizualizare informații profil

## Fluxuri Tipice de Utilizare

### Operator Clinic (User)

1. **Login** → introduci username și parolă
2. **Dashboard Workspace** → vezi metrici și cazuri recente
3. **Creare caz nou**:
   - Navighează la `/cases/new`
   - Completează formular structurat
   - Trimite → sistem generează job inferență
4. **Monitorizare job**: Vezi status în dashboard (queued → running → succeeded)
5. **Revizuire rezultate**:
   - Accesează cazul din listă
   - Vizualizează predicții probabilistice
   - Citește recomandări clinice
6. **Analiză predictivă**:
   - Folosește Lab Predictiv pentru what-if scenarios
   - Compară probabilități pentru configurații diferite

### Administrator

Toate funcțiile user + :
- **Creare conturi** pentru operatori noi
- **Management roluri** pentru control acces
- **Resetare parole** la cerere

## Indicatori Status

### Status Platformă
- **Live** (verde): CStore și R1FS operaționale
- **Warning** (galben): Un serviciu degradat
- **Offline** (roșu): Servicii indisponibile

### Status Job
- **Queued**: Așteptare procesare
- **Running**: În procesare pe Edge Node
- **Succeeded**: Completat cu succes
- **Failed**: Eroare la procesare

## Date Cohortă

Aplicația include date pre-seed din cercetare pe cohorte românești TSA:
- Metrici calculate: prevalență, distribuții vârstă, comorbidități
- Cazuri anonimizate pentru referință
- Date folosite pentru calibrare algoritm predictiv

## Securitate și Confidențialitate

- **Autentificare robustă**: Parole hashed cu Argon2
- **Sesiuni securizate**: Cookie-uri HMAC-signed
- **Storage criptat**: Payloaduri stocate în R1FS
- **Procesare locală**: Inferență pe Edge Node, nu în cloud
- **Audit trail**: Toate joburile sunt tracked cu timestamp-uri

## Suport și Feedback

Pentru întrebări sau raportare probleme, contactați echipa Archicava sau consultați documentația tehnică detaliată.