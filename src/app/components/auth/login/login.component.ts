import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

/**
 * Prijava i registracija korisnika.
 *
 * Isti nalog važi i u Android aplikaciji - obe koriste isti Firebase
 * Authentication projekat, pa korisnik svoje oglase vidi na oba uređaja.
 */
@Component({
    selector: 'app-login',
    standalone: true,
    imports: [FormsModule, RouterLink],
    templateUrl: './login.component.html'
})
export class LoginComponent {
    private authService = inject(AuthService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    protected readonly isRegisterMode = signal(false);
    protected readonly isLoading = signal(false);
    protected readonly errorMessage = signal('');

    protected email = '';
    protected password = '';

    protected toggleMode(): void {
        this.isRegisterMode.update((value) => !value);
        this.errorMessage.set('');
    }

    protected async onSubmit(isFormValid: boolean): Promise<void> {
        if (!isFormValid || this.isLoading()) return;

        this.isLoading.set(true);
        this.errorMessage.set('');

        try {
            if (this.isRegisterMode()) {
                await this.authService.register(this.email, this.password);
            } else {
                await this.authService.login(this.email, this.password);
            }

            // Povratak na stranicu sa koje je korisnik poslat na prijavu.
            const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/';
            await this.router.navigateByUrl(returnUrl);
        } catch (error: unknown) {
            const code = (error as { code?: string })?.code;
            this.errorMessage.set(this.authService.getReadableError(code));
        } finally {
            this.isLoading.set(false);
        }
    }
}
