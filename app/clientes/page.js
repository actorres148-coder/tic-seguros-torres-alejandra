import db from "@/lib/db";
import Link from "next/link";
import { crearCliente, editarCliente, eliminarCliente } from "./acciones";

export const dynamic = "force-dynamic";

export default async function Clientes({ searchParams }) {
  const params = await searchParams;
  const buscar = params.buscar || "";
  const idEditar = params.editar;

  // READ → SELECT (con búsqueda por nombre, apellido o DNI)
  const resultado = await db.execute({
    sql: `SELECT * FROM cliente
          WHERE nombre LIKE ? OR apellido LIKE ? OR dni LIKE ?
          ORDER BY apellido`,
    args: [`%${buscar}%`, `%${buscar}%`, `%${buscar}%`],
  });
  const clientes = resultado.rows;

  // Si se está editando, buscamos los datos de ese cliente
  let editando = null;
  if (idEditar) {
    const r = await db.execute({ sql: "SELECT * FROM cliente WHERE id_cliente = ?", args: [idEditar] });
    editando = r.rows[0];
  }

  return (
    <div>
      {/* FORMULARIO */}
      <div className="caja">
        <h2>{editando ? "Editar cliente" : "Nuevo cliente"}</h2>
        <form action={editando ? editarCliente : crearCliente} className="formulario">
          {editando && <input type="hidden" name="id_cliente" value={editando.id_cliente} />}
          <label>Nombre<input name="nombre" required defaultValue={editando?.nombre} /></label>
          <label>Apellido<input name="apellido" required defaultValue={editando?.apellido} /></label>
          <label>DNI<input name="dni" required defaultValue={editando?.dni} /></label>
          <label>Email<input name="email" type="email" defaultValue={editando?.email} /></label>
          <label>Teléfono<input name="telefono" defaultValue={editando?.telefono} /></label>
          <div className="botones">
            <button type="submit">GUARDAR</button>
            {editando && <Link href="/clientes" className="boton boton-gris">Cancelar</Link>}
          </div>
        </form>
      </div>

      {/* LISTADO */}
      <div className="caja">
        <h2>Clientes ({clientes.length})</h2>

        {params.error === "tiene_polizas" && (
          <p className="mensaje">No se puede eliminar el cliente porque tiene pólizas registradas.</p>
        )}

        <form className="buscador">
          <input name="buscar" placeholder="Buscar por nombre, apellido o DNI..." defaultValue={buscar} />
          <button type="submit">Buscar</button>
          {buscar && <Link href="/clientes" className="boton boton-gris">Ver todos</Link>}
        </form>

        <div className="tabla-scroll">
          <table>
            <thead>
              <tr><th>Apellido</th><th>Nombre</th><th>DNI</th><th>Email</th><th>Teléfono</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr key={c.id_cliente}>
                  <td>{c.apellido}</td>
                  <td>{c.nombre}</td>
                  <td>{c.dni}</td>
                  <td>{c.email}</td>
                  <td>{c.telefono}</td>
                  <td className="acciones">
                    <Link href={`/clientes?editar=${c.id_cliente}`} className="boton boton-chico">Editar</Link>
                    <form action={eliminarCliente}>
                      <input type="hidden" name="id_cliente" value={c.id_cliente} />
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