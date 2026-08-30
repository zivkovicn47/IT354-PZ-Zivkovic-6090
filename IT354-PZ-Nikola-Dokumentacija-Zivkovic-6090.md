# DOKUMENTACIJA PROJEKTA

**Student:** Nikola Živković
**Broj indeksa:** 6090
**Predmet:** IT354 - Razvoj veb aplikacija
**Naziv projekta:** Veb aplikacija za prodaju automobila (PolovniAutomobili)

---

## 1. Uvod

Projekat predstavlja jednostraničnu veb aplikaciju (SPA) za oglašavanje i prodaju
polovnih automobila, izrađenu u Angular okruženju. Korisnicima omogućava pregled
ponude, pretragu i filtriranje vozila, pregled detaljnih specifikacija, kao i
kompletno upravljanje sopstvenim oglasima nakon prijave.

Specifičnost projekta je što veb aplikacija **deli podatke sa Android aplikacijom**
razvijenom u okviru predmeta CS330. Obe aplikacije koriste isti Firebase projekat,
iste čvorove baze i isti sistem autentikacije, pa korisnik može oglas postaviti sa
telefona, a izmeniti ga sa računara - i obrnuto. Zbog toga je jedan od osnovnih
zahteva projekta bio da šema podataka ostane kompatibilna između dve platforme,
što je detaljno objašnjeno u poglavlju 6.

## 2. Korišćene tehnologije

| Tehnologija | Uloga u projektu |
|---|---|
| **Angular 21** | Osnovni okvir - standalone komponente, rutiranje, forme |
| **TypeScript** (strict) | Statička tipizacija, `strictTemplates` uključen |
| **Angular Signals** | Upravljanje stanjem komponenti i izvedene vrednosti (`computed`) |
| **RxJS + `toSignal`** | Reaktivni tok podataka iz baze ka signalima |
| **Firebase Realtime Database** (`@angular/fire`) | Skladištenje oglasa i sinhronizacija uživo |
| **Firebase Authentication** | Prijava i registracija (email + lozinka) |
| **Tailwind CSS 4** | Stilizacija kroz PostCSS, kompajlira se u build |
| **Vitest** | Unit testovi poslovne logike |

## 3. Arhitektura aplikacije

Aplikacija je organizovana po slojevima:

**Sloj prikaza (komponente).** Sve komponente su `standalone` - ne postoji
`NgModule`. Zaglavlje je izdvojeno u zajedničku `NavbarComponent`, koja se
ponovo koristi na svim ekranima.

**Sloj servisa.** `CarService` enkapsulira sav pristup `Cars` i `Category`
čvorovima, a `AuthService` autentikaciju. Komponente nikada ne pristupaju bazi
direktno, već isključivo preko servisa (`providedIn: 'root'`, ubrizgavanje
pomoću `inject()`).

**Sloj čistih funkcija (`utils/`).** Logika filtriranja, sortiranja i pripreme
podataka za upis izdvojena je u funkcije bez zavisnosti od Angular-a. Takva
logika je nezavisno testirana - vidi poglavlje 8.

**Modeli.** `Car` i `Category` interfejsi predstavljaju ugovor sa bazom, a time
i sa Android aplikacijom.

### 3.1. Rutiranje

Sve rute koriste lenjo učitavanje (`loadComponent`), pa se kod pojedinačnog
ekrana preuzima tek kada ga korisnik otvori:

```typescript
{
    path: 'add-car',
    canActivate: [authGuard],
    loadComponent: () =>
        import('./components/car-form/car-form.component').then((m) => m.CarFormComponent)
}
```

Definisane rute: `/`, `/login`, `/add-car`, `/edit-car/:id`, `/my-ads`, `/ad/:id`
i wildcard `**` za nepostojeće adrese.

### 3.2. Zaštita ruta

`authGuard` je funkcionalni čuvar (`CanActivateFn`) koji štiti rute za dodavanje,
izmenu i pregled sopstvenih oglasa. Neprijavljeni korisnik se preusmerava na
prijavu, uz pamćenje odredišta:

```typescript
return authState(auth).pipe(
    take(1),
    map((user) =>
        user ? true : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } })
    )
);
```

Namerno se koristi `authState`, a ne obična provera - njegova prva vrednost stiže
tek pošto Firebase razreši postojeću sesiju, pa prijavljen korisnik ne biva
pogrešno izbačen pri osvežavanju stranice.

### 3.3. Upravljanje stanjem

Podaci iz baze se pretvaraju u signale pomoću `toSignal`, a izvedene vrednosti
računaju kroz `computed`:

```typescript
protected readonly filteredCars = computed(() =>
    sortCars(filterCars(this.cars() ?? [], this.filters()), this.sortBy())
);
```

Promena bilo kog filtera automatski preračunava listu, bez ručnog pretplaćivanja
i bez `ngOnDestroy` logike.

## 4. Funkcionalnosti

