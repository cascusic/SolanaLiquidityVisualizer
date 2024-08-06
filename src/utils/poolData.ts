import { getRaydiumInstance } from './raydium';
import { ApiV3PoolInfoItem } from '@raydium-io/raydium-sdk-v2';

interface LiquidityPoint {
  price: number;
  liquidityUSD: number;
}

interface AggregatedPoolData {
  liquidityPoints: LiquidityPoint[];
  totalLiquidity: number;
}

export async function fetchDetailedPoolData(tokenMint: string): Promise<AggregatedPoolData> {
  const raydium = getRaydiumInstance();

  try {
    console.log('Fetching detailed pool data for token:', tokenMint);
    const poolsResponse = await raydium.api.fetchPoolByMints({
      mint1: tokenMint,
    });

    if (!poolsResponse.data || !Array.isArray(poolsResponse.data)) {
      console.error('Unexpected poolsResponse structure:', poolsResponse);
      return { liquidityPoints: [], totalLiquidity: 0 };
    }

    let aggregatedLiquidity: { [price: string]: number } = {};
    let totalLiquidity = 0;

    for (const pool of poolsResponse.data) {
      const liquidity = parseFloat(pool.tvl);
      const price = parseFloat(pool.price);
      
      if (isNaN(liquidity) || isNaN(price) || price <= 0 || liquidity <= 0) {
        console.warn('Skipping invalid pool data:', pool);
        continue;
      }

      const priceKey = price.toFixed(8);
      
      if (!aggregatedLiquidity[priceKey]) {
        aggregatedLiquidity[priceKey] = 0;
      }
      aggregatedLiquidity[priceKey] += liquidity;
      totalLiquidity += liquidity;

      if (pool.type === 'Concentrated') {
        const concentratedPool = pool as ApiV3PoolInfoItem;
        const additionalPoints = generateAdditionalPricePoints(concentratedPool, liquidity);
        for (const point of additionalPoints) {
          const pointPriceKey = point.price.toFixed(8);
          if (!aggregatedLiquidity[pointPriceKey]) {
            aggregatedLiquidity[pointPriceKey] = 0;
          }
          aggregatedLiquidity[pointPriceKey] += point.liquidityUSD;
        }
      }
    }

    const liquidityPoints = Object.entries(aggregatedLiquidity)
      .map(([price, liquidity]) => ({
        price: parseFloat(price),
        liquidityUSD: liquidity,
      }))
      .filter(point => !isNaN(point.price) && !isNaN(point.liquidityUSD) && point.price > 0 && point.liquidityUSD > 0)
      .sort((a, b) => a.price - b.price);

    return { liquidityPoints, totalLiquidity };
  } catch (error) {
    console.error('Error fetching detailed pool data:', error);
    throw error;
  }
}

function generateAdditionalPricePoints(pool: ApiV3PoolInfoItem, totalLiquidity: number): LiquidityPoint[] {
  const currentPrice = parseFloat(pool.price);
  const points: LiquidityPoint[] = [];

  if (isNaN(currentPrice) || currentPrice <= 0) {
    console.warn('Invalid current price for pool:', pool);
    return points;
  }

  const priceRange = 0.1; // 10% range
  const numPoints = 10;

  for (let i = 0; i < numPoints; i++) {
    const price = currentPrice * (1 - priceRange/2 + (priceRange * i / (numPoints - 1)));
    const liquidityUSD = totalLiquidity / numPoints;
    if (!isNaN(price) && !isNaN(liquidityUSD) && price > 0 && liquidityUSD > 0) {
      points.push({ price, liquidityUSD });
    }
  }

  return points;
}