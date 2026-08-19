import { useState, useEffect } from "react";
import { WeekDetails } from "./components/WeekDetails/WeekDetails";
import { AddProductForm } from "./components/AddProductForm/AddProductForm";
import {
  SalesHistory,
  type Sale,
} from "./components/SalesHistory/SalesHistory";
import logoImg from "./assets/logo final.png";
import styles from "./App.module.css";

const API_URL =
  import.meta.env.VITE_API_URL || "https://tintobar-backend.onrender.com";

export function App() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const [showHistoryWidget, setShowHistoryWidget] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState<any>(null);
  const [historySummary, setHistorySummary] = useState<any>({});

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/sales/history-summary`);
      if (response.ok) setHistorySummary(await response.json());
    } catch (error) {
      console.error("Error histórico:", error);
    }
  };

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const response = await fetch(`${API_URL}/sales`);
        if (response.ok) {
          const data = await response.json();
          setSales(
            data.map((d: any) => ({
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
            })),
          );
        }
      } catch (error) {
        console.error("Error ventas:", error);
      }
    };
    fetchSales();
    fetchHistory();
  }, []);

  const handleRegisterSale = async (saleData: {
    name: string;
    price: number;
    quantity: number;
  }) => {
    const totalAmount = saleData.price * saleData.quantity;
    try {
      const response = await fetch(`${API_URL}/sales`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: saleData.name,
          price: saleData.price,
          quantity: saleData.quantity,
          total: totalAmount,
        }),
      });
      if (response.ok) {
        const savedSale = await response.json();
        setSales((prev) => [
          ...prev,
          {
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
          },
        ]);
      }
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  const handleDeleteSale = async (id: string) => {
    if (window.confirm("¿Estás seguro de anular esta venta?")) {
      const response = await fetch(`${API_URL}/sales/${id}`, {
        method: "DELETE",
      });
      if (response.ok) setSales((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleCloseDay = async () => {
    if (
      window.confirm(
        "¿Deseas finalizar el día y enviar el reporte a tu correo?",
      )
    ) {
      const response = await fetch(`${API_URL}/sales/close-day`, {
        method: "POST",
      });
      if (response.ok) {
        alert("¡Día finalizado y reporte enviado a tu correo con éxito!");
        setSales([]);
        fetchHistory();
      } else {
        alert("Hubo un error al enviar el reporte.");
      }
    }
  };

  const totalDailyRevenue = sales.reduce(
    (acc, s) => acc + (Number(s.total) || 0),
    0,
  );
  const totalDailyDrinksSold = sales.reduce(
    (acc, s) => acc + s.items.reduce((sum, i) => sum + i.quantity, 0),
    0,
  );

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

          {/* WIDGET HISTÓRICO ORIGINAL RESTAURADO */}
          <div
            style={{
              backgroundColor: "#1e1e1e",
              padding: "18px",
              borderRadius: "12px",
              border: "1px solid #333",
              marginTop: "15px",
              marginBottom: "15px",
            }}
          >
            <div
              style={{ cursor: "pointer" }}
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
                ) : (
                  (() => {
                    const monthsKeys = Object.keys(historySummary).reverse();
                    const currentMonthName =
                      monthsKeys[
                        Math.min(currentMonthIndex, monthsKeys.length - 1)
                      ];
                    const weeks = historySummary[currentMonthName] || {};
                    return (
                      <div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            backgroundColor: "#252525",
                            padding: "10px",
                            borderRadius: "8px",
                            marginBottom: "12px",
                          }}
                        >
                          <button
                            onClick={() =>
                              setCurrentMonthIndex((p) => Math.max(p - 1, 0))
                            }
                            disabled={currentMonthIndex === 0}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#ff4757",
                              fontWeight: "bold",
                            }}
                          >
                            ◀
                          </button>
                          <div style={{ textAlign: "center" }}>
                            <span
                              style={{ color: "#ff4757", fontWeight: "bold" }}
                            >
                              📅 {currentMonthName?.toUpperCase()}
                            </span>
                          </div>
                          <button
                            onClick={() =>
                              setCurrentMonthIndex((p) =>
                                Math.min(p + 1, monthsKeys.length - 1),
                              )
                            }
                            disabled={
                              currentMonthIndex === monthsKeys.length - 1
                            }
                            style={{
                              background: "none",
                              border: "none",
                              color: "#ff4757",
                              fontWeight: "bold",
                            }}
                          >
                            ▶
                          </button>
                        </div>
                        {Object.entries(weeks).map(
                          ([weekName, weekData]: any, i) => (
                            <div
                              key={i}
                              style={{
                                backgroundColor: "#2a2a2a",
                                padding: "10px",
                                borderRadius: "6px",
                                marginBottom: "10px",
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
                                  style={{ color: "#fff", fontWeight: "bold" }}
                                >
                                  {weekName}
                                </span>
                                <span
                                  style={{
                                    color: "#4caf50",
                                    fontWeight: "bold",
                                  }}
                                >
                                  Subtotal: $
                                  {weekData.weekTotal.toLocaleString()}
                                </span>
                              </div>
                              <div
                                style={{
                                  borderLeft: "2px solid #444",
                                  paddingLeft: "10px",
                                  marginTop: "8px",
                                }}
                              >
                                {weekData.days.map((day: any, j: number) => (
                                  <div
                                    key={j}
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      fontSize: "0.8rem",
                                      color: "#aaa",
                                      marginBottom: "2px",
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
                    );
                  })()
                )}
              </div>
            )}
          </div>
        </div>

        {/* LOGO DERECHA ORIGINAL */}
        <div className={styles.logoContainer}>
          <img
            src={logoImg}
            alt="El TintoBar Logo"
            className={styles.brandLogo}
          />
        </div>
      </div>

      <SalesHistory sales={sales} onDeleteSale={handleDeleteSale} />

      <div
        style={{ textAlign: "center", marginTop: "30px", marginBottom: "40px" }}
      >
        <button
          onClick={handleCloseDay}
          style={{
            backgroundColor: "#ff4757",
            color: "white",
            padding: "14px 28px",
            borderRadius: "8px",
            fontWeight: "bold",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(255, 71, 87, 0.3)",
          }}
        >
          🏁 Finalizar Día y Enviar Reporte
        </button>
      </div>
    </div>
  );
}
export default App;
