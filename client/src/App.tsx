import { useState, useEffect } from "react";
import { AddProductForm } from "./components/AddProductForm/AddProductForm";
import {
  SalesHistory,
  type Sale,
} from "./components/SalesHistory/SalesHistory";
import logoImg from "./assets/logo final.png";
import styles from "./App.module.css";

export function App() {
  // 1. Iniciamos el estado vacío (ya no usamos localStorage)
  const [sales, setSales] = useState<Sale[]>([]);

  // 2. GET: Cargamos las ventas del backend al abrir la app
  useEffect(() => {
    const fetchSales = async () => {
      try {
        const response = await fetch("http://localhost:3000/sales");
        if (response.ok) {
          const data = await response.json();

          // Adaptamos los datos planos del backend al formato que usa tu componente SalesHistory
          const formattedSales: Sale[] = data.map((d: any) => ({
            id: String(d.id),
            date: new Date().toISOString(), // Usamos la fecha actual para el formato del historial
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
  }, []); // El array vacío indica que se ejecuta solo al cargar la página

  // 3. POST: Guardamos la nueva venta en NestJS
  const handleRegisterSale = async (saleData: {
    name: string;
    price: number;
    quantity: number;
  }) => {
    const totalAmount = saleData.price * saleData.quantity;

    try {
      const response = await fetch("http://localhost:3000/sales", {
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

        // Armamos la venta con el formato que necesita React para dibujarla
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

  // 4. (Por ahora borra solo visualmente, luego le haremos su Endpoint en NestJS)
  const handleDeleteSale = (id: string) => {
    const confirmDelete = window.confirm(
      "¿Estás seguro de que deseas anular esta venta?",
    );
    if (confirmDelete) {
      setSales((prevSales) => prevSales.filter((sale) => sale.id !== id));
    }
  };

  const totalDailyRevenue = sales.reduce((acc, sale) => acc + sale.total, 0);

  const totalDailyDrinksSold = sales.reduce(
    (acc, sale) =>
      acc + sale.items.reduce((sum, item) => sum + item.quantity, 0),
    0,
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>🍹 El TintoBar</h1>
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
    </div>
  );
}

export default App;
