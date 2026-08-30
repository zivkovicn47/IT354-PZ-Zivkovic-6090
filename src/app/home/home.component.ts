import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';

import { CarService } from '../services/car.service';
import { Car, FUEL_TYPES } from '../models/car.model';
import { NavbarComponent } from '../components/navbar/navbar.component';
import {
    CarFilters,
    SortOption,
    filterCars,
    hasActiveFilters,
    sortCars
} from '../utils/car-filters';

/**
 * Početna strana - pregled, pretraga i filtriranje oglasa.
 *
 * Lista se puni iz Realtime Database-a preko "živog" Observable-a, pa se
 * oglas dodat iz Android aplikacije ovde pojavljuje bez osvežavanja stranice.
 */
@Component({
    selector: 'app-home',
    standalone: true,
    imports: [DecimalPipe, FormsModule, NavbarComponent],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css'
})
export class HomeComponent {
    private carService = inject(CarService);
    private router = inject(Router);

    protected readonly fuelTypes = FUEL_TYPES;

    protected readonly loadError = signal(false);

    private readonly cars = toSignal(
        this.carService.getCars().pipe(
            catchError(() => {
                this.loadError.set(true);
                return of([] as Car[]);
            })
        ),
        { initialValue: undefined }
    );

    protected readonly categories = toSignal(
        this.carService.getCategories().pipe(catchError(() => of([]))),
        { initialValue: [] }
    );

    /** `true` dok prvi odgovor iz baze ne stigne. */
    protected readonly isLoading = computed(() => this.cars() === undefined && !this.loadError());

    protected readonly searchQuery = signal('');
    protected readonly selectedCategoryId = signal<number | null>(null);
    protected readonly minPrice = signal<number | null>(null);
    protected readonly maxPrice = signal<number | null>(null);
    protected readonly minYear = signal<number | null>(null);
    protected readonly selectedFuel = signal<string | null>(null);
    protected readonly sortBy = signal<SortOption>('default');
    protected readonly showFilters = signal(false);

    private readonly filters = computed<CarFilters>(() => ({
        query: this.searchQuery(),
        categoryId: this.selectedCategoryId(),
        minPrice: this.minPrice(),
        maxPrice: this.maxPrice(),
        minYear: this.minYear(),
        fuelType: this.selectedFuel()
    }));

    protected readonly filteredCars = computed(() =>
        sortCars(filterCars(this.cars() ?? [], this.filters()), this.sortBy())
    );

    protected readonly filtersActive = computed(() => hasActiveFilters(this.filters()));

    protected readonly selectedCategoryName = computed(() => {
        const id = this.selectedCategoryId();
        if (id === null) return '';
        return this.categories().find((category) => category.id === id)?.title ?? '';
    });

    /** Klik na već izabranu marku poništava filter. */
    protected toggleCategory(id: number): void {
        this.selectedCategoryId.update((current) => (current === id ? null : id));
    }

    protected resetFilters(): void {
        this.searchQuery.set('');
        this.selectedCategoryId.set(null);
        this.minPrice.set(null);
        this.maxPrice.set(null);
        this.minYear.set(null);
        this.selectedFuel.set(null);
        this.sortBy.set('default');
    }

    protected openDetails(id: string | undefined): void {
        if (id) {
            void this.router.navigate(['/ad', id]);
        }
    }
}
