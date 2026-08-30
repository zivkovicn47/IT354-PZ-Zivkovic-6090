# Ugovor o sinhronizaciji: Android (CS330) ↔ Web (IT354)

Ovaj dokument je namenjen agentu/programeru koji radi na **Android aplikaciji**.
Opisuje zajedničku šemu podataka i konkretne izmene potrebne da bi obe aplikacije
radile nad istom bazom bez međusobnog kvarenja podataka.

Web strana je već usklađena sa svime što je ovde opisano.

**Autor izmena na web strani:** Nikola Živković (6090)
**Stanje baze izmereno:** 30.08.2026.

---

## 1. Kontekst

Dve aplikacije dele **isti Firebase projekat**:

| Parametar | Vrednost |
|---|---|
| Project ID | `project250-65f0d` |
| Realtime Database URL | `https://project250-65f0d-default-rtdb.europe-west1.firebasedatabase.app` |
| Region | `europe-west1` |
| Čvorovi | `Cars`, `Category` |
| Autentikacija | Firebase Authentication, email + lozinka |

Isti nalog radi na obe platforme. Cilj: oglas postavljen na telefonu odmah je
vidljiv i izmenljiv na web-u, i obrnuto.

Zato **šema podataka nije interna stvar nijedne aplikacije** — ona je ugovor.
Promena naziva ili tipa bilo kog polja mora se dogovoriti sa obe strane.

---

## 2. Čvor `Cars` — merodavna šema

Ključ svakog zapisa je Firebase push ključ (npr. `-OtBLbzuUBeqLixpnyku`) ili
ručno zadat ključ demo podataka (`car01` … `car20`).

| Polje | Tip | Obavezno | Opis |
|---|---|---|---|
| `title` | String | da | Naziv modela, 3–80 karaktera |
| `price` | Number (Int) | da | Cena u evrima, > 0 |
| `description` | String | da | Opis, do 1000 karaktera |
| `picUrl` | String | da | URL slike, počinje sa `http://` ili `https://` |
| `categoryId` | **Number (Int)** | da | Marka — vrednost `Category/*/id`, opseg 0–19 |
| `productionYear` | Number (Int) | da | Godište, 1950–2100 |
| `mileage` | Number (Int) | da | Kilometraža u km, ≥ 0 |
| `fuelType` | String | da | Vidi dozvoljene vrednosti u tački 5 |
| `transmission` | String | da | Vidi dozvoljene vrednosti u tački 5 |
| `engineVolume` | Number (Int) | da | Zapremina motora u cm³ (0 za električna) |
| `enginePower` | Number (Int) | da | Snaga u KS, > 0 |
| `highestSpeed` | Number (Int) | da | Maksimalna brzina u km/h |
| `seats` | Number (Int) | da | Broj sedišta, 1–9 |
| `userId` | String | da | Firebase UID vlasnika oglasa |
| `phone` | String | **ne** | Kontakt telefon — **novo, vidi tačku 6** |
| `stability` | Number (Int) | ne | **Nepoznato web strani — vidi tačku 7** |
| `id` | String | ne | Zaostalo polje — **ne upisivati, vidi tačku 8** |

### Kotlin model koji odgovara ovoj šemi

```kotlin
data class Car(
    val title: String = "",
    val price: Int = 0,
    val description: String = "",
    val picUrl: String = "",
    val categoryId: Int = 0,
    val productionYear: Int = 0,
    val mileage: Int = 0,
    val fuelType: String = "",
    val transmission: String = "",
    val engineVolume: Int = 0,
    val enginePower: Int = 0,
    val highestSpeed: Int = 0,
    val seats: Int = 0,
    val userId: String = "",
    val phone: String? = null
)
```

> Svi članovi moraju imati podrazumevanu vrednost — Firebase Android SDK zahteva
> konstruktor bez argumenata za deserijalizaciju.
>
> Klasu **ne** anotirati sa `@ThrowOnExtraProperties`. Web strana može vremenom
> dodati polje koje Android još ne poznaje; podrazumevano ponašanje (upozorenje u
> logu) je željeno, izuzetak nije.

---

## 3. Pravila upisa (najvažniji deo)

### 3.1. Numerička polja moraju biti brojevi

Ovo je jedini problem koji je već jednom obarao sinhronizaciju na web strani.
`categoryId` zapisan kao string (`"5"` ili `"cat05"`) Android SDK **ne može** da
deserijalizuje u `Int` — zapis puca ili se preskače.

Web strana sada svaki upis provlači kroz `toDatabasePayload()`
(`src/app/utils/car-serialization.ts`), koja forsira `Number` tipove.

**Provera na Android strani:** nigde ne upisivati `editText.text.toString()`
direktno u numeričko polje. Uvek `.toIntOrNull() ?: 0`.

### 3.2. Izmena ide preko `updateChildren`, ne `setValue`

`setValue(car)` zamenjuje **ceo** objekat i briše svako polje koje ta aplikacija
ne poznaje. Konkretno: ako Android uradi `setValue` nad oglasom koji ima `phone`,
polje `phone` nestaje. Isto važi i obrnuto za `stability`.

