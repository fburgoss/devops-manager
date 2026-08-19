import { useState, useEffect } from "react";
import { WeekDetails } from "./components/WeekDetails/WeekDetails";
import { AddProductForm } from "./components/AddProductForm/AddProductForm";
import {
  SalesHistory,
  type Sale,
} from "./components/SalesHistory/SalesHistory";
import logoImg from "./assets/logo final.png";
import styles from "./App.module.css";

// Definimos la URL base usando la variable de entorno de Vite o fallback a localhost
const API_URL =
  import.meta.env.VITE_API_URL || "https://tintobar-backend.onrender.com";

export function App() {
  // 1. Iniciamos el estado vacío
  const [sales, setSales] = useState<Sale[]>([]);

  // Estado para controlar qué mes se muestra en el widget (índice del mes)
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);

  // Estado para alternar la visibilidad del widget de métricas históricas
  const [showHistoryWidget, setShowHistoryWidget] = useState(true);

  // Estado para guardar la semana seleccionada para ver los gráficos detallados
  const [selectedWeek, setSelectedWeek] = useState<any>(null);

  // Estado para el historial agrupado por Meses y Semanas
  const [historySummary, setHistorySummary] = useState<{
    [monthName: string]: {
      [weekName: string]: {
        days: { date: string; total: number; count: number }[];
        weekTotal: number;
        weekCount: number;
      };
    };
  }>({});

  // Función para cargar el resumen histórico
  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/sales/history-summary`);
      if (response.ok) {
        const data = await response.json();
        setHistorySummary(data);
      }
    } catch (error) {
      console.error("Error al cargar el resumen histórico:", error);
    }
  };

  // 2. GET: Cargamos las ventas del backend al abrir la app
  useEffect(() => {
    const fetchSales = async () => {
      try {
        const response = await fetch(`${API_URL}/sales`);
        if (response.ok) {
          const data = await response.json();

          const formattedSales: Sale[] = data.map((d: any) => ({
            id: String(d.id),
            date: new Date().toISOString(),
            items: [
              {
                productId: d.id,
                name: d.name,
                price: d.price,
                quantity: d.quantity,
              },
            ],
            total: d.total,
          }));

          setSales(formattedSales);
        }
      } catch (error) {
        console.error("Error al cargar el historial desde el servidor:", error);
      }
    };

    fetchSales();
    fetchHistory();
  }, []);

  // 3. POST: Guardamos la nueva venta en NestJS
  const handleRegisterSale = async (saleData: {
    name: string;
    price: number;
    quantity: number;
  }) => {
    const totalAmount = saleData.price * saleData.quantity;

    try {
      const response = await fetch(`${API_URL}/sales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: saleData.name,
          price: saleData.price,
          quantity: saleData.quantity,
          total: totalAmount,
        }),
      });

      if (response.ok) {
        const savedSale = await response.json();

        const newSale: Sale = {
          id: String(savedSale.id),
          date: new Date().toISOString(),
          items: [
            {
              productId: savedSale.id,
              name: savedSale.name,
              price: savedSale.price,
              quantity: savedSale.quantity,
            },
          ],
          total: savedSale.total,
        };

        setSales((prevSales) => [...prevSales, newSale]);
      }
    } catch (error) {
      console.error("Error al guardar la venta en el servidor:", error);
    }
  };

  const handleDeleteSale = async (id: string) => {
    const confirmDelete = window.confirm(
      "¿Estás seguro de que deseas anular esta venta?",
    );

    if (confirmDelete) {
      try {
        const response = await fetch(`${API_URL}/sales/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setSales((prevSales) => prevSales.filter((sale) => sale.id !== id));
        } else {
          alert("No se pudo eliminar la venta en el servidor.");
        }
      } catch (error) {
        console.error("Error al eliminar la venta:", error);
      }
    }
  };

  // 4. Cálculos para las métricas
  const totalDailyRevenue = sales.reduce((acc, sale) => {
    const numericTotal = Number(sale.total) || 0;
    return acc + numericTotal;
  }, 0);

  const totalDailyDrinksSold = sales.reduce(
    (acc, sale) =>
      acc + sale.items.reduce((sum, item) => sum + item.quantity, 0),
    0,
  );

  const handleCloseDay = async () => {
    if (
      !window.confirm(
        "¿Deseas finalizar el día y enviar el reporte a tu correo?",
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/sales/close-day`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        alert("¡Día finalizado y reporte enviado a tu correo con éxito!");
        setSales([]);
        fetchHistory(); // Actualizamos el widget histórico al cerrar el día
      } else {
        alert("Hubo un error al enviar el reporte.");
      }
    } catch (error) {
      console.error("Error al conectar con el servidor para el cierre:", error);
      alert("Error de conexión con el servidor.");
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            justifyContent: "center",
          }}
        >
          <img
            src={logoImg}
            alt="El TiintoBar Logo"
            style={{ width: "45px", height: "45px", objectFit: "contain" }}
          />
          <h1 className={styles.title}>El TiintoBar</h1>
        </div>
        <p className={styles.subtitle}>
          Control rápido de transacciones diarias
        </p>
      </header>

      <div className={styles.mainLayout}>
        <div className={styles.leftSection}>
          <div className={styles.metricsGrid}>
            <div className={styles.metricCardRevenue}>
              <span className={styles.metricLabel}>Recaudación del Día</span>
              <h2 className={styles.metricValueRevenue}>
                ${totalDailyRevenue.toLocaleString()}
              </h2>
            </div>

            <div className={styles.metricCardSold}>
              <span className={styles.metricLabel}>Tragos Vendidos</span>
              <h2 className={styles.metricValueSold}>
                {totalDailyDrinksSold} un.
              </h2>
            </div>
          </div>

          <AddProductForm onRegisterSale={handleRegisterSale} />

          {/* WIDGET DE MÉTRICAS HISTÓRICAS CON NAVEGACIÓN LATERAL DE MESES */}
          {/* WIDGET DE MÉTRICAS HISTÓRICAS CON CONTROL DE VISIBILIDAD Y CRONOLOGÍA CORRECTA */}
          <div
            style={{
              backgroundColor: "#1e1e1e",
              padding: "18px",
              borderRadius: "12px",
              border: "1px solid #333333",
              marginTop: "15px",
              marginBottom: "15px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
              }}
              onClick={() => setShowHistoryWidget(!showHistoryWidget)}
            >
              <h3
                style={{
                  color: "#ffffff",
                  margin: 0,
                  fontSize: "1.05rem",
                  textAlign: "center",
                  width: "100%",
                }}
              >
                📊 Resumen por Meses y Semanas {showHistoryWidget ? "▲" : "▼"}
              </h3>
            </div>

            {showHistoryWidget && (
              <div style={{ marginTop: "15px" }}>
                {selectedWeek ? (
                  <WeekDetails
                    weekData={selectedWeek}
                    onBack={() => setSelectedWeek(null)}
                  />
                ) : Object.keys(historySummary).length === 0 ? (
                  <p
                    style={{
                      color: "#888888",
                      textAlign: "center",
                      fontSize: "0.85rem",
                    }}
                  >
                    Aún no hay jornadas cerradas registradas.
                  </p>
                ) : (
                  (() => {
                    const monthsKeys = Object.keys(historySummary).reverse();
                    const safeIndex = Math.min(
                      currentMonthIndex,
                      monthsKeys.length - 1,
                    );
                    const currentMonthName = monthsKeys[safeIndex];
                    const weeks = historySummary[currentMonthName];
                    const monthTotal = Object.values(weeks).reduce(
                      (acc, w) => acc + w.weekTotal,
                      0,
                    );

                    return (
                      <div>
                        {/* Barra de Navegación de Meses con Flechas */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            backgroundColor: "#252525",
                            padding: "10px 14px",
                            borderRadius: "8px",
                            border: "1px solid #444",
                            marginBottom: "12px",
                          }}
                        >
                          <button
                            onClick={() =>
                              setCurrentMonthIndex((prev) =>
                                Math.max(prev - 1, 0),
                              )
                            }
                            disabled={safeIndex === 0}
                            style={{
                              background: "none",
                              border: "none",
                              color: safeIndex === 0 ? "#555" : "#ff4757",
                              fontSize: "1.2rem",
                              cursor:
                                safeIndex === 0 ? "not-allowed" : "pointer",
                              fontWeight: "bold",
                              padding: "0 8px",
                            }}
                          >
                            ◀
                          </button>

                          <div style={{ textAlign: "center" }}>
                            <span
                              style={{
                                color: "#ff4757",
                                fontWeight: "bold",
                                fontSize: "1rem",
                                display: "block",
                              }}
                            >
                              📅 {currentMonthName.toUpperCase()}
                            </span>
                            <span
                              style={{
                                color: "#4caf50",
                                fontWeight: "bold",
                                fontSize: "0.85rem",
                              }}
                            >
                              Total Mes: ${monthTotal.toLocaleString()}
                            </span>
                          </div>

                          <button
                            onClick={() =>
                              setCurrentMonthIndex((prev) =>
                                Math.min(prev + 1, monthsKeys.length - 1),
                              )
                            }
                            disabled={safeIndex === monthsKeys.length - 1}
                            style={{
                              background: "none",
                              border: "none",
                              color:
                                safeIndex === monthsKeys.length - 1
                                  ? "#555"
                                  : "#ff4757",
                              fontSize: "1.2rem",
                              cursor:
                                safeIndex === monthsKeys.length - 1
                                  ? "not-allowed"
                                  : "pointer",
                              fontWeight: "bold",
                              padding: "0 8px",
                            }}
                          >
                            ▶
                          </button>
                        </div>

                        {/* Semanas del Mes Seleccionado */}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                            maxHeight: "280px",
                            overflowY: "auto",
                          }}
                        >
                          {Object.entries(weeks).map(
                            ([weekName, weekData], wIndex) => (
                              <div
                                key={wIndex}
                                style={{
                                  backgroundColor: "#2a2a2a",
                                  padding: "10px",
                                  borderRadius: "6px",
                                  borderLeft: "4px solid #ff4757",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "6px",
                                  }}
                                >
                                  <span
                                    style={{
                                      color: "#ffffff",
                                      fontWeight: "bold",
                                      fontSize: "0.85rem",
                                    }}
                                  >
                                    {weekName}
                                  </span>

                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "10px",
                                    }}
                                  >
                                    {/* Botón para ver los gráficos avanzados */}
                                    <button
                                      onClick={() => setSelectedWeek(weekData)}
                                      style={{
                                        background: "#333",
                                        border: "1px solid #555",
                                        color: "#00d2d3",
                                        borderRadius: "4px",
                                        padding: "2px 6px",
                                        fontSize: "0.7rem",
                                        cursor: "pointer",
                                      }}
                                    >
                                      📊 Ver gráficos
                                    </button>

                                    <span
                                      style={{
                                        color: "#4caf50",
                                        fontWeight: "bold",
                                        fontSize: "0.85rem",
                                      }}
                                    >
                                      Subtotal: $
                                      {weekData.weekTotal.toLocaleString()}
                                    </span>
                                  </div>
                                </div>

                                {/* DETALLE DE LOS DÍAS (Fechas, tragos y montos individuales restaurados) */}
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "4px",
                                    paddingLeft: "10px",
                                    borderLeft: "2px solid #444",
                                  }}
                                >
                                  {weekData.days.map((day, dIndex) => (
                                    <div
                                      key={dIndex}
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        fontSize: "0.8rem",
                                        color: "#aaaaaa",
                                      }}
                                    >
                                      <span>
                                        • {day.date} ({day.count} tragos)
                                      </span>
                                      <span style={{ color: "#fff" }}>
                                        ${Number(day.total).toLocaleString()}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>
            )}
          </div>
        </div>

        <div className={styles.logoContainer}>
          <img
            src={logoImg}
            alt="El TintoBar Logo"
            className={styles.brandLogo}
          />
        </div>
      </div>

      <SalesHistory sales={sales} onDeleteSale={handleDeleteSale} />

      {/* Botón de Cierre de Día */}
      <div
        style={{ textAlign: "center", marginTop: "30px", marginBottom: "40px" }}
      >
        <button
          onClick={handleCloseDay}
          style={{
            backgroundColor: "#ff4757",
            color: "white",
            border: "none",
            padding: "14px 28px",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "1.1rem",
            boxShadow: "0 4px 12px rgba(255, 71, 87, 0.3)",
            transition: "background 0.2s",
          }}
        >
          🏁 Finalizar Día y Enviar Reporte
        </button>
      </div>
    </div>
  );
}

export default App;
