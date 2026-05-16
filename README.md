# 🍽️ MrDelivery AI Photo Editor

> **Studio foto AI pentru restaurante.**  
> Generează, editează și branduiește imagini culinare fotorealiste în câteva secunde. Zero timeout-uri. Interfață premium. Gata de producție.

---

## 🌟 Ce este acest proiect? (Pe scurt)

Imaginează-ți că ai un restaurant și vrei poze profesionale pentru meniu, Instagram sau site. În loc să angajezi un fotograf, să cumperi echipament scump și să aștepți zile întregi pentru editare, folosești această aplicație.

Scrii numele preparatului (ex: "Pizza Margherita"), alegi un stil vizual, apeși **GENERATE**, iar AI-ul creează o imagine care arată ca o fotografie reală de revistă.

Poți modifica detalii prin text (ex: "adaugă busuioc"), poți pune logo-ul restaurantului pe un șervețel, poți integra mâncarea într-o poză reală cu localul tău și primești chiar și analiza nutrițională. Totul rulează rapid, sigur și fără erori de așteptare.

---

## 🚀 Funcționalități Complete

| Funcție | Ce face exact? |
|---------|----------------|
| 🎨 **Generare AI Fotorealistă** | Creează imagini culinare la nivel comercial folosind `flux-2/pro-text-to-image`. Prompturile sunt optimizate pentru texturi reale, lumină naturală și zero aspect de „plastic". |
| ✨ **Magic Edit** | Modifică orice detaliu scriind simplu: `„adaugă cartofi prăjiți"`, `„schimbă farfuria în ceramică neagră"`. AI-ul păstrează compoziția și lumina originală. |
| 🏷️ **Plasare Inteligentă Logo** | Încarci logo-ul restaurantului, iar AI îl așază natural pe un șervețel, meniu sau suport, respectând perspectiva, umbrele și materialul. |
| 📍 **Fundal Real (Location Sync)** | Încarci o poză cu restaurantul tău. AI integrează preparatul în acel spațiu, păstrând exact pereții, mesele, lumina și atmosfera locației. |
| ⚡ **Arhitectură Async (Fără Timeout)** | Sistemul nu așteaptă blocat. Primește instant un `taskId` și verifică statusul la fiecare 2 secunde. Chiar dacă AI-ului îi trebuie 90s, tu nu vei vedea niciodată `504 Gateway Timeout`. |
| 📊 **Analiză Nutrițională** | Primești automat calorii, proteine, carbohidrați, grăsimi și alergeni pe baza descrierii/imaginei. Perfect pentru meniuri digitale. |
| 🎬 **Control Aspect Ratio** | `1:1` (Instagram), `3:4/4:3` (Meniu), `9:16` (TikTok/Reels), `16:9` (Site/Banner). |
| 💳 **Sistem de Credite Sigur** | Fiecare acțiune costă 1 credit. Primești o fereastră de confirmare înainte de consum, ca să nu irosești credite din greșeală. |
| 🤖 **Protocoale Speciale** | `Prep Team` (adaugă bucătari miniaturali fotorealiști care „gătesc" preparatul) și `Detection Squad` (detectivi care „investighează" farfuria ca pe o scenă a crimei). |

---

## 🛠️ Tehnologii Folosite

| Strat | Tehnologie | De ce am ales-o? |
|-------|------------|------------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS | Rapid, tipizat, ușor de întreținut și cu o interfață modernă. |
| **Backend / Proxy** | Hono (Node.js), PM2 | Extrem de ușor, rulează pe portul `4900`, gestionează upload-uri și rutarea către AI fără overhead. |
| **AI Provider** | Kie.ai API (`flux-2/pro-text-to-image`, `flux-2/flex-image-to-image`) | Modele specializate în fotorealism, cu latență mică și suport pentru editare pe imagine existentă. |
| **Deployment** | PM2, Nginx Reverse Proxy, HTTPS/SSL | Procese persistente, restart automat la crash, rutare sigură și certificat SSL. |

---

## 🏗️ Cum Funcționează? (Arhitectura & Fluxul de Date)




### 🔍 Pas cu pas (ce se întâmplă când apeși GENERATE):
1. **Frontend-ul** trimite cererea către proxy-ul local (`/api/generate`).
2. **Proxy-ul** salvează imaginile încărcate (logo/locație) în `/uploads`, le transformă în URL-uri publice și trimite task-ul către Kie.ai.
3. **Kie.ai** răspunde instant cu un `taskId`. Proxy-ul îl returnează către browser.
4. **Frontend-ul** începe să verifice `/api/status/:taskId` la fiecare 2 secunde (polling). Este ca și cum ai suna curierul să vezi dacă a ajuns coletul, fără să blochezi linia.
5. Când AI-ul termină, trimite un **callback** către `/api/callback`. Proxy-ul stochează URL-ul final în memoria `global.KR`.
6. La următorul poll, frontend-ul primește `imageUrl` și afișează imaginea. **Zero timeout, zero așteptare blocată.**

---

## 📦 Instalare & Configurare

### ✅ Cerințe
- Node.js `>=18.0.0`
- Bun sau npm
- PM2 (`npm i -g pm2`)
- Git
- Cheie API Kie.ai ([obține-o aici](https://kie.ai/api-key))

### 🚀 Pași de instalare
```bash
# 1. Clonează repository-ul
git clone https://github.com/sergiumurgescu88-lgtm/PhotoEditorMrDelivery.git
cd PhotoEditorMrDelivery

# 2. Instalează dependențele
bun install  # sau npm install

# 3. Build pentru producție
bun run build

# 4. Configurează variabilele de mediu pentru Proxy (NU le pune în cod!)
pm2 set mrdelivery-proxy:KIE_AI_KEY "cheia_ta_kie_ai"
pm2 set mrdelivery-proxy:PORT "4900"
pm2 set mrdelivery-proxy:CALLBACK_URL "https://domeniultau.com/api/callback"
pm2 set mrdelivery-proxy:PUBLIC_BASE "https://domeniultau.com/api/uploads"
pm2 save

# 5. Pornește aplicația
pm2 start ecosystem.config.js
pm2 monit

🎮 Ghid Rapid de Utilizare
Generează: Scrie numele preparatului → Alege stilul → Apasă GENERATE (1 CR) → Confirmă → Așteaptă ~40-90s.
Editează: Apasă Magic Edit → Scrie ce vrei să schimbi → Apply Magic (1 CR).
Branduiește: Apasă Add Logo sau Add Loc → Încarcă imaginea → AI o integrează natural.
Analizează: Apasă Nutrition → Primești tabelul complet cu valori/100g și alergeni.
Descarcă: Apasă DOWNLOAD ASSET → Imaginea se salvează la calitate maximă.
🔐 Securitate & Gestionarea Creditelor
🔒 Cheile API nu ajung niciodată în cod sau în Git. Se stochează doar în PM2 environment.
📁 Folderul uploads/, fișierele .env și node_modules/ sunt în .gitignore.
💳 Confirmare obligatorie: Orice acțiune care consumă credit deschide un modal de confirmare. Nu există click-uri accidentale.
🌍 HTTPS obligatoriu: Callback-urile și upload-urile funcționează corect doar pe domenii cu SSL activ.
📜 Licență
Software proprietar dezvoltat pentru MrDelivery AI Agency. Toate drepturile rezervate. Utilizarea comercială neautorizată este interzisă.
📞 Suport & Contact
🌐 Website: https://mrdelivery.shop
🐛 Issues: GitHub Issues
📧 Contact: contact@mrdelivery.shop
⚡ Built with precision. Optimized for realism. Designed for restaurants.
