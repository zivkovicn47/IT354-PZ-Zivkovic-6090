import { Car } from '../models/car.model';

/** Kriterijumi pretrage i filtriranja na početnoj strani. */
export interface CarFilters {
    query: string;
    categoryId: number | null;
    minPrice: number | null;
    maxPrice: number | null;
    minYear: number | null;
    fuelType: string | null;
}

export type SortOption = 'default' | 'price-asc' | 'price-desc' | 'year-desc' | 'mileage-asc';

export const EMPTY_FILTERS: CarFilters = {
    query: '',
    categoryId: null,
    minPrice: null,
    maxPrice: null,
    minYear: null,
    fuelType: null
};

/**
 * Svodi identifikator kategorije na broj, bez obzira na oblik u kome stiže.
 *
 * Podržani oblici: 5 | "5" | "cat05" | "cat5". Vraća `null` za sve ostalo.
 * Neophodno jer se ista baza deli sa Android aplikacijom, a stariji zapisi
 * su mogli biti upisani u drugačijem obliku.
 */
export function normalizeCategoryId(value: unknown): number | null {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;

    const text = String(value).trim();
    const digits = text.startsWith('cat') ? text.slice(3) : text;
    const parsed = Number(digits);

    return Number.isFinite(parsed) && digits !== '' ? parsed : null;
}

/** Da li vozilo zadovoljava sve zadate kriterijume. */
export function matchesFilters(car: Car, filters: CarFilters): boolean {
    const query = filters.query.trim().toLowerCase();
    if (query) {
        const haystack = `${car.title ?? ''} ${car.description ?? ''}`.toLowerCase();
        if (!haystack.includes(query)) return false;
    }

    if (filters.categoryId !== null && normalizeCategoryId(car.categoryId) !== filters.categoryId) {
        return false;
    }

    const price = Number(car.price);
    if (filters.minPrice !== null && !(price >= filters.minPrice)) return false;
    if (filters.maxPrice !== null && !(price <= filters.maxPrice)) return false;

    if (filters.minYear !== null && !(Number(car.productionYear) >= filters.minYear)) return false;

    if (filters.fuelType && car.fuelType !== filters.fuelType) return false;

    return true;
}

/** Filtrira listu vozila prema zadatim kriterijumima. */
export function filterCars(cars: readonly Car[], filters: CarFilters): Car[] {
    return cars.filter((car) => matchesFilters(car, filters));
}

/** Vraća novu, sortiranu listu (ulazni niz se ne menja). */
export function sortCars(cars: readonly Car[], sortBy: SortOption): Car[] {
    const result = [...cars];

    switch (sortBy) {
        case 'price-asc':
            return result.sort((a, b) => Number(a.price) - Number(b.price));
        case 'price-desc':
            return result.sort((a, b) => Number(b.price) - Number(a.price));
        case 'year-desc':
            return result.sort((a, b) => Number(b.productionYear) - Number(a.productionYear));
        case 'mileage-asc':
            return result.sort((a, b) => Number(a.mileage) - Number(b.mileage));
        default:
            return result;
    }
}

/** Da li je bar jedan filter aktivan. */
export function hasActiveFilters(filters: CarFilters): boolean {
    return (
        filters.query.trim() !== '' ||
        filters.categoryId !== null ||
        filters.minPrice !== null ||
        filters.maxPrice !== null ||
        filters.minYear !== null ||
        filters.fuelType !== null
    );
}