### 4.1. Početni ekran, pretraga i filtriranje

Prikazuje se lista svih oglasa u obliku kartica (slika, naziv, godište,
kilometraža, gorivo, cena). Dostupno je:

- pretraga po nazivu i opisu vozila,
- filtriranje po marki klikom na logo,
- napredni filteri: raspon cene, godište, vrsta goriva,
- sortiranje po ceni, godištu i kilometraži.

Dok podaci stižu iz baze, prikazuju se "skeleton" kartice, a posebno su obrađena
stanja "nema rezultata" i greške pri učitavanju.

### 4.2. Detalji oglasa

Prikaz svih specifikacija vozila. Ekran razlikuje četiri stanja: učitavanje,
uspešno učitan oglas, nepostojeći oglas i grešku. Ako je prodavac ostavio broj
telefona, dugme "Pozovi prodavca" otvara `tel:` link.

### 4.3. Autentikacija

Jedna komponenta pokriva prijavu i registraciju. Firebase kodovi grešaka prevode
se u poruke na srpskom (`AuthService.getReadableError`). Posle uspešne prijave
korisnik se vraća na stranicu sa koje je poslat na prijavu.

### 4.4. CRUD nad oglasima

| Operacija | Implementacija | Ekran |
|---|---|---|
| Create | `push(ref(db, 'Cars'), payload)` | `/add-car` |
| Read | `listVal` / `objectVal` | `/` i `/ad/:id` |
| Update | `update(ref(db, 'Cars/:id'), payload)` | `/edit-car/:id` |
| Delete | `remove(ref(db, 'Cars/:id'))` | `/ad/:id` i `/my-ads` |

Ista komponenta (`CarFormComponent`) služi i za dodavanje i za izmenu. U režimu
izmene učitava postojeći oglas, popunjava polja i proverava vlasništvo - ako
korisnik nije vlasnik, preusmerava se na prikaz oglasa.

Brisanje je zaštićeno modalnim dijalogom za potvrdu, umesto `confirm()` funkcije.

### 4.5. Moji oglasi

Ekran `/my-ads` prikazuje samo oglase prijavljenog korisnika, sa ukupnom
vrednošću i akcijama za prikaz, izmenu i brisanje. Predstavlja veb pandan
"Manage Cars" ekranu iz Android aplikacije.

### 4.6. Validacija forme

Forma je template-driven (`ngForm` + `ngModel`) i validira:

- naslov (obavezan, najmanje 3 karaktera),
- cenu (obavezna, veća od nule),
- marku, gorivo i menjač (obavezan izbor),
- opis (najmanje 10 karaktera),
- URL slike (mora počinjati sa `http://` ili `https://`, uz prikaz slike),
- numeričke specifikacije, svaka sa svojim opsegom (npr. godište 1950 - tekuća+1,
  broj sedišta 1-9).

Poruke o grešci prikazuju se ispod polja tek kada ga korisnik dodirne
(`touched`), a dugme za slanje je onemogućeno dok forma nije ispravna.

## 5. Struktura baze podataka

Baza je Firebase Realtime Database, organizovana u dva čvora:

**`Cars`** - svaki oglas je objekat pod jedinstvenim ključem:

| Polje | Tip | Opis |
|---|---|---|
| `title` | String | Naziv modela |
| `price` | Number | Cena u evrima |
| `description` | String | Opis vozila |
| `picUrl` | String | Link do slike |
| `categoryId` | Number | Marka (veza ka `Category.id`) |
| `productionYear` | Number | Godište |
| `mileage` | Number | Kilometraža |
| `fuelType` | String | Benzin / Dizel / Električni / Hibrid / Plin |
| `transmission` | String | Manuelni / Automatski |
| `engineVolume` | Number | Zapremina motora u cm³ |
| `enginePower` | Number | Snaga u KS |
| `highestSpeed` | Number | Maksimalna brzina |
| `seats` | Number | Broj sedišta |
| `userId` | String | UID vlasnika oglasa |
| `phone` | String | Opciono - kontakt telefon |

**`Category`** - šifarnik marki (`cat00` - `cat19`), svaka sa numeričkim `id`,
nazivom i logotipom.

## 6. Sinhronizacija sa Android aplikacijom

Ovo je centralni zahtev projekta i uticao je na više tehničkih odluka.

### 6.1. Zajednički resursi

Obe aplikacije koriste isti Firebase projekat (`project250-65f0d`), iste čvorove
i isti Authentication, pa isti nalog i isti oglasi postoje na obe platforme.

### 6.2. Sinhronizacija u realnom vremenu

`listVal` i `objectVal` ne izvršavaju jednokratni upit, već ostaju pretplaćeni na
čvor. Kada Android aplikacija izmeni oglas, Firebase gura promenu ka svim
pretplaćenim klijentima, `toSignal` je upisuje u signal, a Angular automatski
ponovo iscrtava prikaz. Rezultat: izmena sa telefona vidi se na web-u bez
osvežavanja stranice.

