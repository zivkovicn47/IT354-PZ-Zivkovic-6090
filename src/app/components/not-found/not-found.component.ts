import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Prikazuje se za sve rute koje ne postoje (wildcard `**`). */
@Component({
    selector: 'app-not-found',
    standalone: true,
    imports: [RouterLink],
    template: `
        <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
            <div class="text-center bg-white rounded-2xl shadow-lg border border-gray-200 px-8 py-16 max-w-lg">
                <p class="text-7xl font-extrabold text-blue-700 mb-2">404</p>
                <h1 class="text-2xl font-bold text-gray-900 mb-2">Stranica nije pronađena</h1>
                <p class="text-gray-500 mb-8">Adresa koju ste otvorili ne postoji ili je promenjena.</p>
                <a
                    routerLink="/"
                    class="inline-block px-6 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                    Nazad na početnu
                </a>
            </div>
        </div>
    `
})
export class NotFoundComponent {}
