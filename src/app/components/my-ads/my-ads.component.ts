import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';

import { CarService } from '../../services/car.service';
import { AuthService } from '../../services/auth.service';
import { Car } from '../../models/car.model';
import { NavbarComponent } from '../navbar/navbar.component';

/**
 * Pregled i upravljanje sopstvenim oglasima.
 *
 * Web pandan "Manage Cars" ekranu iz Android aplikacije - iste operacije
 * nad istim podacima, pa se oglas može postaviti na telefonu, a obrisati ovde.
 */
@Component({
    selector: 'app-my-ads',
    standalone: true,
    imports: [DecimalPipe, RouterLink, NavbarComponent],
    templateUrl: './my-ads.component.html'
})
export class MyAdsComponent {
    private carService = inject(CarService);
    private authService = inject(AuthService);

    protected readonly loadError = signal(false);
    protected readonly pendingDelete = signal<Car | null>(null);
    protected readonly isDeleting = signal(false);
    protected readonly actionError = signal('');

    private readonly allCars = toSignal(
        this.carService.getCars().pipe(
            catchError(() => {
                this.loadError.set(true);
                return of([] as Car[]);
            })
        ),
        { initialValue: undefined }
    );

    protected readonly isLoading = computed(() => this.allCars() === undefined && !this.loadError());

    protected readonly myCars = computed(() => {
        const uid = this.authService.currentUser()?.uid;
        if (!uid) return [];
        return (this.allCars() ?? []).filter((car) => car.userId === uid);
    });

    protected readonly totalValue = computed(() =>
        this.myCars().reduce((sum, car) => sum + (Number(car.price) || 0), 0)
    );

    protected async confirmDelete(): Promise<void> {
        const car = this.pendingDelete();
        if (!car?.id) return;

        this.isDeleting.set(true);
        this.actionError.set('');

        try {
            await this.carService.deleteCar(car.id);
            this.pendingDelete.set(null);
        } catch {
            this.actionError.set('Brisanje nije uspelo. Pokušajte ponovo.');
        } finally {
            this.isDeleting.set(false);
        }
    }
}
