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
    console.error("Erreur lors de la récupération des top tokens:", error);
    return [];
  }
};

export const getTokenEvents = async (address, networkId, limit = 50) => {
    try {
      const response = await sdk.send(
        `
        query GetTokenEvents($address: String!, $networkId: Int!, $limit: Int!) {
          getTokenEvents(
            limit: $limit
            query: { address: $address, networkId: $networkId, eventType: Swap }
            direction: DESC
          ) {
            items {
              id
              timestamp
              eventType
              eventDisplayType
              transactionHash
              maker
              data {
                ... on SwapEventData {
                  amountNonLiquidityToken
                  priceUsdTotal
                }
              }
              token0SwapValueUsd
              token1SwapValueUsd
            }
          }
        }
      `,
        {
          address,
          networkId,
          limit,
        }
      );
      return response.getTokenEvents.items;
    } catch (error) {
      console.error("Erreur lors de la récupération des événements du token:", error);
      return [];
    }
  };