Web strana koristi `update()`. Android treba da koristi:

```kotlin
databaseRef.child("Cars").child(carId).updateChildren(mapOf(
    "title" to title,
    "price" to price,
    // ... samo polja koja forma zaista menja
))
```

### 3.3. Ključ se ne upisuje u telo zapisa

Firebase push ključ je identitet zapisa. Ne dodavati ga kao polje `id` unutar
objekta (vidi tačku 8 — 21 postojeći zapis to greškom radi).

### 3.4. Prazne vrednosti

Ne upisivati prazan string u `fuelType` i `transmission`. U bazi trenutno postoje
zapisi sa `fuelType: ""` — vidi tačku 8.

---

## 4. Vlasništvo nad oglasom

`userId` je Firebase UID korisnika koji je oglas kreirao. Obe aplikacije ga
tumače isto:

- oglas može da **izmeni ili obriše samo vlasnik**,
- dugmad za izmenu/brisanje prikazuju se samo ako je `car.userId == auth.currentUser?.uid`,
- pri kreiranju se **uvek** upisuje `userId = auth.currentUser!!.uid` — nikada
  fiksna vrednost tipa `"admin"`.

Ovo nije samo kozmetika: sigurnosna pravila iz tačke 9 odbijaju svaki upis kod
kog `userId` nije jednak UID-u prijavljenog korisnika.

---

## 5. Dozvoljene vrednosti (enumeracije)

Vrednosti su stringovi na srpskom i **moraju biti identične** u obe aplikacije,
karakter po karakter, uključujući dijakritike.

```
fuelType:      "Benzin" | "Dizel" | "Električni" | "Hibrid" | "Plin"
transmission:  "Manuelni" | "Automatski"
```

> **Izmena:** web strana je dodala `"Plin"`, koje ranije nije postojalo.
> Dodati ga i u Android padajuću listu, inače vozilo uneto na web-u neće moći da
> se filtrira na telefonu.

---

## 6. Novo polje: `phone`

Web strana je uvela **opciono** polje `phone` (String, do 30 karaktera) — kontakt
telefon prodavca. U detaljima oglasa se prikazuje kao `tel:` link; ako polje ne
postoji, prikazuje se poruka da prodavac nije ostavio kontakt.

**Potrebno na Android strani:**

1. dodati `val phone: String? = null` u `Car`,
2. dodati opciono polje u formu za unos/izmenu,
3. prikazati ga na ekranu detalja (npr. `Intent(Intent.ACTION_DIAL)`).

Dok se ovo ne uradi, ništa neće pući — Android će samo ignorisati polje uz
upozorenje u logu. Ali ako Android uradi `setValue` (vidi 3.2), obrisaće ga.

---

## 7. Nepoznato polje: `stability` — pitanje za Android stranu

U bazi postoji **7 zapisa sa poljem `stability` (Int)**. Sve ih je upisao nalog
`8U6WS7cFmxOBDMYOa8d9hCehsjr2`, a web model ovo polje nikada nije poznavao —
zaključak je da ga upisuje Android aplikacija.

Zapisi: `-OlSb_b0P0kqguxA79As`, `-OlWy3g0DYHRV2so0A9x`, `-OlZFDieguURqAX5_Zco`,
`-OmGq0n2i3muUEZoICAt`, `-Ome5TUvb_VLqxWN90h_`, `-OnDeZPCp-YMyu9Hda5y`,
`-OtBLbzuUBeqLixpnyku`. U svima je vrednost `0`.

**Molim odgovor na jedno od dva:**

- **(a)** Polje je u upotrebi i ima značenje → javiti šta znači i koji je opseg,
  pa će web strana dodati polje u model, formu i prikaz.
- **(b)** Polje je zaostatak iz ranije verzije → ukloniti ga iz Kotlin modela, a
  web strana će jednokratno obrisati tih 7 vrednosti iz baze.

Do odgovora, web strana ga **ne dira** (`update()` ga čuva netaknutim).

---

## 8. Zatečeno stanje baze (izmereno 30.08.2026.)

Činjenice, radi dogovora oko čišćenja:

| Nalaz | Broj zapisa | Napomena |
|---|---|---|
| Ukupno oglasa u `Cars` | 29 | |
| Ima suvišno polje `id` u telu objekta | 21 | Duplira Firebase ključ, vidi 3.3 |
| Ima polje `stability` | 7 | Vidi tačku 7 |
| Ima polje `phone` | 0 | Novo polje, još nekorišćeno |
| `userId == "admin"` | 20 | Demo podaci, vidi upozorenje u tački 9 |
| `userId == "8U6WS7cFmxOBDMYOa8d9hCehsjr2"` | 9 | Stvarni korisnički nalog |
| `fuelType == ""` (prazno) | 1 | Zapis `-OtBLbzuUBeqLixpnyku`, posledica forme bez validacije |
| `transmission == ""` (prazno) | 1 | Isti zapis |

Svi numerički atributi su trenutno ispravno zapisani kao brojevi — baza je u tom
pogledu čista i treba je takvom održati.

