import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, combineLatest, of, take } from 'rxjs';

import { CarService } from '../../services/car.service';
import { AuthService } from '../../services/auth.service';
import { Car, FUEL_TYPES, TRANSMISSION_TYPES } from '../../models/car.model';
import { NavbarComponent } from '../navbar/navbar.component';

/**
 * Forma za unos i izmenu oglasa.
 *
 * Ista komponenta pokriva dva režima:
 *  - `/add-car`      - kreiranje novog oglasa (`push` u Realtime Database)
 *  - `/edit-car/:id` - izmena postojećeg (`update`, uz proveru vlasništva)
 *
 * Vrednosti se pre upisa normalizuju (`toDatabasePayload` u servisu) kako bi
 * zapis ostao čitljiv i za Android aplikaciju koja deli istu bazu.
 */
@Component({
    selector: 'app-car-form',
    standalone: true,
    imports: [FormsModule, NavbarComponent],
    templateUrl: './car-form.component.html'
})
export class CarFormComponent {
    private carService = inject(CarService);
    private authService = inject(AuthService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    protected readonly fuelTypes = FUEL_TYPES;
    protected readonly transmissionTypes = TRANSMISSION_TYPES;
    protected readonly currentYear = new Date().getFullYear();

    protected readonly categories = toSignal(
        this.carService.getCategories().pipe(catchError(() => of([]))),
        { initialValue: [] }
    );

    /** Firebase ključ oglasa koji se menja, ili `null` u režimu dodavanja. */
    protected readonly editingId = signal<string | null>(null);
    protected readonly isEditMode = computed(() => this.editingId() !== null);

    protected readonly isSaving = signal(false);
    protected readonly isLoadingCar = signal(false);
    protected readonly errorMessage = signal('');

    /** Model forme. Brojevi su `null` dok se ne unesu, da polja ne bi prikazivala nulu. */
    protected car: Partial<Car> = this.emptyCar();

    constructor() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadForEditing(id);
        }
    }

    private emptyCar(): Partial<Car> {
        return {
            title: '',
            price: undefined,
            description: '',
            picUrl: '',
            categoryId: undefined,
            productionYear: undefined,
            mileage: undefined,
            fuelType: '',
            transmission: '',
            engineVolume: undefined,
            enginePower: undefined,
            highestSpeed: undefined,
            seats: undefined,
            phone: ''
        };
    }

    /** Učitava postojeći oglas i dozvoljava izmenu samo vlasniku. */
    private loadForEditing(id: string): void {
        this.isLoadingCar.set(true);

        // Čeka se i razrešena sesija: `currentUser$` prvu vrednost emituje tek kada
        // Firebase potvrdi ko je prijavljen, pa provera vlasništva ne može da omane.
        combineLatest([
            this.carService.getCarById(id).pipe(take(1)),
            this.authService.currentUser$.pipe(take(1))
        ])
            .pipe(take(1))
            .subscribe({
                next: ([car, user]) => {
                    this.isLoadingCar.set(false);

                    if (!car) {
                        this.errorMessage.set('Oglas nije pronađen.');
                        return;
                    }

                    if (car.userId !== user?.uid) {
                        void this.router.navigate(['/ad', id]);
                        return;
                    }

                    this.editingId.set(id);
                    this.car = { ...car };
                },
                error: () => {
                    this.isLoadingCar.set(false);
                    this.errorMessage.set('Greška pri učitavanju oglasa.');
                }
            });
    }

    protected async onSubmit(isFormValid: boolean): Promise<void> {
        if (!isFormValid || this.isSaving()) return;

        const user = this.authService.currentUser();
        if (!user) {
            this.errorMessage.set('Sesija je istekla. Prijavite se ponovo.');
            void this.router.navigate(['/login'], {
                queryParams: { returnUrl: this.router.url }
            });
            return;
        }

        this.isSaving.set(true);
        this.errorMessage.set('');

        try {
            const editingId = this.editingId();

            if (editingId) {
                // `userId` se namerno ne menja - vlasnik oglasa ostaje isti.
                await this.carService.updateCar(editingId, this.car);
                await this.router.navigate(['/ad', editingId]);
            } else {
                const newId = await this.carService.addCar({
                    ...(this.car as Car),
                    userId: user.uid
                });
                await this.router.navigate(['/ad', newId]);
            }
        } catch {
            this.errorMessage.set(
                'Čuvanje nije uspelo. Proverite internet konekciju i pokušajte ponovo.'
            );
        } finally {
            this.isSaving.set(false);
        }
    }

    protected cancel(): void {
        const editingId = this.editingId();
        void this.router.navigate(editingId ? ['/ad', editingId] : ['/']);
    }
}
