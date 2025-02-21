import React from "react";

const MonthlySummary = ({ summary }) => {
    console.log("🔹 Riepilogo mensile calcolato:", summary);
    return (
        <div className="monthly-summary-container">
            <h2>Riepilogo Mensile</h2>
            <div className="summary-content">
                {/* Sezione Sinistra - Valori */}
                <div className="summary-left">
                    <p><strong>Tasse di soggiorno totali:</strong> {summary.totalTax} €</p>
                    <p><strong>Importo:</strong> {summary.totalCost} €</p>
                    <p><strong>Imponibile:</strong> {parseFloat((summary.totalCost - summary.totalTax)/1.1).toFixed(2)} €</p>
                    <p><strong>Numero Persone:</strong> {summary.numPerson}</p>
                    <p><strong>Numero Esenzioni:</strong> {summary.numEs}</p>
                    <p><strong>Numero Airbnb:</strong> {summary.numAir}</p>
                    <p><strong>Numero Notti:</strong> {summary.numNight}</p>

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
