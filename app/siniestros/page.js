import db from "@/lib/db";
import Link from "next/link";
import { crearSiniestro, editarSiniestro, cerrarSiniestro, eliminarSiniestro } from "./acciones";

export const dynamic = "force-dynamic";

const TIPOS = ["Caída", "Accidente de tránsito", "Accidente deportivo", "Accidente laboral", "Otro"];

export default async function Siniestros({ searchParams }) {
  const params = await searchParams;
  const buscar = params.buscar || "";
  const idEditar = params.editar;

  const resultado = await db.execute({
    sql: `SELECT s.*, p.numero_poliza, c.nombre, c.apellido
          FROM siniestro s
          JOIN poliza p ON s.id_poliza = p.id_poliza
          JOIN cliente c ON p.id_cliente = c.id_cliente
          WHERE p.numero_poliza LIKE ? OR c.apellido LIKE ? OR s.tipo LIKE ?
          ORDER BY s.fecha DESC`,
    args: [`%${buscar}%`, `%${buscar}%`, `%${buscar}%`],
  });
  const siniestros = resultado.rows;

  const polizas = (await db.execute(`
    SELECT p.id_poliza, p.numero_poliza, c.apellido, c.nombre
    FROM poliza p JOIN cliente c ON p.id_cliente = c.id_cliente
    ORDER BY p.numero_poliza`)).rows;

  let editando = null;
  if (idEditar) {
    const r = await db.execute({ sql: "SELECT * FROM siniestro WHERE id_siniestro = ?", args: [idEditar] });
    editando = r.rows[0];
  }
    return (
    <div>
      <div className="caja">
        <h2>{editando ? "Editar siniestro" : "Registrar siniestro"}</h2>
        <form key={editando ? editando.id_siniestro : "nuevo"} action={editando ? editarSiniestro : crearSiniestro} className="formulario">
          {editando && <input type="hidden" name="id_siniestro" value={editando.id_siniestro} />}
          <label>Póliza
            <select name="id_poliza" required defaultValue={editando ? editando.id_poliza : ""}>
              <option value="" disabled>Elegir póliza...</option>
              {polizas.map((p) => (
                <option key={p.id_poliza} value={p.id_poliza}>{p.numero_poliza} - {p.apellido}, {p.nombre}</option>
              ))}
            </select>
          </label>
          <label>Fecha<input name="fecha" type="date" required defaultValue={editando ? editando.fecha : ""} /></label>
          <label>Tipo
            <select name="tipo" required defaultValue={editando ? editando.tipo : ""}>
              <option value="" disabled>Elegir tipo...</option>
              {TIPOS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
          <label>Estado
            <select name="estado" defaultValue={editando ? editando.estado : "ABIERTO"}>
              <option>ABIERTO</option>
              <option>CERRADO</option>
            </select>
          </label>
          <label style={{ gridColumn: "1 / -1" }}>Descripción
            <textarea name="descripcion" rows={2} defaultValue={editando ? editando.descripcion : ""} />
          </label>
          <div className="botones">
            <button type="submit">GUARDAR</button>
            {editando && <Link href="/siniestros" className="boton boton-gris">Cancelar</Link>}
          </div>
        </form>
      </div>
            <div className="caja">
        <h2>Siniestros ({siniestros.length})</h2>
        <form className="buscador">
          <input name="buscar" placeholder="Buscar por póliza, apellido o tipo..." defaultValue={buscar} />
          <button type="submit">Buscar</button>
          {buscar && <Link href="/siniestros" className="boton boton-gris">Ver todos</Link>}
        </form>

        <div className="tabla-scroll">
          <table>
            <thead>
              <tr><th>Fecha</th><th>Póliza</th><th>Cliente</th><th>Tipo</th><th>Descripción</th><th>Estado</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {siniestros.map((s) => (
                <tr key={s.id_siniestro}>
                  <td>{s.fecha}</td>
                  <td>{s.numero_poliza}</td>
                  <td>{s.apellido}, {s.nombre}</td>
                  <td>{s.tipo}</td>
                  <td>{s.descripcion}</td>
                  <td>{s.estado}</td>
                  <td className="acciones">
                    <Link href={`/siniestros?editar=${s.id_siniestro}`} className="boton boton-chico">Editar</Link>
                    {s.estado === "ABIERTO" && (
                      <form action={cerrarSiniestro}>
                        <input type="hidden" name="id_siniestro" value={s.id_siniestro} />
                        <button className="boton-chico">Cerrar</button>
                      </form>
                    )}
                    <form action={eliminarSiniestro}>
                      <input type="hidden" name="id_siniestro" value={s.id_siniestro} />
                      <button className="boton-rojo boton-chico">Eliminar</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
