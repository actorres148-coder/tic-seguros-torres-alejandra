import db from "@/lib/db";
import Link from "next/link";
import { crearPoliza, editarPoliza, darDeBajaPoliza } from "./acciones";

export const dynamic = "force-dynamic";

export default async function Polizas({ searchParams }) {
  const params = await searchParams;
  const buscar = params.buscar || "";
  const idEditar = params.editar;

  // READ → SELECT con JOIN para mostrar el nombre del cliente y de la compañía
  const resultado = await db.execute({
    sql: `SELECT p.*, c.nombre, c.apellido, co.nombre AS compania
          FROM poliza p
          JOIN cliente c ON p.id_cliente = c.id_cliente
          JOIN compania co ON p.id_compania = co.id_compania
          WHERE p.numero_poliza LIKE ? OR c.apellido LIKE ?
          ORDER BY p.numero_poliza`,
    args: [`%${buscar}%`, `%${buscar}%`],
  });
  const polizas = resultado.rows;

  // Listas para elegir cliente y compañía (se eligen de la base, no se escriben)
  const clientes = (await db.execute("SELECT id_cliente, nombre, apellido FROM cliente ORDER BY apellido")).rows;
  const companias = (await db.execute("SELECT id_compania, nombre FROM compania ORDER BY nombre")).rows;

  let editando = null;
  if (idEditar) {
    const r = await db.execute({ sql: "SELECT * FROM poliza WHERE id_poliza = ?", args: [idEditar] });
    editando = r.rows[0];
  }

  return (
    <div>
      {/* FORMULARIO */}
      <div className="caja">
        <h2>{editando ? "Editar póliza" : "Nueva póliza"}</h2>
        <form key={editando ? editando.id_poliza : "nueva"} action={editando ? editarPoliza : crearPoliza} className="formulario">
          {editando && <input type="hidden" name="id_poliza" value={editando.id_poliza} />}
          <label>Número de póliza<input name="numero_poliza" required defaultValue={editando?.numero_poliza} placeholder="AP-2026-0011" /></label>
          <label>Cliente
            <select name="id_cliente" required defaultValue={editando?.id_cliente ?? ""}>
              <option value="" disabled>Elegir cliente...</option>
              {clientes.map((c) => (
                <option key={c.id_cliente} value={c.id_cliente}>{c.apellido}, {c.nombre}</option>
              ))}
            </select>
          </label>
          <label>Compañía
            <select name="id_compania" required defaultValue={editando?.id_compania ?? ""}>
              <option value="" disabled>Elegir compañía...</option>
              {companias.map((co) => (
                <option key={co.id_compania} value={co.id_compania}>{co.nombre}</option>
              ))}
            </select>
          </label>
          <label>Fecha de inicio<input name="fecha_inicio" type="date" required defaultValue={editando?.fecha_inicio} /></label>
          <label>Fecha de vencimiento<input name="fecha_fin" type="date" required defaultValue={editando?.fecha_fin} /></label>
          <label>Estado
            <select name="estado" defaultValue={editando?.estado ?? "ACTIVA"}>
              <option>ACTIVA</option>
              <option>VENCIDA</option>
              <option>CANCELADA</option>
            </select>
          </label>
          <div className="botones">
            <button type="submit">GUARDAR</button>
            {editando && <Link href="/polizas" className="boton boton-gris">Cancelar</Link>}
          </div>
        </form>
      </div>

      {/* LISTADO */}
      <div className="caja">
        <h2>Pólizas ({polizas.length})</h2>
        <form className="buscador">
          <input name="buscar" placeholder="Buscar por número de póliza o apellido..." defaultValue={buscar} />
          <button type="submit">Buscar</button>
          {buscar && <Link href="/polizas" className="boton boton-gris">Ver todas</Link>}
        </form>

        <div className="tabla-scroll">
          <table>
            <thead>
              <tr><th>N° Póliza</th><th>Cliente</th><th>Compañía</th><th>Inicio</th><th>Vencimiento</th><th>Estado</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {polizas.map((p) => (
                <tr key={p.id_poliza}>
                  <td>{p.numero_poliza}</td>
                  <td>{p.apellido}, {p.nombre}</td>
                  <td>{p.compania}</td>
                  <td>{p.fecha_inicio}</td>
                  <td>{p.fecha_fin}</td>
                  <td>{p.estado}</td>
                  <td className="acciones">
                    <Link href={`/polizas?editar=${p.id_poliza}`} className="boton boton-chico">Editar</Link>
                    {p.estado !== "CANCELADA" && (
                      <form action={darDeBajaPoliza}>
                        <input type="hidden" name="id_poliza" value={p.id_poliza} />
                        <button className="boton-rojo boton-chico">Dar de baja</button>
                      </form>
                    )}
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
