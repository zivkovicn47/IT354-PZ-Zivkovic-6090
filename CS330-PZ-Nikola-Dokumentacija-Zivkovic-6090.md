# DOKUMENTACIJA PROJEKTA

**Student:** Nikola Živković  
**Broj indeksa:** 6090  
**Predmet:** CS330 - Razvoj mobilnih aplikacija  
**Naziv projekta:** Android aplikacija za prodaju automobila (Car Marketplace)  

---

## 1. Uvod

Ovaj projekat predstavlja razvoj moderne Android aplikacije namenjene tržištu automobila ("Car Marketplace"). Aplikacija služi kao platforma koja omogućava korisnicima pregled dostupnih vozila, pretragu po specifičnim kriterijumima, kao i upravljanje oglasima.

Primarni cilj projekta bio je demonstracija praktične primene savremenih principa razvoja mobilnih aplikacija, sa posebnim fokusom na deklarativni korisnički interfejs (Jetpack Compose), reaktivno programiranje i integraciju sa _cloud_ bazama podataka u realnom vremenu. Aplikacija je dizajnirana tako da bude intuitivna za krajnjeg korisnika, a istovremeno robusna i skalabilna sa stanovišta softverske arhitekture.

## 2. Korišćene tehnologije i alati

Za realizaciju projekta korišćen je moderan tehnološki stek koji prati aktuelne industrijske standarde u Android ekosistemu:

*   **Programski jezik:** **Kotlin** – Kao primarni jezik za razvoj Android aplikacija, odabran zbog svoje konciznosti, sigurnosti (null-safety) i interoperabilnosti.
*   **Korisnički interfejs (UI):** **Jetpack Compose (Material3)** – Google-ov moderni alat za izradu nativnog UI-a. Korišćen je deklarativni pristup koji omogućava brži razvoj i lakše održavanje koda u odnosu na tradicionalni XML pristup.
*   **Softverska arhitektura:** **MVVM (Model-View-ViewModel)** – Ova arhitektura je striktno primenjena kako bi se odvojila poslovna logika i stanje aplikacije (ViewModel) od samog prikaza (View/Composable). Ovo olakšava testiranje i modularnost koda.
*   **Baza podataka:** **Firebase Realtime Database** – NoSQL baza podataka hostovana na oblaku koja omogućava sinhronizaciju podataka u realnom vremenu. Korišćena je JSON struktura za efikasno skladištenje objekata.
*   **Učitavanje slika:** **Coil (Coroutines Image Loader)** – Biblioteka za asinhrono učitavanje slika sa interneta (URL-ova) direktno u Compose komponente.
*   **Navigacija:** **Jetpack Navigation Compose** – Komponenta za upravljanje navigacijom između ekrana unutar "Single Activity" arhitekture.
*   **Upravljanje stanjem:** **Kotlin Coroutines & StateFlow** – Korišćeni za asinhrono izvršavanje zadataka (npr. mrežni pozivi ka bazi) i reaktivno ažuriranje UI-a na osnovu promena u podacima.

## 3. Funkcionalnosti aplikacije

Aplikacija se sastoji od nekoliko ključnih modula koji zajedno čine funkcionalnu celinu:

### 3.1. Početni ekran (Home Screen) & Pretraga
*   **Prikaz ponude:** Centralni deo aplikacije prikazuje listu popularnih automobila. Svaka kartica vozila sadrži sliku, naziv modela i cenu.
*   **Napredno filtriranje:** Implementiran je sistem filtriranja po kategorijama (brendovima kao što su BMW, Audi, Mercedes). Klikom na logo brenda, lista vozila se momentalno ažurira prikazujući samo vozila čiji se `categoryId` poklapada sa odabranim.
*   **Pretraga:** Korisnici mogu pretraživati vozila po nazivu u realnom vremenu.

### 3.2. Ekran sa detaljima (Details Screen)
*   Klikom na bilo koje vozilo, korisnik se preusmerava na ekran sa detaljnim informacijama.
*   Prikazuju se ključne specifikacije: snaga motora (Engine Output), maksimalna brzina (Top Speed), broj sedišta (Total Capacity) i detaljan tekstualni opis vozila.

### 3.3. Admin Panel i Upravljanje Oglasima (CRUD)
Jedan od najvažnijih delova projekta je implementacija kompletnih **CRUD (Create, Read, Update, Delete)** operacija, omogućavajući administratorsko upravljanje sadržajem:

*   **Dodavanje vozila (Create):** Implementiran je ekran `AddCarScreen` koji sadrži formu za unos svih atributa vozila. Omogućeno je korišćenje spoljnih linkova (URL) za slike, čime se izbegava potreba za kompleksnim skladištenjem fajlova.
*   **Izmena vozila (Update):** Postojeća forma za dodavanje je refaktorisana da podržava i režim izmene ("Edit Mode"). Ukoliko se forma otvori za postojeće vozilo, sva polja se automatski popunjavaju trenutnim podacima, a čuvanjem se ažurira postojeći zapis u bazi umesto kreiranja novog.
*   **Brisanje vozila (Delete):** Putem posebnog ekrana za upravljanje ("Manage Cars"), administrator može ukloniti vozilo. Implementiran je sigurnosni mehanizam (Alert Dialog) koji traži potvrdu pre trajnog brisanja podataka iz baze.
*   **Navigacija do Admin Panela:** Pristup ovim funkcionalnostima omogućen je preko Profil ekrana, čime je administrativni deo odvojen od korisničkog pregleda.

## 4. Struktura baze podataka

Podaci su organizovani u Firebase Realtime Database-u koristeći hijerarhijsku JSON strukturu:

1.  **`Cars`**: Glavni čvor koji sadrži listu svih vozila. Svako vozilo je objekat sa jedinstvenim generisanim ključem (ID) i atributima:
    *   `title`: Naziv modela (String)
    *   `price`: Cena (Double)
    *   `description`: Opis (String)
    *   `picUrl`: Link do slike (String)
    *   `categoryId`: ID kategorije kojoj pripada (Int)
    *   `engineOutput`, `highestSpeed`, `totalCapacity`: Tehničke specifikacije.
2.  **`Category`**: Pomoćni čvor ili šifarnik koji definiše dostupne kategorije/brendove radi konzistentnog filtriranja.

## 5. Zaključak

Rad na ovom projektu omogućio mi je da dublje razumem arhitekturu modernih Android aplikacija. Ključni ishodi učenja obuhvataju:
*   Savladavanje **Jetpack Compose** okvira za kreiranje UI-a, što predstavlja značajan napredak u odnosu na XML.
*   Razumevanje principa **State Hoisting-a** i toka podataka u MVVM arhitekturi.
*   Uspešnu implementaciju asinhronih operacija sa **Coroutines**-ima, što je ključno za aplikacije koje zavise od mrežnih resursa.
*   Rešavanje realnih problema, poput upravljanja stanjem formi za unos podataka i sinhronizacije lokalnog prikaza sa stanjem na serveru (Firebase).

Projekat predstavlja zaokruženu celinu koja pokriva sve faze razvoja softvera, od dizajniranja baze podataka do implementacije korisničkog interfejsa i poslovne logike.