### 6.3. Očuvanje tipova podataka

Najosetljiviji deo sinhronizacije jesu tipovi. Kotlin `data class` sa poljem
`val categoryId: Int` ne može da pročita vrednost koja je u bazi zapisana kao
string. HTML `<select>` element, međutim, uvek vraća string.

Zbog toga se u formi koristi `[ngValue]` (koji čuva pravi tip vrednosti) umesto
`[value]`, a svaki upis dodatno prolazi kroz `toDatabasePayload()`, koja:

- uklanja `id` iz tela zapisa (ključ se ne duplira),
- uklanja `undefined` i `null` vrednosti, koje Firebase SDK odbija,
- forsira numeričke tipove za sva brojčana polja.

Za čitanje postoji obrnuta zaštita - `normalizeCategoryId()` prihvata vrednost u
oblicima `5`, `"5"` i `"cat05"`, čime aplikacija ostaje otporna i na starije
zapise u bazi.

### 6.4. Očuvanje nepoznatih polja

Izmena koristi `update()`, a ne `set()`. `set()` bi zamenio ceo objekat i obrisao
polja koja poznaje samo Android aplikacija; `update()` menja isključivo poslata
polja.

### 6.5. Vlasništvo nad oglasom

Polje `userId` čuva UID vlasnika i identično se tumači u obe aplikacije - samo
vlasnik vidi opcije za izmenu i brisanje.

## 7. Sigurnost

Predložena sigurnosna pravila baze nalaze se u `database.rules.json`:

- čitanje oglasa je javno,
- upis je dozvoljen samo prijavljenom korisniku i samo pod sopstvenim `userId`,
- svako polje ima `.validate` pravilo koje proverava tip i opseg vrednosti,
- šifarnik `Category` je samo za čitanje.

Time se provera koja u aplikaciji postoji na nivou korisničkog interfejsa
podupire i na strani servera, pa je ne može zaobići ni direktan HTTP poziv ka
bazi.

Firebase web API ključ nije tajna i njegovo prisustvo u izvornom kodu je
očekivano - kontrolu pristupa vrše pravila baze, a ne skrivanje ključa.

## 8. Testiranje

Testovi su pisani u Vitest okruženju - ukupno 27 testa u 4 datoteke.

**Testovi poslovne logike** (`utils/`):

- `normalizeCategoryId` - svi oblici ulaza, uključujući `"cat05"`,
- `filterCars` - pretraga, filtriranje po marki, ceni, godištu, gorivu i
  kombinacija više kriterijuma,
- `sortCars` - sva sortiranja i provera da ulazni niz ostaje nepromenjen,
- `toDatabasePayload` - najvažnija grupa za sinhronizaciju: provera da numerička
  polja završavaju u bazi kao brojevi.

**Testovi komponenti:**

- `App` - kreiranje korene komponente i prisustvo `router-outlet`-a,
- `HomeComponent` - sa lažnim (mock) servisom umesto baze proverava se da se
  oglasi zaista iscrtavaju, da filtriranje po marki uklanja neodgovarajuće
  kartice i da se prikazuje poruka kada pretraga nema rezultata.

```
Test Files  4 passed (4)
Tests       27 passed (27)
```

## 9. Optimizacija

Lenjim učitavanjem ruta početni bundle sadrži samo koren aplikacije i Firebase
SDK, dok se svaki ekran preuzima zasebno (npr. forma 19 kB, početna 15 kB).
Slike koriste `loading="lazy"`.

## 10. Pristupačnost

Kartice oglasa dostupne su tastaturom (`tabindex`, `role`, obrada `Enter` i
`Space`), sva polja forme imaju povezane `<label>` elemente, poruke o greškama
koriste `role="alert"`, a interaktivni elementi vidljiv fokus
(`focus-visible:ring`).

## 11. Zaključak

Kroz izradu projekta savladan je razvoj savremene Angular aplikacije - od
standalone komponenti i signala, preko rutiranja sa zaštitom i lenjim
učitavanjem, do integracije sa oblak bazom podataka.

Najveći praktični izazov bio je zahtev da veb i Android aplikacija dele istu
bazu. Taj zahtev je pokazao da granica između dve aplikacije nije samo mrežni
protokol, već i **šema podataka**: naizgled bezazlena razlika između broja i
stringa u jednom polju dovoljna je da zapis upisan sa web-a postane nečitljiv
za mobilnu aplikaciju. Rešenje je bilo izdvajanje normalizacije podataka u
zaseban, testiran sloj kroz koji prolazi svaki upis, i korišćenje `update()`
umesto `set()` kako nijedna aplikacija ne bi brisala polja one druge.

Projekat je zaokružena celina koja pokriva sve faze razvoja - modelovanje
podataka, implementaciju korisničkog interfejsa i poslovne logike, testiranje i
definisanje sigurnosnih pravila.
