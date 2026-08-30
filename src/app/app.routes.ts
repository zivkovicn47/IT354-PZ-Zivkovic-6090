import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

/**
 * Rute aplikacije.
 *
 * Sve komponente se učitavaju lenjo (`loadComponent`) kako početni bundle
 * ne bi sadržao ekrane koje korisnik možda nikada ne otvori.
 */
export const routes: Routes = [
    {
        path: '',
        title: 'PolovniAutomobili - Aktuelna ponuda',
        loadComponent: () => import('./home/home.component').then((m) => m.HomeComponent)
    },
    {
        path: 'login',
        title: 'Prijava',
        loadComponent: () =>
            import('./components/auth/login/login.component').then((m) => m.LoginComponent)
    },
    {
        path: 'add-car',
        title: 'Postavi oglas',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./components/car-form/car-form.component').then((m) => m.CarFormComponent)
    },
    {
        path: 'edit-car/:id',
        title: 'Izmeni oglas',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./components/car-form/car-form.component').then((m) => m.CarFormComponent)
    },
    {
        path: 'my-ads',
        title: 'Moji oglasi',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./components/my-ads/my-ads.component').then((m) => m.MyAdsComponent)
    },
    {
        path: 'ad/:id',
        title: 'Detalji oglasa',
        loadComponent: () =>
            import('./components/car-details/car-details.component').then(
                (m) => m.CarDetailsComponent
            )
    },
    {
        path: '**',
        title: 'Stranica nije pronađena',
        loadComponent: () =>
            import('./components/not-found/not-found.component').then((m) => m.NotFoundComponent)
    }
];
