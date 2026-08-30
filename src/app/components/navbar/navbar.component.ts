import { Component, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

/** Zaglavlje aplikacije - logo, akcije prijavljenog korisnika i odjava. */
@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './navbar.component.html'
})
export class NavbarComponent {
    /** Kada je `true`, umesto logotipa se prikazuje dugme za povratak. */
    readonly showBack = input(false);

    private router = inject(Router);
    protected authService = inject(AuthService);

    protected async logout(): Promise<void> {
        await this.authService.logout();
        await this.router.navigate(['/']);
    }
}
