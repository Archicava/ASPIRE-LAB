# ASPIRE - Ghid utilizator (condensat)

## Ce face aplicatia
ASPIRE este o interfata pentru operatori clinici care colecteaza date de caz, lanseaza joburi de inferenta si revizuiesc rezultate generate pe noduri Ratio1 Edge (apeluri locale on-edge).

## Functionalitati cheie
- Autentificare operator (dAuth) si sesiune persistenta.
- Workspace: metrici de cohorta, joburi active/istorice, acces rapid la cazuri.
- Biblioteca de cazuri: lista, detalii caz, istoric job si rezultate.
- Formular caz nou: date prenatale, dezvoltare, neurologie, comportament, comorbiditati.
- Inference review: distributie probabilitati, explicatii narative, actiuni recomandate.
- Predictive lab: scenarii „what-if” fara a modifica datele reale.
- Research insights: sinteza deciziilor de produs bazate pe studiu.
- Telemetrie Edge Node: status CStore/R1FS si sanatatea nodului.
- Administrare conturi (admin) + schimbare parola cont personal.

## Flux rapid de lucru
1. Autentificare si acces in workspace.
2. Creeaza un caz nou si trimite „Dispatch inference”.
3. Urmareste jobul in workspace si in pagina cazului.
4. Analizeaza rezultatul; ruleaza Predictive Lab pentru scenarii.
5. (Admin) gestioneaza utilizatori si roluri.
