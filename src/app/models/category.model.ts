/**
 * Model kategorije (marke vozila) iz `Category` čvora.
 *
 * U bazi su zapisi pod ključevima `cat00`..`cat19`, a svaki sadrži numerički `id`
 * koji se koristi kao `Car.categoryId`. Servis normalizuje oba podatka
 * kako bi `id` uvek bio broj (isto kao u Android aplikaciji).
 */
export interface Category {
    /** Firebase ključ zapisa, npr. "cat05". */
    key: string;
    /** Numerički identifikator koji odgovara `Car.categoryId`. */
    id: number;
    title: string;
    picUrl: string;
}
