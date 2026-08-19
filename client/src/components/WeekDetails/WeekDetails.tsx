import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export function WeekDetails({ weekData, onBack }: any) {
  // 1. Convertimos los productos a un array para el gráfico de barras
  const productData = Object.entries(weekData.products || {}).map(
    ([name, data]: any) => ({
      name,
      ...data,
    }),
  );

  // Ordenamos de mayor a menor para hallar el trago más vendido
  const sortedByCount = [...productData].sort((a, b) => b.count - a.count);
  const topProduct = sortedByCount[0] || { name: "N/A", count: 0 };

  // Datos simulados/calculados para los tamaños (1 Litro y Medio Litro como en tu diseño)
  const totalUnits = weekData.weekCount || 0;
  const sizeData = [
    {
      name: "1 Litro",
      value: Math.round(totalUnits * 0.7) || 0,
      color: "#00d2d3",
    },
    {
      name: "Medio Litro",
      value: Math.round(totalUnits * 0.3) || 0,
      color: "#10ac84",
    },
  ];

  // Colores para las barras de tragos (Rojo, Calipso, Amarillo, Morado)
  const BAR_COLORS = ["#ff4757", "#00d2d3", "#feca57", "#5f27cd"];

  return (
    <div
      style={{
        backgroundColor: "#161616",
        padding: "16px",
        borderRadius: "12px",
        color: "white",
        border: "1px solid #333",
      }}
    >
      {/* Botón Volver */}
      <button
        onClick={onBack}
        style={{
          background: "none",
          border: "none",
          color: "#fff",
          cursor: "pointer",
          marginBottom: "12px",
          fontSize: "1rem",
        }}
      >
        ←
      </button>

      {/* Cabecera con Subtotal y Tragos Vendidos */}
      <div style={{ textAlign: "right", marginBottom: "15px" }}>
        <div style={{ color: "#4caf50", fontWeight: "bold", fontSize: "1rem" }}>
          Subtotal: ${Number(weekData.weekTotal || 0).toLocaleString()}
        </div>
        <div style={{ color: "#aaa", fontSize: "0.8rem" }}>
          Tragos Vendidos: {totalUnits} un.
        </div>
      </div>

      {/* 1. SECCIÓN: Tragos vendidos por tipo (Gráfico de Barras) */}
      <div style={{ marginBottom: "20px" }}>
        <div
          style={{ fontSize: "0.85rem", color: "#ccc", marginBottom: "8px" }}
        >
          🍺 Tragos vendidos por tipo
        </div>
        <div
          style={{
            height: "140px",
            backgroundColor: "#1e1e1e",
            borderRadius: "8px",
            padding: "8px",
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={productData}>
              <XAxis
                dataKey="name"
                stroke="#888"
                fontSize={10}
                tickLine={false}
              />
              <YAxis stroke="#888" fontSize={10} tickLine={false} width={20} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#222",
                  border: "none",
                  borderRadius: "6px",
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {productData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={BAR_COLORS[index % BAR_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. SECCIÓN: Tarjetas (Trago más vendido / Tamaño más vendido) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            backgroundColor: "#1e1e1e",
            padding: "10px",
            borderRadius: "8px",
            borderLeft: "3px solid #feca57",
          }}
        >
          <div style={{ fontSize: "0.7rem", color: "#888" }}>
            🏆 Trago más vendido
          </div>
          <div
            style={{
              fontWeight: "bold",
              fontSize: "0.9rem",
              color: "#fff",
              marginTop: "2px",
            }}
          >
            {topProduct.name}
          </div>
          <div
            style={{ fontSize: "0.75rem", color: "#feca57", marginTop: "2px" }}
          >
            {topProduct.count} unidades
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#1e1e1e",
            padding: "10px",
            borderRadius: "8px",
            borderLeft: "3px solid #00d2d3",
          }}
        >
          <div style={{ fontSize: "0.7rem", color: "#888" }}>
            📦 Tamaño más vendido
          </div>
          <div
            style={{
              fontWeight: "bold",
              fontSize: "0.9rem",
              color: "#fff",
              marginTop: "2px",
            }}
          >
            1 Litro
          </div>
          <div
            style={{ fontSize: "0.75rem", color: "#00d2d3", marginTop: "2px" }}
          >
            {sizeData[0].value} unidades (70%)
          </div>
        </div>
      </div>

      {/* 3. SECCIÓN: Detalle por tamaño (Gráfico de Dona / Circular con total al centro) */}
      <div>
        <div
          style={{ fontSize: "0.85rem", color: "#ccc", marginBottom: "8px" }}
        >
          Detalle por tamaño
        </div>
        <div
          style={{
            backgroundColor: "#1e1e1e",
            borderRadius: "8px",
            padding: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{ width: "120px", height: "120px", position: "relative" }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sizeData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={38}
                  outerRadius={52}
                  stroke="none"
                >
                  {sizeData.map((entry, index) => (
                    <Cell key={`cell-size-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Texto al centro de la dona */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                textAlign: "center",
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: "1rem",
                  color: "#fff",
                  lineHeight: "1",
                }}
              >
                {totalUnits}
              </div>
              <div style={{ fontSize: "0.6rem", color: "#888" }}>unidades</div>
            </div>
          </div>

          {/* Leyenda al costado derecho */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              flex: 1,
              paddingLeft: "15px",
            }}
          >
            {sizeData.map((item, idx) => (
              <div
                key={idx}
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "2px",
                    backgroundColor: item.color,
                  }}
                />
                <div style={{ fontSize: "0.8rem", color: "#ddd" }}>
                  <div>{item.name}</div>
                  <div style={{ fontSize: "0.7rem", color: "#888" }}>
                    {item.value} un. ({idx === 0 ? "70%" : "30%"})
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
