// src/TokenEvents.js
import React, { useEffect, useState, useRef } from "react";
import { getTokenEvents } from "./api";

const TokenEvents = ({ address, networkId }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const cursorRef = useRef(null);
  const existingHashes = useRef(new Set());

  const fetchNewTransactions = async () => {
    try {
      const result = await getTokenEvents(address, networkId, 10, cursorRef.current);
      
      // Filtrer les transactions déjà affichées
      const newTransactions = result.items.filter(
        item => !existingHashes.current.has(item.transactionHash)
      );

      if (newTransactions.length > 0) {
        existingHashes.current = new Set([
          ...Array.from(existingHashes.current),
          ...newTransactions.map(t => t.transactionHash)
        ]);

        // Ajouter en haut et garder max 5 éléments
        setEvents(prev => [
          ...newTransactions,
          ...prev.slice(0, 5 - newTransactions.length)
        ]);

        cursorRef.current = result.cursor;
      }
    } catch (err) {
      console.error("Polling error:", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const initialResult = await getTokenEvents(address, networkId);
        const initialTransactions = initialResult.items;
        
        existingHashes.current = new Set(
          initialTransactions.map(t => t.transactionHash)
        );

        setEvents(initialTransactions.slice(0, 5));
        cursorRef.current = initialResult.cursor;
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }

      // Démarrer le polling
      const interval = setInterval(fetchNewTransactions, 2000);
      return () => clearInterval(interval);
    };

    init();
  }, [address, networkId]);

  if (loading) return <div>Loading transactions...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h3>Real-time transactions (Swap)</h3>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Maker</th>
            <th>Amount (USD)</th>
            <th>Hash</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.transactionHash}>
              <td>{new Date(event.timestamp * 1000).toLocaleString()}</td>
              <td>{event.eventDisplayType}</td>
              <td>{event.maker}</td>
              <td>
                {event.data?.priceUsdTotal 
                  ? `$${parseFloat(event.data.priceUsdTotal).toFixed(2)}`
                  : "N/A"}
              </td>
              <td>{event.transactionHash}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TokenEvents;