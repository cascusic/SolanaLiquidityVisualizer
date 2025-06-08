import { fetchDetailedPoolData } from '../src/utils/poolData';
import { getRaydiumInstance } from '../src/utils/raydium';

jest.mock('../src/utils/raydium');

const mockedGetRaydiumInstance = getRaydiumInstance as jest.MockedFunction<typeof getRaydiumInstance>;

describe('fetchDetailedPoolData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('aggregates liquidity data correctly', async () => {
    const mockApiResponse = {
      data: [
        { tvl: '100', price: '2', type: 'Standard' },
        { tvl: '50', price: '2', type: 'Standard' },
        { tvl: '75', price: '3', type: 'Concentrated' },
      ],
    };
    mockedGetRaydiumInstance.mockReturnValue({
      api: { fetchPoolByMints: jest.fn().mockResolvedValue(mockApiResponse) },
    } as any);

    const result = await fetchDetailedPoolData('TOKEN');

    expect(result.totalLiquidity).toBeCloseTo(225);
    expect(result.liquidityPoints.length).toBe(12);

    const price2 = result.liquidityPoints.find(p => p.price === 2);
    const price3 = result.liquidityPoints.find(p => p.price === 3);
    expect(price2?.liquidityUSD).toBeCloseTo(150);
    expect(price3?.liquidityUSD).toBeCloseTo(75);
  });

  it('handles unexpected API structure', async () => {
    mockedGetRaydiumInstance.mockReturnValue({
      api: { fetchPoolByMints: jest.fn().mockResolvedValue({ notData: [] }) },
    } as any);

    const result = await fetchDetailedPoolData('TOKEN');
    expect(result).toEqual({ liquidityPoints: [], totalLiquidity: 0 });
  });

  it('throws when API call fails', async () => {
    const error = new Error('Network');
    mockedGetRaydiumInstance.mockReturnValue({
      api: { fetchPoolByMints: jest.fn().mockRejectedValue(error) },
    } as any);

    await expect(fetchDetailedPoolData('TOKEN')).rejects.toThrow('Network');
  });
});
