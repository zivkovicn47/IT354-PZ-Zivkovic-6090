import { Injectable, inject } from '@angular/core';
import {
    Auth,
    User,
    user,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut
} from '@angular/fire/auth';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';

/** Autentikacija korisnika preko Firebase Authentication (email + lozinka). */
@Injectable({ providedIn: 'root' })
export class AuthService {
    private auth = inject(Auth);

    /** Trenutni korisnik kao Observable (`null` kada niko nije prijavljen). */
    readonly currentUser$: Observable<User | null> = user(this.auth);

    /** Isti podatak kao signal - pogodnije za `computed()` i nove templejte. */
    readonly currentUser = toSignal(this.currentUser$, { initialValue: null });

    login(email: string, password: string) {
        return signInWithEmailAndPassword(this.auth, email, password);
    }

    register(email: string, password: string) {
        return createUserWithEmailAndPassword(this.auth, email, password);
    }

    logout() {
        return signOut(this.auth);
    }

    /** Prevodi Firebase kod greške u poruku razumljivu korisniku. */
    getReadableError(code: string | undefined): string {
        switch (code) {
            case 'auth/invalid-email':
                return 'Neispravna email adresa.';
            case 'auth/user-disabled':
                return 'Nalog je blokiran.';
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                return 'Pogrešan email ili lozinka.';
            case 'auth/email-already-in-use':
                return 'Nalog sa ovom email adresom već postoji.';
            case 'auth/weak-password':
                return 'Lozinka mora imati najmanje 6 karaktera.';
            case 'auth/too-many-requests':
                return 'Previše pokušaja. Pokušajte ponovo za koji minut.';
            case 'auth/network-request-failed':
                return 'Nema veze sa internetom.';
            default:
                return 'Došlo je do greške. Pokušajte ponovo.';
        }
    }
}
