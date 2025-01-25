// src/api.js
import { Codex } from "@codex-data/sdk";

const apiKey = process.env.REACT_APP_CODEX_API_KEY || "";
const sdk = new Codex(apiKey);

export const getTopTokens = async (limit, networkFilter, resolution) => {
  try {
    const response = await sdk.send(
      `
      query GetTopTokens($limit: Int!, $networkFilter: [Int!], $resolution: String!) {
        listTopTokens(limit: $limit, networkFilter: $networkFilter, resolution: $resolution) {
          address
          name
          symbol
          price
          priceChange
          networkId
          liquidity
          volume
          marketCap
          imageSmallUrl
        }
      }
    `,
      {
        limit,
        networkFilter,
        resolution,
      }
    );
    return response.listTopTokens;
  } catch (error) {
    console.error("Error fetching top tokens:", error);
    return [];
  }
};

export const getTokenEvents = async (address, networkId, limit = 50, cursor = null) => {
    try {
      const response = await sdk.send(
        `
        query GetTokenEvents($address: String!, $networkId: Int!, $limit: Int!, $cursor: String) {
          getTokenEvents(
            limit: $limit
            cursor: $cursor
            query: { address: $address, networkId: $networkId, eventType: Swap }
            direction: DESC
          ) {
            items {
              id
              timestamp
              eventDisplayType
              transactionHash
              maker
              data {
                ... on SwapEventData {
                  priceUsdTotal
                }
              }
            }
            cursor
          }
        }
        `,
        { address, networkId, limit, cursor }
      );
      return response.getTokenEvents;
    } catch (error) {
      console.error("Error fetching token events:", error);
      return { items: [], cursor: null };
    }
  };