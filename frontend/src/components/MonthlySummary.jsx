import React from "react";

const MonthlySummary = ({ summary }) => {
    return (
        <div className="monthly-summary-container">
            <h2>Riepilogo Mensile</h2>
            <div className="summary-content">
                {/* Sezione Sinistra - Valori */}
                <div className="summary-left">
                    <p><strong>Tasse di soggiorno totali:</strong> {summary.totalTax} €</p>
                    <p><strong>Costi clienti totali:</strong> {summary.totalCost} €</p>
                </div>

                {/* Sezione Destra - Grafici (spazio vuoto) */}
                <div className="summary-right">
                    <p>📊 Spazio per il grafico</p>
                </div>
            </div>
        </div>
    );
};

export default MonthlySummary;
