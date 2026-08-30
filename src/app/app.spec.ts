import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [App],
            providers: [provideRouter([])]
        }).compileComponents();
    });

    it('kreira korenu komponentu', () => {
        const fixture = TestBed.createComponent(App);
        expect(fixture.componentInstance).toBeTruthy();
    });

    it('prikazuje router-outlet u koji se učitavaju rute', async () => {
        const fixture = TestBed.createComponent(App);
        await fixture.whenStable();

        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.querySelector('router-outlet')).not.toBeNull();
    });
});
