import { PrismaClient } from '@prisma/client';

// Mock PrismaClient to avoid actual database connections during tests
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    $connect: vi.fn().mockResolvedValue(undefined),
    $disconnect: vi.fn().mockResolvedValue(undefined),
    $transaction: vi.fn(),
    $executeRaw: vi.fn(),
    $queryRaw: vi.fn(),
    $on: vi.fn(),
    $use: vi.fn(),
    // Add other commonly used Prisma methods as needed
  })),
}));

describe('Prisma Configuration', () => {
  let prisma: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    // Clear module cache to ensure fresh imports
    vi.resetModules();
    // Import prisma after mocking
    const { default: prismaModule } = await import('./prisma');
    prisma = prismaModule;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Module Export', () => {
    it('should export a PrismaClient instance', () => {
      expect(prisma).toBeDefined();
      expect(prisma).toBeInstanceOf(PrismaClient);
    });

    it('should be a truthy value', () => {
      expect(prisma).toBeTruthy();
    });

    it('should not be null or undefined', () => {
      expect(prisma).not.toBeNull();
      expect(prisma).not.toBeUndefined();
    });

    it('should be exportable as default export', () => {
      // Test that the module can be imported as default
      expect(prisma).toBeDefined();
      expect(typeof prisma).toBe('object');
    });
  });

  describe('PrismaClient Instantiation', () => {
    it('should create PrismaClient with default configuration', () => {
      expect(PrismaClient).toHaveBeenCalled();
      expect(PrismaClient).toHaveBeenCalledWith();
    });

    it('should instantiate only once (singleton pattern)', () => {
      // Since we're testing the module import, PrismaClient should be called once
      expect(PrismaClient).toHaveBeenCalledTimes(1);
    });

    it('should have expected Prisma client methods available', () => {
      expect(typeof prisma.$connect).toBe('function');
      expect(typeof prisma.$disconnect).toBe('function');
      expect(typeof prisma.$transaction).toBe('function');
      expect(typeof prisma.$executeRaw).toBe('function');
      expect(typeof prisma.$queryRaw).toBe('function');
      expect(typeof prisma.$on).toBe('function');
      expect(typeof prisma.$use).toBe('function');
    });

    it('should not pass any configuration options by default', () => {
      expect(PrismaClient).toHaveBeenCalledWith();
    });
  });

  describe('Connection Methods', () => {
    it('should allow connecting to the database', async () => {
      const mockConnect = vi.spyOn(prisma, '$connect');
      
      await prisma.$connect();
      
      expect(mockConnect).toHaveBeenCalledTimes(1);
      expect(mockConnect).toHaveBeenCalledWith();
    });

    it('should allow disconnecting from the database', async () => {
      const mockDisconnect = vi.spyOn(prisma, '$disconnect');
      
      await prisma.$disconnect();
      
      expect(mockDisconnect).toHaveBeenCalledTimes(1);
      expect(mockDisconnect).toHaveBeenCalledWith();
    });

    it('should handle connection errors gracefully', async () => {
      const mockConnect = vi.spyOn(prisma, '$connect')
        .mockRejectedValueOnce(new Error('Connection failed'));
      
      await expect(prisma.$connect()).rejects.toThrow('Connection failed');
      expect(mockConnect).toHaveBeenCalledTimes(1);
    });

    it('should handle disconnection errors gracefully', async () => {
      const mockDisconnect = vi.spyOn(prisma, '$disconnect')
        .mockRejectedValueOnce(new Error('Disconnection failed'));
      
      await expect(prisma.$disconnect()).rejects.toThrow('Disconnection failed');
      expect(mockDisconnect).toHaveBeenCalledTimes(1);
    });

    it('should return promises for async operations', () => {
      const connectPromise = prisma.$connect();
      const disconnectPromise = prisma.$disconnect();
      
      expect(connectPromise).toBeInstanceOf(Promise);
      expect(disconnectPromise).toBeInstanceOf(Promise);
    });
  });

  describe('Transaction Support', () => {
    it('should support transactions with callback function', async () => {
      const mockTransaction = vi.spyOn(prisma, '$transaction');
      const mockCallback = vi.fn().mockResolvedValue('result');
      mockTransaction.mockResolvedValueOnce('transaction result');
      
      const result = await prisma.$transaction(mockCallback);
      
      expect(mockTransaction).toHaveBeenCalledWith(mockCallback);
      expect(result).toBe('transaction result');
    });

    it('should support array-based transactions', async () => {
      const mockTransaction = vi.spyOn(prisma, '$transaction');
      const queries = [
        Promise.resolve({ id: 1, name: 'test1' }),
        Promise.resolve({ id: 2, name: 'test2' })
      ];
      mockTransaction.mockResolvedValueOnce(['result1', 'result2']);
      
      const result = await prisma.$transaction(queries);
      
      expect(mockTransaction).toHaveBeenCalledWith(queries);
      expect(result).toEqual(['result1', 'result2']);
    });

    it('should handle transaction failures', async () => {
      const mockTransaction = vi.spyOn(prisma, '$transaction')
        .mockRejectedValueOnce(new Error('Transaction failed'));
      
      const mockCallback = vi.fn();
      
      await expect(prisma.$transaction(mockCallback)).rejects.toThrow('Transaction failed');
      expect(mockTransaction).toHaveBeenCalledWith(mockCallback);
    });

    it('should support transaction options', async () => {
      const mockTransaction = vi.spyOn(prisma, '$transaction');
      const mockCallback = vi.fn().mockResolvedValue('result');
      const options = { timeout: 5000, isolationLevel: 'ReadCommitted' as const };
      mockTransaction.mockResolvedValueOnce('result');
      
      await prisma.$transaction(mockCallback, options);
      
      expect(mockTransaction).toHaveBeenCalledWith(mockCallback, options);
    });

    it('should handle empty transaction arrays', async () => {
      const mockTransaction = vi.spyOn(prisma, '$transaction');
      mockTransaction.mockResolvedValueOnce([]);
      
      const result = await prisma.$transaction([]);
      
      expect(mockTransaction).toHaveBeenCalledWith([]);
      expect(result).toEqual([]);
    });
  });

  describe('Raw Query Support', () => {
    it('should support raw SQL execution', async () => {
      const mockExecuteRaw = vi.spyOn(prisma, '$executeRaw');
      mockExecuteRaw.mockResolvedValueOnce(1);
      
      const result = await prisma.$executeRaw`UPDATE users SET active = ${true}`;
      
      expect(mockExecuteRaw).toHaveBeenCalled();
      expect(result).toBe(1);
    });

    it('should support raw SQL queries', async () => {
      const mockQueryRaw = vi.spyOn(prisma, '$queryRaw');
      const mockResult = [{ id: 1, name: 'test' }];
      mockQueryRaw.mockResolvedValueOnce(mockResult);
      
      const result = await prisma.$queryRaw`SELECT * FROM users WHERE id = ${1}`;
      
      expect(mockQueryRaw).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });

    it('should handle raw query errors', async () => {
      const mockQueryRaw = vi.spyOn(prisma, '$queryRaw')
        .mockRejectedValueOnce(new Error('Query failed'));
      
      await expect(prisma.$queryRaw`SELECT * FROM invalid_table`).rejects.toThrow('Query failed');
      expect(mockQueryRaw).toHaveBeenCalled();
    });

    it('should handle parameterized queries safely', async () => {
      const mockQueryRaw = vi.spyOn(prisma, '$queryRaw');
      mockQueryRaw.mockResolvedValueOnce([{ id: 1, email: 'test@example.com' }]);
      
      const userId = 1;
      const result = await prisma.$queryRaw`SELECT * FROM users WHERE id = ${userId}`;
      
      expect(mockQueryRaw).toHaveBeenCalled();
      expect(result).toEqual([{ id: 1, email: 'test@example.com' }]);
    });

    it('should handle null and undefined parameters in raw queries', async () => {
      const mockQueryRaw = vi.spyOn(prisma, '$queryRaw');
      mockQueryRaw.mockResolvedValueOnce([]);
      
      const nullValue = null;
      const undefinedValue = undefined;
      
      await prisma.$queryRaw`SELECT * FROM users WHERE name = ${nullValue} OR email = ${undefinedValue}`;
      
      expect(mockQueryRaw).toHaveBeenCalled();
    });
  });

  describe('Event Handling and Middleware', () => {
    it('should support event listeners with $on', () => {
      const mockOn = vi.spyOn(prisma, '$on');
      const callback = vi.fn();
      
      prisma.$on('query', callback);
      
      expect(mockOn).toHaveBeenCalledWith('query', callback);
    });

    it('should support middleware with $use', () => {
      const mockUse = vi.spyOn(prisma, '$use');
      const middleware = vi.fn();
      
      prisma.$use(middleware);
      
      expect(mockUse).toHaveBeenCalledWith(middleware);
    });

    it('should handle multiple event listeners', () => {
      const mockOn = vi.spyOn(prisma, '$on');
      const queryCallback = vi.fn();
      const infoCallback = vi.fn();
      
      prisma.$on('query', queryCallback);
      prisma.$on('info', infoCallback);
      
      expect(mockOn).toHaveBeenCalledWith('query', queryCallback);
      expect(mockOn).toHaveBeenCalledWith('info', infoCallback);
      expect(mockOn).toHaveBeenCalledTimes(2);
    });

    it('should handle different event types', () => {
      const mockOn = vi.spyOn(prisma, '$on');
      
      prisma.$on('query', vi.fn());
      prisma.$on('info', vi.fn());
      prisma.$on('warn', vi.fn());
      prisma.$on('error', vi.fn());
      
      expect(mockOn).toHaveBeenCalledTimes(4);
    });
  });

  describe('Error Handling', () => {
    it('should handle unexpected method calls gracefully', () => {
      // Test that the client doesn't break with undefined methods
      expect(() => {
        // @ts-ignore - intentionally accessing potentially undefined method
        const undefinedMethod = prisma.someUndefinedMethod;
        expect(undefinedMethod).toBeUndefined();
      }).not.toThrow();
    });

    it('should maintain client state after errors', async () => {
      // Simulate an error and ensure the client is still functional
      const mockConnect = vi.spyOn(prisma, '$connect');
      mockConnect.mockRejectedValueOnce(new Error('Connection error'));
      mockConnect.mockResolvedValueOnce(undefined);
      
      // First call fails
      await expect(prisma.$connect()).rejects.toThrow('Connection error');
      
      // Second call should work
      await expect(prisma.$connect()).resolves.not.toThrow();
      
      expect(mockConnect).toHaveBeenCalledTimes(2);
    });

    it('should handle network timeout errors', async () => {
      const mockConnect = vi.spyOn(prisma, '$connect')
        .mockRejectedValueOnce(new Error('Network timeout'));
      
      await expect(prisma.$connect()).rejects.toThrow('Network timeout');
      expect(mockConnect).toHaveBeenCalledTimes(1);
    });

    it('should handle database connection pool exhaustion', async () => {
      const mockConnect = vi.spyOn(prisma, '$connect')
        .mockRejectedValueOnce(new Error('Connection pool exhausted'));
      
      await expect(prisma.$connect()).rejects.toThrow('Connection pool exhausted');
      expect(mockConnect).toHaveBeenCalledTimes(1);
    });

    it('should handle various database-specific errors', async () => {
      const mockQueryRaw = vi.spyOn(prisma, '$queryRaw');
      
      // Test different error types
      const errors = [
        new Error('Syntax error'),
        new Error('Table does not exist'),
        new Error('Permission denied'),
        new Error('Deadlock detected')
      ];
      
      for (const error of errors) {
        mockQueryRaw.mockRejectedValueOnce(error);
        await expect(prisma.$queryRaw`SELECT 1`).rejects.toThrow(error.message);
      }
      
      expect(mockQueryRaw).toHaveBeenCalledTimes(4);
    });
  });

  describe('Edge Cases and Stress Testing', () => {
    it('should handle multiple concurrent connection attempts', async () => {
      const mockConnect = vi.spyOn(prisma, '$connect');
      
      const promises = Array(5).fill(null).map(() => prisma.$connect());
      await Promise.all(promises);
      
      expect(mockConnect).toHaveBeenCalledTimes(5);
    });

    it('should handle multiple concurrent disconnection attempts', async () => {
      const mockDisconnect = vi.spyOn(prisma, '$disconnect');
      
      const promises = Array(3).fill(null).map(() => prisma.$disconnect());
      await Promise.all(promises);
      
      expect(mockDisconnect).toHaveBeenCalledTimes(3);
    });

    it('should maintain consistency across async operations', async () => {
      const mockConnect = vi.spyOn(prisma, '$connect');
      const mockDisconnect = vi.spyOn(prisma, '$disconnect');
      const mockTransaction = vi.spyOn(prisma, '$transaction')
        .mockResolvedValue('transaction result');
      
      await prisma.$connect();
      const result = await prisma.$transaction(vi.fn().mockResolvedValue('test'));
      await prisma.$disconnect();
      
      expect(mockConnect).toHaveBeenCalledTimes(1);
      expect(mockTransaction).toHaveBeenCalledTimes(1);
      expect(mockDisconnect).toHaveBeenCalledTimes(1);
      expect(result).toBe('transaction result');
    });

    it('should handle rapid successive method calls', async () => {
      const mockConnect = vi.spyOn(prisma, '$connect');
      
      // Simulate rapid calls
      const rapidCalls = Array(10).fill(null).map((_, i) => 
        prisma.$connect().catch(() => `Error ${i}`)
      );
      
      const results = await Promise.allSettled(rapidCalls);
      
      expect(mockConnect).toHaveBeenCalledTimes(10);
      expect(results.length).toBe(10);
    });

    it('should handle large transaction arrays efficiently', async () => {
      const mockTransaction = vi.spyOn(prisma, '$transaction');
      const largeArray = Array(100).fill(Promise.resolve({ id: 1 }));
      mockTransaction.mockResolvedValueOnce(Array(100).fill({ id: 1 }));
      
      const result = await prisma.$transaction(largeArray);
      
      expect(mockTransaction).toHaveBeenCalledWith(largeArray);
      expect(result).toHaveLength(100);
    });

    it('should not accumulate memory leaks with repeated operations', () => {
      // Test that prisma instance doesn't accumulate unnecessary state
      const initialProps = Object.keys(prisma).length;
      
      // Perform multiple operations
      for (let i = 0; i < 5; i++) {
        prisma.$connect();
        prisma.$disconnect();
      }
      
      const finalProps = Object.keys(prisma).length;
      expect(finalProps).toBe(initialProps);
    });
  });

  describe('Type Safety and TypeScript Integration', () => {
    it('should maintain proper TypeScript types', () => {
      // Verify the exported instance has the expected type
      expect(prisma).toBeInstanceOf(PrismaClient);
      
      // Verify method signatures exist (compile-time check)
      const connectPromise: Promise<void> = prisma.$connect();
      const disconnectPromise: Promise<void> = prisma.$disconnect();
      
      expect(connectPromise).toBeInstanceOf(Promise);
      expect(disconnectPromise).toBeInstanceOf(Promise);
    });

    it('should support method chaining where applicable', () => {
      // Test that methods can be called in sequence without breaking
      expect(() => {
        prisma.$connect();
        prisma.$disconnect();
      }).not.toThrow();
    });

    it('should handle template literal types for raw queries', () => {
      const mockQueryRaw = vi.spyOn(prisma, '$queryRaw');
      mockQueryRaw.mockResolvedValueOnce([]);
      
      // This should compile without type errors
      expect(() => {
        prisma.$queryRaw`SELECT * FROM users`;
        prisma.$executeRaw`UPDATE users SET active = ${true}`;
      }).not.toThrow();
    });

    it('should maintain type safety with different parameter types', async () => {
      const mockQueryRaw = vi.spyOn(prisma, '$queryRaw');
      mockQueryRaw.mockResolvedValueOnce([]);
      
      // Test with various parameter types
      const stringParam = 'test';
      const numberParam = 42;
      const booleanParam = true;
      const dateParam = new Date();
      
      await prisma.$queryRaw`SELECT * FROM users WHERE 
        name = ${stringParam} AND 
        age = ${numberParam} AND 
        active = ${booleanParam} AND 
        created_at > ${dateParam}`;
      
      expect(mockQueryRaw).toHaveBeenCalled();
    });
  });

  describe('Module Singleton and Import Behavior', () => {
    it('should maintain singleton behavior across imports', async () => {
      const { default: prisma1 } = await import('./prisma');
      const { default: prisma2 } = await import('./prisma');
      
      // Both imports should reference the same instance
      expect(prisma1).toBe(prisma2);
    });

    it('should preserve configuration across multiple imports', async () => {
      // Test that the same PrismaClient instance is used
      const { default: firstImport } = await import('./prisma');
      const { default: secondImport } = await import('./prisma');
      
      expect(firstImport).toBe(secondImport);
      expect(PrismaClient).toHaveBeenCalledTimes(1); // Should only be instantiated once
    });

    it('should handle module re-evaluation correctly', async () => {
      // Clear the module cache
      vi.resetModules();
      
      // Import again should create a new instance
      const { default: newPrisma } = await import('./prisma');
      
      expect(newPrisma).toBeDefined();
      expect(newPrisma).toBeInstanceOf(PrismaClient);
    });
  });

  describe('Integration and Real-World Usage Scenarios', () => {
    it('should handle typical CRUD operation sequence', async () => {
      const mockConnect = vi.spyOn(prisma, '$connect');
      const mockTransaction = vi.spyOn(prisma, '$transaction');
      const mockDisconnect = vi.spyOn(prisma, '$disconnect');
      
      mockTransaction.mockResolvedValueOnce([
        { id: 1, name: 'Created' },
        { id: 1, name: 'Updated' },
        { id: 1, name: 'Retrieved' }
      ]);
      
      // Simulate typical application flow
      await prisma.$connect();
      const results = await prisma.$transaction([
        Promise.resolve({ id: 1, name: 'Created' }),
        Promise.resolve({ id: 1, name: 'Updated' }),
        Promise.resolve({ id: 1, name: 'Retrieved' })
      ]);
      await prisma.$disconnect();
      
      expect(mockConnect).toHaveBeenCalledTimes(1);
      expect(mockTransaction).toHaveBeenCalledTimes(1);
      expect(mockDisconnect).toHaveBeenCalledTimes(1);
      expect(results).toHaveLength(3);
    });

    it('should handle mixed query types in sequence', async () => {
      const mockQueryRaw = vi.spyOn(prisma, '$queryRaw');
      const mockExecuteRaw = vi.spyOn(prisma, '$executeRaw');
      const mockTransaction = vi.spyOn(prisma, '$transaction');
      
      mockQueryRaw.mockResolvedValueOnce([{ count: 5 }]);
      mockExecuteRaw.mockResolvedValueOnce(3);
      mockTransaction.mockResolvedValueOnce('success');
      
      // Mixed operations simulating a complex workflow
      const count = await prisma.$queryRaw`SELECT COUNT(*) as count FROM users`;
      const updated = await prisma.$executeRaw`UPDATE users SET active = ${true}`;
      const txResult = await prisma.$transaction(vi.fn());
      
      expect(mockQueryRaw).toHaveBeenCalledTimes(1);
      expect(mockExecuteRaw).toHaveBeenCalledTimes(1);
      expect(mockTransaction).toHaveBeenCalledTimes(1);
      expect(count).toEqual([{ count: 5 }]);
      expect(updated).toBe(3);
      expect(txResult).toBe('success');
    });

    it('should support application startup/shutdown lifecycle', async () => {
      const mockConnect = vi.spyOn(prisma, '$connect');
      const mockDisconnect = vi.spyOn(prisma, '$disconnect');
      
      // Simulate application startup
      await prisma.$connect();
      expect(mockConnect).toHaveBeenCalledTimes(1);
      
      // Simulate some operations
      await prisma.$queryRaw`SELECT 1`;
      
      // Simulate graceful shutdown
      await prisma.$disconnect();
      expect(mockDisconnect).toHaveBeenCalledTimes(1);
    });

    it('should handle connection recovery scenarios', async () => {
      const mockConnect = vi.spyOn(prisma, '$connect');
      
      // Simulate connection failure and recovery
      mockConnect
        .mockRejectedValueOnce(new Error('Initial connection failed'))
        .mockRejectedValueOnce(new Error('Second attempt failed'))
        .mockResolvedValueOnce(undefined); // Third attempt succeeds
      
      // First attempt fails
      await expect(prisma.$connect()).rejects.toThrow('Initial connection failed');
      
      // Second attempt fails
      await expect(prisma.$connect()).rejects.toThrow('Second attempt failed');
      
      // Third attempt succeeds
      await expect(prisma.$connect()).resolves.not.toThrow();
      
      expect(mockConnect).toHaveBeenCalledTimes(3);
    });
  });
});