Čvor `Category` sadrži 20 marki pod ključevima `cat00`–`cat19`, svaka sa
`{ id: Int, title: String, picUrl: String }`. Vrednost `id` odgovara polju
`categoryId` u oglasu. **Šifarnik je samo za čitanje — nijedna aplikacija ga ne
menja u toku rada.**

---

## 9. Sigurnosna pravila baze

Baza je trenutno **potpuno otvorena** — bilo ko može da čita, piše i briše bez
prijave. Predlog pravila nalazi se u `database.rules.json` (web projekat).

Suština: čitanje je javno, upis samo za prijavljenog korisnika i samo pod
sopstvenim `userId`, uz proveru tipa svakog polja.

### Šta Android mora da ispuni PRE nego što se pravila primene

1. Svaki upis nosi `userId = auth.currentUser!!.uid`. Upis bez prijave biće odbijen.
2. Numerička polja se šalju kao brojevi (pravila sadrže `newData.isNumber()`).
3. `picUrl` počinje sa `http://` ili `https://`.
4. `title` ima 3–80 karaktera, `seats` je 1–9, `productionYear` 1950–2100.

> **Upozorenje:** 20 demo oglasa ima `userId: "admin"`, što nije ničiji stvarni
> UID. Posle primene pravila **niko ih neće moći izmeniti ni obrisati** ni iz
> jedne aplikacije. Pre primene se treba dogovoriti: prepisati im `userId` na
> stvarni UID, ili ih ostaviti kao trajno nepromenljive demo podatke.

Pravila primeniti tek kad obe aplikacije zadovolje uslove, jer se odbijanje
upisa na Android strani vidi tek kao tiho neuspešno čuvanje.

---

## 10. Kontrolna lista za Android stranu

- [ ] `Car` data class usklađen sa tačkom 2 (nazivi i tipovi polja)
- [ ] Svi članovi imaju podrazumevanu vrednost; nema `@ThrowOnExtraProperties`
- [ ] Numerički unos konvertovan sa `.toIntOrNull() ?: 0`, nikad string
- [ ] Izmena koristi `updateChildren`, ne `setValue` (tačka 3.2)
- [ ] Ključ zapisa se ne upisuje kao polje `id`
- [ ] `userId` se upisuje kao stvarni UID prijavljenog korisnika
- [ ] Dodato `"Plin"` u listu goriva
- [ ] Dodato opciono polje `phone` (model + forma + ekran detalja)
- [ ] Odgovoreno na pitanje o polju `stability` (tačka 7)
- [ ] Forma validira unos — nema praznih `fuelType` / `transmission`
- [ ] Provereno da li aplikacija radi pod pravilima iz `database.rules.json`

---

## 11. Provera da sinhronizacija zaista radi

Test se izvodi **u oba smera**, sa istim nalogom prijavljenim na obe strane:

**Smer Android → Web**
1. Na telefonu postaviti nov oglas sa svim popunjenim poljima.
2. Web (`http://localhost:4200`) mora prikazati oglas **bez osvežavanja stranice**.
3. Filtrirati po marki tog vozila — oglas mora ostati u rezultatima.
   *(Ako nestane, `categoryId` je upisan kao string — vidi 3.1.)*
4. Otvoriti detalje na web-u i proveriti da su sve specifikacije popunjene.

**Smer Web → Android**
1. Na web-u izmeniti cenu i opis tog oglasa (`Moji oglasi` → `Izmeni`).
2. Na telefonu se lista mora ažurirati sama.
3. Proveriti da polje `stability` nije nestalo (dokaz da web koristi `update`).

**Provera vlasništva**
1. Prijaviti se drugim nalogom.
2. Tuđi oglas ne sme nuditi izmenu ni brisanje — ni na jednoj platformi.

**Provera brisanja**
1. Obrisati oglas na web-u → mora nestati i sa telefona, i obrnuto.

---

## 12. Šta web aplikacija trenutno radi

Radi orijentacije, ekrani na web strani (Angular 21, standalone komponente):

| Ruta | Ekran | Android pandan |
|---|---|---|
| `/` | Lista, pretraga, filteri (marka, cena, godište, gorivo), sortiranje | Home Screen |
| `/ad/:id` | Detalji oglasa, kontakt, akcije vlasnika | Details Screen |
| `/login` | Prijava i registracija | Login |
| `/add-car` | Forma za nov oglas (validirana) | AddCarScreen |
| `/edit-car/:id` | Ista forma u režimu izmene | AddCarScreen (Edit Mode) |
| `/my-ads` | Sopstveni oglasi: pregled, izmena, brisanje | Manage Cars |

Web strana čita preko `listVal`/`objectVal`, koji ostaju pretplaćeni na čvor —
otuda ažuriranje uživo bez osvežavanja.

---

## 13. Kontakt tačka za neslaganja

Ako Android aplikacija zahteva promenu bilo kog polja iz tačke 2, promena se
**prvo dogovara**, pa tek onda primenjuje — na obe strane u istom koraku.
Jednostrana izmena naziva ili tipa polja tiho kvari podatke druge aplikacije,
a greška se primeti tek kada oglas prestane da se prikazuje.
