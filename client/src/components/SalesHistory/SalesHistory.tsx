import styles from "./SalesHistory.module.css";

export interface SaleItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

export interface Sale {
  id: string;
  date: string;
  items: SaleItem[];
  total: number;
}

interface SalesHistoryProps {
  sales: Sale[];
  onDeleteSale: (id: string) => void; // 👈 Prop para anular/eliminar venta
}

export function SalesHistory({ sales, onDeleteSale }: SalesHistoryProps) {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>
        📜 Historial de Ventas del Día ({sales.length})
      </h3>

      {sales.length === 0 ? (
        <p className={styles.emptyText}>
          Aún no se han registrado ventas hoy. Selecciona un trago y presiona
          "Registrar Venta".
        </p>
      ) : (
        <div className={styles.salesList}>
          {sales
            .slice()
            .reverse()
            .map((sale) => {
              const formattedDate = new Date(sale.date).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              });

              return (
                <div key={sale.id} className={styles.saleCard}>
                  <div className={styles.saleHeader}>
                    <span>🕒 {formattedDate}</span>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <span className={styles.saleTotal}>
                        ${sale.total.toLocaleString()}
                      </span>
                      {/* Botón para anular transacción */}
                      <button
                        onClick={() => onDeleteSale(sale.id)}
                        className={styles.btnDeleteSale}
                        title="Anular Venta"
                      >
                        🗑️ Anular
                      </button>
                    </div>
                  </div>
                  <ul className={styles.itemList}>
                    {sale.items.map((item) => (
                      <li key={item.productId} className={styles.itemRow}>
                        <span>
                          {item.quantity}x {item.name} ($
                          {item.price.toLocaleString()})
                        </span>
                        <span>
                          ${(item.price * item.quantity).toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
