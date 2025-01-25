import React, { useState, useEffect } from "react";
import { getTopTokens } from "./api";
import TokenEvents from "./TokenEvents";

const TopTokens = () => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedToken, setSelectedToken] = useState(null); 

  const limit = 50; 
  const networkFilter = [1, 56]; 
  const resolution = "1D"; 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getTopTokens(limit, networkFilter, resolution);
        setTokens(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [limit, networkFilter, resolution]); 

  if (loading) {
    return <div>Chargement en cours...</div>;
  }

  if (error) {
    return <div>Erreur : {error}</div>;
  }

  return (
    <div>
      <h1>Top Tokens</h1>
      <table>
        <thead>
          <tr>
            <th>Logo</th>
            <th>Name</th>
            <th>Symbol</th>
            <th>Price (USD)</th>
            <th>Price Change (%)</th>
            <th>Liquidity (USD)</th>
            <th>Volume (USD)</th>
            <th>Market Cap (USD)</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((token) => (
            <tr
              key={token.address}
              onClick={() => setSelectedToken(token)} 
              style={{ cursor: "pointer" }}
            >
              <td>
                <img
                  src={token.imageSmallUrl}
                  alt={token.name}
                  width="24"
                  height="24"
                />
              </td>
              <td>{token.name}</td>
              <td>{token.symbol}</td>
              <td>${token.price.toFixed(2)}</td>
              <td>{token.priceChange.toFixed(2)}%</td>
              <td>${parseFloat(token.liquidity).toLocaleString()}</td>
              <td>${parseFloat(token.volume).toLocaleString()}</td>
              <td>
                {token.marketCap
                  ? `$${parseFloat(token.marketCap).toLocaleString()}`
                  : "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedToken && (
        <TokenEvents
          address={selectedToken.address}
          networkId={selectedToken.networkId}
        />
      )}
    </div>
  );
};

export default TopTokens;