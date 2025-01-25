import React, { useEffect, useState } from "react";
import { getTokenEvents, subscribeToTokenEvents } from "./api";

const TokenEvents = ({ address, networkId }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInitialEvents = async () => {
      try {
        const initialData = await getTokenEvents(address, networkId);
        setEvents(initialData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialEvents();
  }, [address, networkId]);

  useEffect(() => {
    const subscription = subscribeToTokenEvents(address, networkId, (newEvent) => {
      setEvents(prev => [newEvent, ...prev.slice(0, 4)]);
    });

  }, [address, networkId]);

  if (loading) return <div>Loading transactions...</div>;
  if (error) return <div>Error : {error}</div>;

  return (
    <div>
      <h3>Real time transactions</h3>
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
            <tr key={`${event.id}-${Date.now()}`}> 
              <td>{new Date(event.timestamp * 1000).toLocaleString()}</td>
              <td>{event.eventDisplayType}</td>
              <td>{event.maker}</td>
              <td>${event.data?.priceUsdTotal || event.token0SwapValueUsd || "N/A"}</td>
              <td>{event.transactionHash}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TokenEvents;
