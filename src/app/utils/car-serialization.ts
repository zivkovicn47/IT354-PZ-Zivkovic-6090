import { Car } from '../models/car.model';

/** Polja koja u bazi moraju biti brojevi (zbog deserijalizacije u Android aplikaciji). */
const NUMERIC_FIELDS = [
    'categoryId',
    'price',
    'productionYear',
    'mileage',
    'engineVolume',
    'enginePower',
    'highestSpeed',
    'seats'
] as const satisfies readonly (keyof Car)[];

/**
 * Priprema objekat za upis u Realtime Database.
 *
 * - uklanja `id` (ključ zapisa se ne duplira u telu objekta)
 * - uklanja `undefined` vrednosti (Firebase SDK ih odbija)
 * - forsira numeričke tipove kako bi Android `data class Car` mogao da pročita zapis
 */
export function toDatabasePayload(car: Partial<Car>): Record<string, unknown> {
    const { id, ...rest } = car;
    const payload: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(rest)) {
        if (value === undefined || value === null) continue;

        if ((NUMERIC_FIELDS as readonly string[]).includes(key)) {
            const parsed = Number(value);
            payload[key] = Number.isFinite(parsed) ? parsed : 0;
        } else if (typeof value === 'string') {
            const trimmed = value.trim();
            if (trimmed !== '') payload[key] = trimmed;
        } else {
            payload[key] = value;
        }
    }

    return payload;
}
