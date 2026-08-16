import { useState, type FormEvent } from "react";
import styles from "./AddProductForm.module.css";

// ❌ Quitamos 'category: string' de aquí
interface SaleFormData {
  name: string;
  price: number;
  quantity: number;
}

interface AddProductFormProps {
  onRegisterSale: (saleData: SaleFormData) => void;
}

export function AddProductForm({ onRegisterSale }: AddProductFormProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState(1);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!name || !price) {
      alert("Por favor selecciona un trago y su formato de precio");
      return;
    }

    // Ahora este objeto coincide perfectamente con la interface SaleFormData
    onRegisterSale({
      name,
      price: Number(price),
      quantity: Number(quantity),
    });

    // Limpiamos los campos
    setName("");
    setPrice("");
    setQuantity(1);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <h3 className={styles.title}>➕ Registrar Nueva Venta</h3>

      <div className={styles.formGrid}>
        <div>
          <label className={styles.label}>Nombre del Trago:</label>
          <select
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles.select}
          >
            <option value="" disabled>
              Seleccione un trago...
            </option>
            <option value="Borgoña">Borgoña</option>
            <option value="Daiquiri">Daiquiri</option>
            <option value="Piña Colada">Piña Colada</option>
            <option value="Terremoto">Terremoto</option>
          </select>
        </div>

        <div className={styles.rowTwoColumns}>
          <div>
            <label className={styles.label}>Formato y Precio ($):</label>
            <select
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={styles.select}
            >
              <option value="" disabled>
                Seleccione precio...
              </option>
              <option value="7000">$7.000 (1 Litro)</option>
              <option value="4000">$4.000 (Medio Litro)</option>
            </select>
          </div>

          <div>
            <label className={styles.label}>Cantidad:</label>
            <select
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className={styles.select}
            >
              <option value="1">1 unidad</option>
              <option value="2">2 unidades</option>
              <option value="3">3 unidades</option>
              <option value="4">4 unidades</option>
              <option value="5">5 unidades</option>
            </select>
          </div>
        </div>

        <button type="submit" className={styles.btnSubmit}>
          💰 Registrar Venta
        </button>
      </div>
    </form>
  );
}
