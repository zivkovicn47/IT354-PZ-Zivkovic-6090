import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/** Korena komponenta - sadrži samo izlaz rutera, ekrane popunjavaju rute. */
@Component({
    selector: 'app-root',
    imports: [RouterOutlet],
    templateUrl: './app.html',
    styleUrl: './app.css'
})
export class App {}
