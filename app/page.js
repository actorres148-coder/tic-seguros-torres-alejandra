import db from "@/lib/db";

export const dynamic = "force-dynamic";

// Ejecuta una consulta que devuelve un solo número
async function contar(sql) {
  const r = await db.execute(sql);
  return Number(r.rows[0].cantidad);
}

// Gráfico de barras simple
function Grafico({ titulo, datos }) {
  const maximo = Math.max(...datos.map((d) => Number(d.cantidad)), 1);
  return (
    <div className="caja">
      <h2>{titulo}</h2>
      {datos.map((d) => (
        <div className="barra-fila" key={d.etiqueta}>
          <span className="barra-nombre">{d.etiqueta}</span>
          <div className="barra-fondo">
            <div className="barra" style={{ width: `${(Number(d.cantidad) / maximo) * 100}%` }} />
          </div>
          <span className="barra-valor">{d.cantidad}</span>
        </div>
      ))}
    </div>
  );
}

export default async function Dashboard() {
  // INDICADORES: los valores salen de la base, no están escritos en el código
  const clientes = await contar("SELECT COUNT(*) AS cantidad FROM cliente");
  const polizasActivas = await contar("SELECT COUNT(*) AS cantidad FROM poliza WHERE estado = 'ACTIVA'");
  const abiertos = await contar("SELECT COUNT(*) AS cantidad FROM siniestro WHERE estado = 'ABIERTO'");
  const cerrados = await contar("SELECT COUNT(*) AS cantidad FROM siniestro WHERE estado = 'CERRADO'");

  // GRÁFICOS
  const porEstado = (await db.execute(
    "SELECT estado AS etiqueta, COUNT(*) AS cantidad FROM poliza GROUP BY estado ORDER BY cantidad DESC"
  )).rows;
  const porTipo = (await db.execute(
    "SELECT tipo AS etiqueta, COUNT(*) AS cantidad FROM siniestro GROUP BY tipo ORDER BY cantidad DESC"
  )).rows;
  const porMes = (await db.execute(
    "SELECT strftime('%Y-%m', fecha) AS etiqueta, COUNT(*) AS cantidad FROM siniestro GROUP BY etiqueta ORDER BY etiqueta"
  )).rows;

  return (
    <div>
      <div className="indicadores">
        <div className="indicador"><div className="numero">{clientes}</div><div className="titulo">Clientes</div></div>
        <div className="indicador"><div className="numero">{polizasActivas}</div><div className="titulo">Pólizas activas</div></div>
        <div className="indicador"><div className="numero">{abiertos}</div><div className="titulo">Siniestros abiertos</div></div>
        <div className="indicador"><div className="numero">{cerrados}</div><div className="titulo">Siniestros cerrados</div></div>
      </div>

      <div className="graficos">
        <Grafico titulo="Pólizas por estado" datos={porEstado} />
        <Grafico titulo="Siniestros por tipo" datos={porTipo} />
        <Grafico titulo="Siniestros por mes" datos={porMes} />
      </div>
    </div>
  );
}
