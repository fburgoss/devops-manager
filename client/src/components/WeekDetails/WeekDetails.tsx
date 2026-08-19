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
  // Convertimos el objeto de productos a un array para los gráficos
  const productData = Object.entries(weekData.products).map(
    ([name, data]: any) => ({
      name,
      ...data,
    }),
  );

  const COLORS = ["#ff4757", "#00d2d3", "#feca57", "#5f27cd"];

  return (
    <div
      style={{
        backgroundColor: "#1e1e1e",
        padding: "20px",
        borderRadius: "12px",
        color: "white",
      }}
    >
      <button
        onClick={onBack}
        style={{
          background: "none",
          border: "none",
          color: "#888",
          cursor: "pointer",
          marginBottom: "10px",
        }}
      >
        ⬅ Volver
      </button>

      <h3 style={{ textAlign: "center" }}>Tragos vendidos por tipo</h3>
      <div style={{ height: "200px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={productData}>
            <XAxis dataKey="name" stroke="#888" fontSize={10} />
            <Tooltip
              contentStyle={{ backgroundColor: "#333", border: "none" }}
            />
            <Bar dataKey="count" fill="#ff4757" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <h3 style={{ textAlign: "center", marginTop: "20px" }}>
        Detalle por volumen ($)
      </h3>
      <div style={{ height: "200px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={productData}
              dataKey="total"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={60}
              label
            >
              {productData.map((_, index: number) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
