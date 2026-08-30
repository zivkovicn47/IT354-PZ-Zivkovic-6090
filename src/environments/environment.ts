/**
 * Razvojna konfiguracija.
 *
 * Firebase web API ključ nije tajna - pristup podacima se kontroliše
 * sigurnosnim pravilima baze (`database.rules.json`), a ne skrivanjem ključa.
 */
export const environment = {
    production: false,
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
