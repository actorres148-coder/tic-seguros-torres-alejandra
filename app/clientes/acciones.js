"use server";
// Funciones que reciben los datos del formulario y ejecutan el SQL.
import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// CREATE → INSERT
export async function crearCliente(formData) {
  await db.execute({
    sql: "INSERT INTO cliente (nombre, apellido, dni, email, telefono) VALUES (?, ?, ?, ?, ?)",
    args: [
      formData.get("nombre"),
      formData.get("apellido"),
      formData.get("dni"),
      formData.get("email"),
      formData.get("telefono"),
    ],
  });
  revalidatePath("/clientes");
  redirect("/clientes");
}

// UPDATE
export async function editarCliente(formData) {
  await db.execute({
    sql: "UPDATE cliente SET nombre = ?, apellido = ?, dni = ?, email = ?, telefono = ? WHERE id_cliente = ?",
    args: [
      formData.get("nombre"),
      formData.get("apellido"),
      formData.get("dni"),
      formData.get("email"),
      formData.get("telefono"),
      formData.get("id_cliente"),
    ],
  });
  revalidatePath("/clientes");
  redirect("/clientes");
}

// DELETE (solo si el cliente no tiene pólizas)
export async function eliminarCliente(formData) {
  const id = formData.get("id_cliente");
  const r = await db.execute({
    sql: "SELECT COUNT(*) AS cantidad FROM poliza WHERE id_cliente = ?",
    args: [id],
  });
  if (r.rows[0].cantidad > 0) {
    redirect("/clientes?error=tiene_polizas");
  }
  await db.execute({ sql: "DELETE FROM cliente WHERE id_cliente = ?", args: [id] });
  revalidatePath("/clientes");
  redirect("/clientes");
}