import './pagos.css';
export default function PagosPage() {
  return (
    <div className="payment-container">
      <div className="header">
        <span className="amount">CANTIDAD_RECIBIDA</span>
        <span className="currency">MXN</span>
        <div className="reference">REFERENCIA_CARRITO</div>
      </div>

      <br />
      <br />

      <form>
        <input type="text" placeholder="Tarjeta" />
        <div className="detalles_tarjeta">
          <input type="text" placeholder="Expira" />
          <input type="text" placeholder="CVV" />
        </div>
        <input type="email" placeholder="e-mail" />
        <input type="text" placeholder="Nombre" />
        <div className="save-card">
          <input type="checkbox" id="save-card-checkbox" />
          <label htmlFor="save-card-checkbox">Guardar mi tarjeta</label>
        </div>
        <button type="submit" className="pay-button">
          PAGAR CANTIDAD_RECIBIDA
        </button>
      </form>
    </div>
  );
}