import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const prismaMock = {
  user: {
    findUnique: vi.fn(),
  },
};

const passportUse = vi.fn();
const passportInitialize = vi.fn();

// Mock prisma client so we never touch a real DB
vi.mock('@prisma/client', () => {
  class PrismaClientMock {
    user = prismaMock.user;
  }
  return { PrismaClient: PrismaClientMock as any };
});

// Mock passport to capture use() registration
vi.mock('passport', () => {
  return {
    default: {
      use: passportUse,
      initialize: passportInitialize,
    },
  };
});

// Capture Strategy constructor calls and the provided verify callback
const strategyCtor = vi.fn().mockImplementation((opts: any, verify: any) => {
  return { name: 'jwt', opts, verify };
});
const fromAuthHeaderAsBearerToken = vi.fn(() => 'AUTH_HEADER_EXTRACTOR');

// Mock passport-jwt Strategy and ExtractJwt
vi.mock('passport-jwt', () => {
  return {
    Strategy: strategyCtor,
    ExtractJwt: { fromAuthHeaderAsBearerToken },
  };
});

describe('passport.config', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.JWT_SECRET;
    prismaMock.user.findUnique.mockReset();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it('throws if JWT_SECRET is not defined (import-time check)', () => {
    expect(() =>
      vi.isolateModules(() => {
        // Importing should throw immediately
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        require('../passport.config');
      })
    ).toThrow('JWT_SECRET must be defined in the environment variables.');
  });

  it('registers JwtStrategy with passport when JWT_SECRET is set', () => {
    process.env.JWT_SECRET = 'test-secret';

    vi.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('../passport.config');
    });

    // passport.use is called once with a Strategy instance
    expect(passportUse).toHaveBeenCalledTimes(1);
    expect(strategyCtor).toHaveBeenCalledTimes(1);

    // Validate Strategy options were constructed correctly
    const opts = strategyCtor.mock.calls[0][0];
    expect(fromAuthHeaderAsBearerToken).toHaveBeenCalled();
    expect(opts.jwtFromRequest).toBe('AUTH_HEADER_EXTRACTOR');
    expect(opts.secretOrKey).toBe('test-secret');
  });

  it('verify callback passes user to done when found', async () => {
    process.env.JWT_SECRET = 'test-secret';
    prismaMock.user.findUnique.mockResolvedValueOnce({ id: 'u1', email: 'e@example.com' });

    vi.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('../passport.config');
    });

    const instance = strategyCtor.mock.results[0].value as { verify: Function };
    const done = vi.fn();

    await instance.verify({ id: 'u1' }, done);
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { id: 'u1' } });
    expect(done).toHaveBeenCalledWith(null, { id: 'u1', email: 'e@example.com' });
  });

  it('verify callback passes false when user not found', async () => {
    process.env.JWT_SECRET = 'test-secret';
    prismaMock.user.findUnique.mockResolvedValueOnce(null);

    vi.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('../passport.config');
    });

    const instance = strategyCtor.mock.results[0].value as { verify: Function };
    const done = vi.fn();

    await instance.verify({ id: 'missing' }, done);
    expect(done).toHaveBeenCalledWith(null, false);
  });

  it('verify callback passes error when prisma throws', async () => {
    process.env.JWT_SECRET = 'test-secret';
    const err = new Error('DB down');
    prismaMock.user.findUnique.mockRejectedValueOnce(err);

    vi.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('../passport.config');
    });

    const instance = strategyCtor.mock.results[0].value as { verify: Function };
    const done = vi.fn();

    await instance.verify({ id: 'u1' }, done);
    expect(done).toHaveBeenCalledWith(err, false);
  });
});