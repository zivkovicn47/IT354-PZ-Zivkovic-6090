import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { map, take } from 'rxjs/operators';

/**
 * Dozvoljava pristup samo prijavljenim korisnicima.
 *
 * Neprijavljeni se preusmeravaju na `/login`, uz pamćenje odredišta
 * (`returnUrl`) kako bi posle prijave nastavili tamo gde su krenuli.
 *
 * Koristi se `authState`, koji prvu vrednost emituje tek kada Firebase
 * razreši postojeću sesiju - time se izbegava lažno preusmeravanje
 * prijavljenog korisnika pri osvežavanju stranice.
 */
export const authGuard: CanActivateFn = (_route, state) => {
    const auth = inject(Auth);
    const router = inject(Router);

    return authState(auth).pipe(
        take(1),
        map((user) =>
            user
                ? true
                : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } })
        )
    );
};
