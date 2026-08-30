import { toDatabasePayload } from './car-serialization';

describe('toDatabasePayload', () => {
    it('izbacuje id iz tela zapisa (ključ se ne duplira)', () => {
        const payload = toDatabasePayload({ id: 'car01', title: 'BMW 320i' });
        expect(payload['id']).toBeUndefined();
        expect(payload['title']).toBe('BMW 320i');
    });

    it('uklanja undefined i null vrednosti koje Firebase odbija', () => {
        const payload = toDatabasePayload({ title: 'Audi A4', price: undefined, phone: undefined });
        expect('price' in payload).toBe(false);
        expect('phone' in payload).toBe(false);
    });

    it('numerička polja upisuje kao brojeve, ne kao stringove', () => {
        // Ključno za sinhronizaciju: Android `data class Car` očekuje Int vrednosti.
        const payload = toDatabasePayload({
            categoryId: '5' as unknown as number,
            price: '22000' as unknown as number,
            productionYear: '2019' as unknown as number
        });

        expect(payload['categoryId']).toBe(5);
        expect(payload['price']).toBe(22000);
        expect(payload['productionYear']).toBe(2019);
    });

    it('nevalidnu numeričku vrednost svodi na nulu umesto na NaN', () => {
        const payload = toDatabasePayload({ mileage: 'abc' as unknown as number });
        expect(payload['mileage']).toBe(0);
    });

    it('skraćuje tekst i izostavlja prazne stringove', () => {
        const payload = toDatabasePayload({ title: '  BMW 320i  ', description: '   ' });
        expect(payload['title']).toBe('BMW 320i');
        expect('description' in payload).toBe(false);
    });
});
