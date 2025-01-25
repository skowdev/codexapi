import React, { useEffect, useState } from "react";
import { getTokenEvents } from "./api";

const TokenEvents = ({ address, networkId }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setEvents([]);
    setLoading(true);
    setError(null);
  }, [address, networkId]);

  useEffect(() => {
    let isMounted = true;
    let intervalId = null;

    const fetchEvents = async () => {
      try {
        const data = await getTokenEvents(address, networkId);
        if (isMounted) setEvents(data);
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const startPolling = () => {
      fetchEvents();
      intervalId = setInterval(fetchEvents, 10000); 
    };

    startPolling();

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [address, networkId]);

  if (loading) return <div>Loading transactions...</div>;
  if (error) return <div>Error : {error}</div>;

  return (
    <div>
      <h3>Last transactions</h3>
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
            <tr key={`${event.id}-${event.transactionHash}`}>
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