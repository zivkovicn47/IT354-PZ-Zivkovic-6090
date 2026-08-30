# PolovniAutomobili - web aplikacija (IT354)

Web aplikacija za oglašavanje i prodaju polovnih automobila, izrađena u Angular-u 21.
Deli Firebase projekat sa Android aplikacijom iz predmeta CS330, pa se podaci
sinhronizuju u realnom vremenu: oglas postavljen na telefonu odmah je vidljiv na
web-u i obrnuto.

**Student:** Nikola Živković, br. indeksa 6090

---

## Pokretanje

```bash
npm install
npm start
```

Aplikacija se otvara na `http://localhost:4200/`.

Ostale komande:

```bash
npm run build     # produkcioni build u dist/
npm test          # unit testovi (Vitest)
```

Nije potrebna nikakva dodatna konfiguracija - Firebase parametri su u
`src/environments/environment.ts`. (Firebase web API ključ nije tajna; pristup
podacima kontrolišu sigurnosna pravila baze, vidi ispod.)

---

## Funkcionalnosti

| Ekran | Ruta | Opis |
|---|---|---|
| Početna | `/` | Lista oglasa, pretraga, filtriranje po marki/ceni/godištu/gorivu, sortiranje |
| Detalji | `/ad/:id` | Sve specifikacije vozila, kontakt prodavca, akcije vlasnika |
| Prijava | `/login` | Prijava i registracija (Firebase Authentication) |
| Novi oglas | `/add-car` | Forma sa validacijom (zahteva prijavu) |
| Izmena oglasa | `/edit-car/:id` | Ista forma u režimu izmene (samo vlasnik) |
| Moji oglasi | `/my-ads` | Pregled, izmena i brisanje sopstvenih oglasa (zahteva prijavu) |
| 404 | bilo koja druga | Stranica za nepostojeće rute |

Kompletan CRUD nad oglasima: kreiranje (`push`), čitanje (`listVal`/`objectVal`),
izmena (`update`) i brisanje (`remove`).

---

## Struktura projekta

```
src/app/
├── components/
│   ├── auth/login/     prijava i registracija
│   ├── car-details/    detalji oglasa
│   ├── car-form/       dodavanje i izmena oglasa (jedna komponenta, dva režima)
│   ├── my-ads/         upravljanje sopstvenim oglasima
│   ├── navbar/         zajedničko zaglavlje
│   └── not-found/      404
├── guards/             authGuard - zaštita ruta
├── home/               početna strana
├── models/             Car, Category (ugovor sa Android aplikacijom)
├── services/           CarService, AuthService
└── utils/              čiste funkcije za filtriranje i pripremu podataka (+ testovi)
```

---

## Sinhronizacija sa Android aplikacijom

Obe aplikacije koriste isti Firebase projekat (`project250-65f0d`), iste čvorove
(`Cars`, `Category`) i isti Firebase Authentication, pa važi:

- **isti nalog** radi i na telefonu i na web-u,
- **promene stižu uživo** - web koristi `listVal`/`objectVal`, koji ostaju
  pretplaćeni na čvor, pa se lista osvežava bez ponovnog učitavanja stranice,
- **`userId`** određuje ko sme da menja oglas (u obe aplikacije).

Da bi sinhronizacija ostala ispravna, moraju se poštovati dva pravila:

1. Nazivi polja u `Car` interfejsu i Kotlin `data class Car` moraju biti identični.
2. Numerička polja moraju u bazi biti brojevi, nikada stringovi - inače ih Android
   SDK ne može deserijalizovati. Za to se stara `toDatabasePayload()`
   (`src/app/utils/car-serialization.ts`).

Izmena se upisuje sa `update()` umesto `set()`, tako da polja koja eventualno
upiše samo Android aplikacija ostaju sačuvana.

### Polje `phone`

Web forma nudi opciono polje `phone` (kontakt telefon). Ako se koristi, dodati i u
Android model:

```kotlin
val phone: String? = null
```

---

## Sigurnosna pravila baze

Predložena pravila su u `database.rules.json`. Postavljaju se u
Firebase Console → Realtime Database → Rules.

Ukratko: svi mogu da čitaju oglase, ali oglas može da upiše samo prijavljen
korisnik, i to samo pod svojim `userId`, uz proveru tipova svih polja.

> **Pre primene proveriti Android aplikaciju:** ako ona upisuje oglase bez
> `userId` ili sa fiksnom vrednošću (npr. `"admin"`), ti upisi će biti odbijeni.
> Demo oglasi sa `userId: "admin"` posle primene pravila više neće biti izmenljivi
> ni iz jedne aplikacije.

---

## Tehnologije

- **Angular 21** - standalone komponente, signali, `@if`/`@for`/`@switch`, lenjo učitavanje ruta
- **Firebase Realtime Database** (`@angular/fire`) - podaci i sinhronizacija uživo
- **Firebase Authentication** - email/lozinka
- **Tailwind CSS 4** - stilizacija (kroz PostCSS, kompajlirano u build)
- **RxJS + `toSignal`** - reaktivni tok podataka
- **Vitest** - unit testovi
