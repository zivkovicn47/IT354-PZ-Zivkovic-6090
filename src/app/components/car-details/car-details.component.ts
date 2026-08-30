import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap, tap } from 'rxjs';

import { CarService } from '../../services/car.service';
import { AuthService } from '../../services/auth.service';
import { Car } from '../../models/car.model';
import { Category } from '../../models/category.model';
import { NavbarComponent } from '../navbar/navbar.component';
import { normalizeCategoryId } from '../../utils/car-filters';

/** Stanje učitavanja oglasa - templejt na osnovu njega bira šta prikazuje. */
type LoadState = 'loading' | 'loaded' | 'missing' | 'error';

/**
 * Prikaz jednog oglasa sa svim specifikacijama.
 *
 * Vlasniku oglasa dodatno nudi izmenu i brisanje. Podaci se prate uživo,
 * pa izmena napravljena u Android aplikaciji odmah menja i ovaj ekran.
 */
@Component({
    selector: 'app-car-details',
    standalone: true,
    imports: [DecimalPipe, RouterLink, NavbarComponent],
    templateUrl: './car-details.component.html',
    styleUrl: './car-details.component.css'
})
export class CarDetailsComponent {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private carService = inject(CarService);
    private authService = inject(AuthService);

    protected readonly state = signal<LoadState>('loading');
    protected readonly isDeleting = signal(false);
    protected readonly showDeleteDialog = signal(false);
    protected readonly actionError = signal('');

    private readonly categories = toSignal(
        this.carService.getCategories().pipe(catchError(() => of([] as Category[]))),
        { initialValue: [] as Category[] }
    );

    protected readonly car = toSignal(
        this.route.paramMap.pipe(
            switchMap((params) => {
                const id = params.get('id');
                this.state.set('loading');
                this.actionError.set('');

                if (!id) {
                    this.state.set('missing');
                    return of(null);
                }

                return this.carService.getCarById(id).pipe(
                    // Servis vraća `null` kada zapis ne postoji - to je "nije pronađeno",
                    // a ne greška, pa se stanja razdvajaju ovde.
                    tap((car) => this.state.set(car ? 'loaded' : 'missing')),
                    catchError(() => {
                        this.state.set('error');
                        return of(null);
                    })
                );
            })
        ),
        { initialValue: null as Car | null }
    );

    /** Naziv marke izveden iz `categoryId`. */
    protected readonly brandName = computed(() => {
        const car = this.car();
        if (!car) return '';

        const categoryId = normalizeCategoryId(car.categoryId);
        return this.categories().find((category) => category.id === categoryId)?.title ?? '';
    });

    /** Da li prijavljeni korisnik sme da menja i briše ovaj oglas. */
    protected readonly isOwner = computed(() => {
        const car = this.car();
        const uid = this.authService.currentUser()?.uid;
        return !!car && !!uid && car.userId === uid;
    });

    /** Dodaje mernu jedinicu samo ako je vrednost zaista broj. */
    protected formatValue(value: string | number | undefined | null, unit: string): string {
        if (value === null || value === undefined || value === '') return '—';

        const text = String(value).trim();
        const numeric = Number(text.replace(',', '.'));

        return Number.isFinite(numeric) ? `${text} ${unit}` : text;
    }

    protected async confirmDelete(): Promise<void> {
        const car = this.car();
        if (!car?.id) return;

        this.isDeleting.set(true);
        this.actionError.set('');

        try {
            await this.carService.deleteCar(car.id);
            await this.router.navigate(['/']);
        } catch {
            this.actionError.set('Brisanje nije uspelo. Pokušajte ponovo.');
            this.isDeleting.set(false);
            this.showDeleteDialog.set(false);
        }
    }
}
