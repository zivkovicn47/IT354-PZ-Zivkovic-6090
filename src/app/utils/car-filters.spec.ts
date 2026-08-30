import { Car } from '../models/car.model';
import {
    EMPTY_FILTERS,
    filterCars,
    hasActiveFilters,
    normalizeCategoryId,
    sortCars
} from './car-filters';

function makeCar(overrides: Partial<Car> = {}): Car {
    return {
        id: 'car01',
        userId: 'user1',
        categoryId: 0,
        title: 'BMW 320i',
        price: 22000,
        description: 'Udobna limuzina za svaki dan.',
        picUrl: 'https://example.com/bmw.jpg',
        productionYear: 2019,
        mileage: 95000,
        fuelType: 'Benzin',
        transmission: 'Automatski',
        engineVolume: 1998,
        enginePower: 184,
        highestSpeed: 235,
        seats: 5,
        ...overrides
    };
}

describe('normalizeCategoryId', () => {
    it('propušta broj nepromenjen', () => {
        expect(normalizeCategoryId(5)).toBe(5);
        expect(normalizeCategoryId(0)).toBe(0);
    });

    it('konvertuje numerički string', () => {
        expect(normalizeCategoryId('12')).toBe(12);
    });

    it('prepoznaje oblik ključa iz baze ("cat05")', () => {
        expect(normalizeCategoryId('cat05')).toBe(5);
        expect(normalizeCategoryId('cat19')).toBe(19);
    });

    it('vraća null za neupotrebljive vrednosti', () => {
        expect(normalizeCategoryId(null)).toBeNull();
        expect(normalizeCategoryId(undefined)).toBeNull();
        expect(normalizeCategoryId('')).toBeNull();
        expect(normalizeCategoryId('nepoznato')).toBeNull();
    });
});

describe('filterCars', () => {
    const cars = [
        makeCar({ id: 'a', title: 'BMW 320i', categoryId: 0, price: 22000, productionYear: 2019 }),
        makeCar({
            id: 'b',
            title: 'Audi A4',
            categoryId: 1,
            price: 15000,
            productionYear: 2014,
            fuelType: 'Dizel'
        }),
        makeCar({ id: 'c', title: 'Tesla Model 3', categoryId: 3, price: 39000, productionYear: 2022 })
    ];

    it('bez filtera vraća sve oglase', () => {
        expect(filterCars(cars, EMPTY_FILTERS)).toHaveLength(3);
    });

    it('pretražuje po nazivu, bez obzira na veličinu slova', () => {
        const result = filterCars(cars, { ...EMPTY_FILTERS, query: 'audi' });
        expect(result.map((car) => car.id)).toEqual(['b']);
    });

    it('filtrira po kategoriji', () => {
        const result = filterCars(cars, { ...EMPTY_FILTERS, categoryId: 3 });
        expect(result.map((car) => car.id)).toEqual(['c']);
    });

    it('poredi kategoriju i kada je zapisana kao string (kompatibilnost sa starijim zapisima)', () => {
        const legacy = [makeCar({ id: 'legacy', categoryId: 'cat07' as unknown as number })];
        expect(filterCars(legacy, { ...EMPTY_FILTERS, categoryId: 7 })).toHaveLength(1);
    });

    it('filtrira po rasponu cene', () => {
        const result = filterCars(cars, { ...EMPTY_FILTERS, minPrice: 16000, maxPrice: 30000 });
        expect(result.map((car) => car.id)).toEqual(['a']);
    });

    it('filtrira po godištu i gorivu', () => {
        expect(filterCars(cars, { ...EMPTY_FILTERS, minYear: 2019 })).toHaveLength(2);
        expect(filterCars(cars, { ...EMPTY_FILTERS, fuelType: 'Dizel' })).toHaveLength(1);
    });

    it('kombinuje više kriterijuma istovremeno', () => {
        const result = filterCars(cars, {
            ...EMPTY_FILTERS,
            query: 'model',
            minPrice: 30000,
            minYear: 2020
        });
        expect(result.map((car) => car.id)).toEqual(['c']);
    });
});

describe('sortCars', () => {
    const cars = [
        makeCar({ id: 'a', price: 22000, productionYear: 2019, mileage: 95000 }),
        makeCar({ id: 'b', price: 15000, productionYear: 2014, mileage: 180000 }),
        makeCar({ id: 'c', price: 39000, productionYear: 2022, mileage: 20000 })
    ];

    it('sortira po ceni rastuće i opadajuće', () => {
        expect(sortCars(cars, 'price-asc').map((car) => car.id)).toEqual(['b', 'a', 'c']);
        expect(sortCars(cars, 'price-desc').map((car) => car.id)).toEqual(['c', 'a', 'b']);
    });

    it('sortira po godištu i kilometraži', () => {
        expect(sortCars(cars, 'year-desc').map((car) => car.id)).toEqual(['c', 'a', 'b']);
        expect(sortCars(cars, 'mileage-asc').map((car) => car.id)).toEqual(['c', 'a', 'b']);
    });

    it('ne menja ulazni niz', () => {
        const original = [...cars];
        sortCars(cars, 'price-desc');
        expect(cars).toEqual(original);
    });
});

describe('hasActiveFilters', () => {
    it('prazno stanje nema aktivnih filtera', () => {
        expect(hasActiveFilters(EMPTY_FILTERS)).toBe(false);
    });

    it('prepoznaje aktivan filter', () => {
        expect(hasActiveFilters({ ...EMPTY_FILTERS, categoryId: 2 })).toBe(true);
        expect(hasActiveFilters({ ...EMPTY_FILTERS, query: '  ' })).toBe(false);
        expect(hasActiveFilters({ ...EMPTY_FILTERS, query: 'bmw' })).toBe(true);
    });
});
