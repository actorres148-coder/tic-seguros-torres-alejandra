// Conexión a la base de datos.
// En la compu usa el archivo seguros.db.
// Publicado en Vercel usa Turso (se configura más adelante).
import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:seguros.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export default db;

