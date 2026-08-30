/**
 * Model oglasa za vozilo.
 *
 * VAŽNO (sinhronizacija sa Android aplikacijom - CS330):
 * Nazivi i tipovi polja moraju biti identični sa Kotlin `data class Car`,
 * jer obe aplikacije čitaju i pišu isti `Cars` čvor u Firebase Realtime Database-u.
 * Sva numerička polja moraju biti brojevi (Int/Double), nikada stringovi,
 * inače ih Android SDK ne može deserijalizovati.
 */
export interface Car {
    /** Firebase ključ zapisa. Ne upisuje se u bazu - dodaje ga servis pri čitanju. */
    id?: string;
    /** UID vlasnika oglasa (Firebase Authentication). */
    userId?: string;

    categoryId: number;
    title: string;
    price: number;
    description: string;
    picUrl: string;

    productionYear: number;
    mileage: number;
    fuelType: string;
    transmission: string;
    engineVolume: number;
    enginePower: number;
    highestSpeed: number;
    seats: number;

    /** Opciono - kontakt telefon prodavca. Vidi napomenu o Android modelu u dokumentaciji. */
    phone?: string;
}

/** Dozvoljene vrednosti za `fuelType` - moraju se poklapati sa Android aplikacijom. */
export const FUEL_TYPES = ['Benzin', 'Dizel', 'Električni', 'Hibrid', 'Plin'] as const;

/** Dozvoljene vrednosti za `transmission` - moraju se poklapati sa Android aplikacijom. */
export const TRANSMISSION_TYPES = ['Manuelni', 'Automatski'] as const;
