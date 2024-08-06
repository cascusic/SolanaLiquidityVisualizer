import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { initializeRaydium } from '../../utils/raydium';
import { fetchDetailedPoolData } from '../../utils/poolData';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface LiquidityPoint {
  price: number;
  liquidityUSD: number;
}

interface AggregatedPoolData {
  liquidityPoints: LiquidityPoint[];
  totalLiquidity: number;
}

const TokenLiquidityDepthPage: React.FC = () => {
  const router = useRouter();
  const { mint } = router.query;
  const [liquidityData, setLiquidityData] = useState<AggregatedPoolData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (mint && typeof mint === 'string') {
        try {
          setIsLoading(true);
          setError(null);
          await initializeRaydium();
          const data = await fetchDetailedPoolData(mint);
          setLiquidityData(data);
        } catch (err) {
          console.error('Error fetching data:', err);
          setError('Failed to fetch liquidity data. Please try again later.');
        } finally {
          setIsLoading(false);
        }
      }
    }
    fetchData();
  }, [mint]);

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!liquidityData || liquidityData.liquidityPoints.length === 0) {
    return <div className="p-4">No valid liquidity data available for this token.</div>;
  }

  const formatLargeNumber = (num: number) => {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(2);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Token Liquidity Depth: {mint}</h1>
      <p className="mb-4">Total Liquidity: ${formatLargeNumber(liquidityData.totalLiquidity)}</p>
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={liquidityData.liquidityPoints}>
          <XAxis
            dataKey="price"
            type="number"
            scale="log"
            domain={['auto', 'auto']}
            tickFormatter={(value) => value.toFixed(4)}
          />
          <YAxis
            dataKey="liquidityUSD"
            tickFormatter={(value) => '$' + formatLargeNumber(value)}
          />
          <Tooltip
            formatter={(value: number, name: string) => {
              if (name === 'liquidityUSD') return ['$' + formatLargeNumber(value), 'Liquidity'];
              return [value.toFixed(4), 'Price'];
            }}
          />
          <Area type="monotone" dataKey="liquidityUSD" stroke="#8884d8" fill="#8884d8" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TokenLiquidityDepthPage;