import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { HomeComponent } from './home.component';
import { CarService } from '../services/car.service';
import { AuthService } from '../services/auth.service';
import { Car } from '../models/car.model';
import { Category } from '../models/category.model';

const CARS: Car[] = [
    {
        id: 'a',
        userId: 'u1',
        categoryId: 0,
        title: 'BMW 320i',
        price: 22000,
        description: 'Udobna limuzina.',
        picUrl: 'https://example.com/a.jpg',
        productionYear: 2019,
        mileage: 95000,
        fuelType: 'Benzin',
        transmission: 'Automatski',
        engineVolume: 1998,
        enginePower: 184,
        highestSpeed: 235,
        seats: 5
    },
    {
        id: 'b',
        userId: 'u1',
        categoryId: 1,
        title: 'Audi A4',
        price: 15000,
        description: 'Karavan, prvi vlasnik.',
        picUrl: 'https://example.com/b.jpg',
        productionYear: 2014,
        mileage: 180000,
        fuelType: 'Dizel',
        transmission: 'Manuelni',
        engineVolume: 1968,
        enginePower: 150,
        highestSpeed: 210,
        seats: 5
    }
];

const CATEGORIES: Category[] = [
    { key: 'cat00', id: 0, title: 'BMW', picUrl: 'https://example.com/bmw.png' },
    { key: 'cat01', id: 1, title: 'Audi', picUrl: 'https://example.com/audi.png' }
];

describe('HomeComponent', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HomeComponent],
            providers: [
                provideRouter([]),
                {
                    provide: CarService,
                    useValue: {
                        getCars: () => of(CARS),
                        getCategories: () => of(CATEGORIES)
                    }
                },
                {
                    provide: AuthService,
                    useValue: { currentUser: () => null, logout: () => Promise.resolve() }
                }
            ]
        }).compileComponents();
    });

    it('prikazuje sve oglase iz baze', async () => {
        const fixture = TestBed.createComponent(HomeComponent);
        await fixture.whenStable();

        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.querySelectorAll('article')).toHaveLength(2);
        expect(compiled.textContent).toContain('BMW 320i');
        expect(compiled.textContent).toContain('Audi A4');
    });

    it('prikazuje sve dostupne marke', async () => {
        const fixture = TestBed.createComponent(HomeComponent);
        await fixture.whenStable();

        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.textContent).toContain('Istraži po markama');
    });

    it('filtriranje po marki ostavlja samo odgovarajuće oglase', async () => {
        const fixture = TestBed.createComponent(HomeComponent);
        await fixture.whenStable();

        const component = fixture.componentInstance as unknown as {
            toggleCategory: (id: number) => void;
            filteredCars: () => Car[];
        };

        component.toggleCategory(1);
        await fixture.whenStable();

        expect(component.filteredCars().map((car) => car.id)).toEqual(['b']);

        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.querySelectorAll('article')).toHaveLength(1);
        expect(compiled.textContent).toContain('Audi A4');
        expect(compiled.textContent).not.toContain('BMW 320i');
    });

    it('prikazuje poruku kada pretraga nema rezultata', async () => {
        const fixture = TestBed.createComponent(HomeComponent);
        await fixture.whenStable();

        const component = fixture.componentInstance as unknown as {
            searchQuery: { set: (value: string) => void };
        };

        component.searchQuery.set('nepostojeci model');
        await fixture.whenStable();

        expect((fixture.nativeElement as HTMLElement).textContent).toContain('Nema rezultata');
    });
});
