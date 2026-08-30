import { Injectable, inject } from '@angular/core';
import { Database, ref, listVal, objectVal, push, update, remove } from '@angular/fire/database';
import { Observable, map } from 'rxjs';
import { Car } from '../models/car.model';
import { Category } from '../models/category.model';
import { normalizeCategoryId } from '../utils/car-filters';
import { toDatabasePayload } from '../utils/car-serialization';

/**
 * Pristup `Cars` i `Category` čvorovima u Firebase Realtime Database-u.
 *
 * Sve metode za čitanje vraćaju "žive" Observable-e: kada Android aplikacija
 * izmeni podatak, promena stiže i u web aplikaciju bez osvežavanja stranice.
 */
@Injectable({ providedIn: 'root' })
export class CarService {
    private database = inject(Database);

    private carsRef() {
        return ref(this.database, 'Cars');
    }

    private carRef(id: string) {
        return ref(this.database, `Cars/${id}`);
    }

    /** Svi oglasi, sa Firebase ključem upisanim u polje `id`. */
    getCars(): Observable<Car[]> {
        return listVal<Car>(this.carsRef(), { keyField: 'id' }).pipe(map((cars) => cars ?? []));
    }

    /** Jedan oglas. Vraća `null` ako zapis ne postoji. */
    getCarById(id: string): Observable<Car | null> {
        return objectVal<Car>(this.carRef(id)).pipe(
            map((car) => (car ? { ...car, id } : null))
        );
    }

    /** Oglasi koje je postavio zadati korisnik. */
    getCarsByUser(userId: string): Observable<Car[]> {
        return this.getCars().pipe(map((cars) => cars.filter((car) => car.userId === userId)));
    }

    /**
     * Kategorije (marke), sortirane po `id`.
     *
     * `id` se normalizuje u broj jer `Car.categoryId` u bazi jeste broj -
     * bez toga bi filtriranje i Android aplikacija dobili nekompatibilne vrednosti.
     */
    getCategories(): Observable<Category[]> {
        return listVal<Record<string, unknown>>(ref(this.database, 'Category'), {
            keyField: 'key'
        }).pipe(
            map((rows) =>
                (rows ?? [])
                    .map((row) => ({
                        key: String(row['key'] ?? ''),
                        id: normalizeCategoryId(row['id']) ?? normalizeCategoryId(row['key']) ?? 0,
                        title: String(row['title'] ?? ''),
                        picUrl: String(row['picUrl'] ?? '')
                    }))
                    .sort((a, b) => a.id - b.id)
            )
        );
    }

    /** Kreira novi oglas i vraća generisani Firebase ključ. */
    async addCar(car: Car): Promise<string> {
        const reference = await push(this.carsRef(), toDatabasePayload(car));
        return reference.key!;
    }

    /**
     * Ažurira postojeći oglas.
     *
     * Namerno se koristi `update` umesto `set`: tako se čuvaju polja koja
     * eventualno upiše Android aplikacija, a koja web model još ne poznaje.
     */
    updateCar(id: string, car: Partial<Car>): Promise<void> {
        return update(this.carRef(id), toDatabasePayload(car));
    }

    deleteCar(id: string): Promise<void> {
        return remove(this.carRef(id));
    }
}
