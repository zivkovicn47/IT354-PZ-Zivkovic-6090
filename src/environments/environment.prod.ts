/**
 * Produkciona konfiguracija.
 *
 * Zamenjuje `environment.ts` pri `ng build` (vidi `fileReplacements` u angular.json).
 * Firebase projekat je isti kao u razvoju i isti kao u Android aplikaciji -
 * to je i uslov da se podaci između web-a i telefona sinhronizuju.
 */
export const environment = {
    production: true,
    firebaseConfig: {
        apiKey: 'AIzaSyDjZUUYQcA1E3jRaj4RCmVWWMoARPuNwv0',
        authDomain: 'project250-65f0d.firebaseapp.com',
        databaseURL: 'https://project250-65f0d-default-rtdb.europe-west1.firebasedatabase.app',
        projectId: 'project250-65f0d',
        storageBucket: 'project250-65f0d.firebasestorage.app',
        messagingSenderId: '447875857718',
        appId: '1:447875857718:web:832158f301624b62f90797'
    }
};
