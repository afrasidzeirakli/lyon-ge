/**
 * ბაზის პროვაიდერზე დამოკიდებული განსხვავებები.
 * SQLite (ლოკალური/VPS) და PostgreSQL (Vercel + Neon) ერთი კოდიდან მუშაობს.
 */
export const isPostgres = /^postgres(ql)?:\/\//i.test(process.env.DATABASE_URL ?? "");

/**
 * ტექსტის ძებნა რეგისტრის გაუთვალისწინებლად.
 * PostgreSQL-ს სჭირდება `mode: "insensitive"`; SQLite-ს ეს პარამეტრი არ აქვს
 * (და LIKE ისედაც არ არჩევს დიდ-პატარა ლათინურ ასოებს).
 */
export function contains(value: string): { contains: string; mode?: "insensitive" } {
  return isPostgres ? { contains: value, mode: "insensitive" } : { contains: value };
}
