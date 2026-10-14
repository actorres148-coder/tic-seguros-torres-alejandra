import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Seguros Juan Pérez",
  description: "Sistema de Seguros de Accidentes Personales",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <header className="encabezado">
          <h1>Seguros Juan Pérez</h1>
          <p>Productor de Seguros · Accidentes Personales</p>
        </header>

        {/* MENÚ */}
        <nav className="menu">
          <Link href="/">INICIO / DASHBOARD</Link>
          <Link href="/clientes">CLIENTES</Link>
          <Link href="/polizas">PÓLIZAS</Link>
          <Link href="/siniestros">SINIESTROS</Link>
        </nav>

        <main className="contenido">{children}</main>
      </body>
    </html>
  );
}
