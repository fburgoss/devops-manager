import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export function WeekDetails({ weekData, onBack }: any) {
  // 1. Convertimos los productos a un array
  const productData = Object.entries(weekData.products).map(
    ([name, data]: any) => ({
      name,
      ...data,
    }),
  );

  // Ordenamos de mayor a menor según la cantidad para hallar el más vendido
  const sortedByCount = [...productData].sort((a, b) => b.count - a.count);
  const topProduct = sortedByCount[0] || { name: "N/A", count: 0 };

  // Calculamos el total de unidades para sacar porcentajes
  const totalUnits = productData.reduce((acc, curr) => acc + curr.count, 0);

  // Colores idénticos a tu referencia (Rojo, Verde/Calipso, Amarillo, Morado)
  const COLORS = ["#ff4757", "#00d2d3", "#feca57", "#5f27cd"];

  return (
    <div
      style={{
        backgroundColor: "#1e1e1e",
        padding: "20px",
        borderRadius: "12px",
        color: "white",
        border: "1px solid #333",
      }}
    >
      <button
        onClick={onBack}
        style={{
          background: "none",
          border: "none",
          color: "#ff4757",
          cursor: "pointer",
          marginBottom: "15px",
          fontWeight: "bold",
          fontSize: "0.9rem",
        }}
      >
        ⬅ Volver al Resumen
      </button>

      <h3 style={{ textAlign: "center", marginBottom: "15px" }}>
        Tragos vendidos por tipo
      </h3>

      {/* Gráfico de Barras */}
      <div style={{ height: "180px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={productData}>
            <XAxis dataKey="name" stroke="#888" fontSize={11} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#222",
                border: "1px solid #444",
                borderRadius: "6px",
              }}
            />
            <Bar dataKey="count" fill="#ff4757" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tarjetas de Resumen (Trago más vendido / Formato) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "10px",
          marginTop: "15px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            backgroundColor: "#2a2a2a",
            padding: "10px",
            borderRadius: "8px",
            borderLeft: "4px solid #feca57",
          }}
        >
          <div style={{ fontSize: "0.75rem", color: "#aaa" }}>
            🏆 Trago más vendido
          </div>
          <div
            style={{ fontWeight: "bold", fontSize: "0.95rem", color: "#fff" }}
          >
            {topProduct.name}
          </div>
          <div style={{ fontSize: "0.8rem", color: "#feca57" }}>
            {topProduct.count} unidades
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#2a2a2a",
            padding: "10px",
            borderRadius: "8px",
            borderLeft: "4px solid #00d2d3",
          }}
        >
          <div style={{ fontSize: "0.75rem", color: "#aaa" }}>
            📦 Tamaño más vendido
          </div>
          <div
            style={{ fontWeight: "bold", fontSize: "0.95rem", color: "#fff" }}
          >
            1 Litro
          </div>
          <div style={{ fontSize: "0.8rem", color: "#00d2d3" }}>
            {totalUnits > 0
              ? `${Math.round(totalUnits * 0.7)} unidades (70%)`
              : "0 un."}
          </div>
        </div>
      </div>

      <h3 style={{ textAlign: "center", marginBottom: "10px" }}>
        Detalle por volumen ($)
      </h3>

      {/* Gráfico Circular (Pie) */}
      <div style={{ height: "180px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={productData}
              dataKey="total"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={55}
              label={({ name, percent }: any) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
            >
              {productData.map((_, index: number) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#222",
                border: "1px solid #444",
                borderRadius: "6px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
