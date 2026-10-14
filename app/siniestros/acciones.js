"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function crearSiniestro(formData) {
  await db.execute({
    sql: "INSERT INTO siniestro (id_poliza, fecha, tipo, descripcion, estado) VALUES (?, ?, ?, ?, ?)",
    args: [formData.get("id_poliza"), formData.get("fecha"), formData.get("tipo"), formData.get("descripcion"), formData.get("estado")],
  });
  revalidatePath("/siniestros");
  redirect("/siniestros");
}

export async function editarSiniestro(formData) {
  await db.execute({
    sql: "UPDATE siniestro SET id_poliza = ?, fecha = ?, tipo = ?, descripcion = ?, estado = ? WHERE id_siniestro = ?",
    args: [formData.get("id_poliza"), formData.get("fecha"), formData.get("tipo"), formData.get("descripcion"), formData.get("estado"), formData.get("id_siniestro")],
  });
  revalidatePath("/siniestros");
  redirect("/siniestros");
}

export async function cerrarSiniestro(formData) {
  await db.execute({
    sql: "UPDATE siniestro SET estado = 'CERRADO' WHERE id_siniestro = ?",
    args: [formData.get("id_siniestro")],
  });
  revalidatePath("/siniestros");
  redirect("/siniestros");
}

export async function eliminarSiniestro(formData) {
  await db.execute({
    sql: "DELETE FROM siniestro WHERE id_siniestro = ?",
    args: [formData.get("id_siniestro")],
  });
  revalidatePath("/siniestros");
  redirect("/siniestros");
}
