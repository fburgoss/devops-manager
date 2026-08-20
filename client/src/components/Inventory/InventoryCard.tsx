import { useState, useEffect } from "react";
import styles from "./InventoryCard.module.css";

interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
  minAlert: number;
}

interface InventoryCardProps {
  apiUrl: string;
}

export default function InventoryCard({ apiUrl }: InventoryCardProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchInventory = async () => {
    try {
      const response = await fetch(`${apiUrl}/inventory`);
      const data = await response.json();
      setInventory(data);
    } catch (error) {
      console.error("Error al cargar el inventario:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [apiUrl]);

  const handleUpdateStock = async (
    id: number,
    currentQuantity: number,
    change: number,
  ) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 0) return;

    try {
      const response = await fetch(`${apiUrl}/inventory/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (response.ok) {
        fetchInventory();
      }
    } catch (error) {
      console.error("Error al actualizar el stock:", error);
    }
  };

  if (loading)
    return <p className={styles.loadingText}>Cargando inventario...</p>;

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>📦 Control de Insumos</h3>

      <div className={styles.itemList}>
        {inventory.map((item) => {
          const isLow = item.quantity <= item.minAlert;

          return (
            <div
              key={item.id}
              className={`${styles.itemCard} ${isLow ? styles.itemCardLow : ""}`}
            >
              <div>
                <h4 className={styles.itemName}>{item.name}</h4>
                <p
                  className={`${styles.itemStock} ${isLow ? styles.itemStockLow : ""}`}
                >
                  Stock:{" "}
                  <span className={styles.stockNumber}>{item.quantity}</span>
                  {isLow && (
                    <span className={styles.alertBadge}>¡Bajo stock!</span>
                  )}
                </p>
              </div>

              <div className={styles.buttonGroup}>
                <button
                  onClick={() => handleUpdateStock(item.id, item.quantity, -1)}
                  className={styles.btnMinus}
                  title="Restar 1"
                >
                  -
                </button>
                <button
                  onClick={() => handleUpdateStock(item.id, item.quantity, 1)}
                  className={styles.btnPlus}
                  title="Sumar 1"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
