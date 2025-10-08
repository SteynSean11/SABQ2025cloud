import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('package.json validation', () => {
  let packageJson: any;
  let rawContent: string;

  beforeAll(() => {
    const packagePath = join(__dirname, '../package.json');
    rawContent = readFileSync(packagePath, 'utf-8');
    packageJson = JSON.parse(rawContent);
  });

  describe('JSON structure', () => {
    it('should be valid JSON', () => {
      expect(() => JSON.parse(rawContent)).not.toThrow();
    });

    it('should parse into an object', () => {
      expect(typeof packageJson).toBe('object');
      expect(packageJson).not.toBeNull();
      expect(Array.isArray(packageJson)).toBe(false);
    });
  });

  describe('required fields', () => {
    it('should have a name field', () => {
      expect(packageJson.name).toBeDefined();
      expect(typeof packageJson.name).toBe('string');
      expect(packageJson.name).toBe('api');
    });

    it('should have a version field with valid semver', () => {
      expect(packageJson.version).toBeDefined();
      const semverRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/;
      expect(semverRegex.test(packageJson.version)).toBe(true);
    });

    it('should have required configuration fields', () => {
      expect(packageJson.main).toBe('dist/index.js');
      expect(packageJson.scripts).toBeDefined();
      expect(packageJson.dependencies).toBeDefined();
      expect(packageJson.devDependencies).toBeDefined();
    });
  });

  describe('scripts configuration', () => {
    it('should have all required scripts', () => {
      expect(packageJson.scripts.dev).toContain('nodemon');
      expect(packageJson.scripts.build).toBe('tsc');
      expect(packageJson.scripts.start).toContain('node dist/index.js');
      expect(packageJson.scripts.test).toBe('vitest');
      expect(packageJson.scripts.postinstall).toContain('prisma generate');
    });
  });

  describe('dependencies', () => {
    it('should have all critical production dependencies', () => {
      const criticalDeps = ['express', 'cors', '@prisma/client', 'bcrypt', 'jsonwebtoken', 'passport', 'passport-jwt', 'zod', 'morgan'];
      criticalDeps.forEach(dep => {
        expect(packageJson.dependencies[dep]).toBeDefined();
      });
    });

    it('should have morgan with security fix version', () => {
      expect(packageJson.dependencies.morgan).toBe('^1.10.1');
    });

    it('should not have vulnerable morgan version', () => {
      expect(packageJson.dependencies.morgan).not.toBe('^1.10.0');
      expect(packageJson.dependencies.morgan).not.toBe('1.10.0');
    });

    it('should have valid semver ranges', () => {
      Object.entries(packageJson.dependencies).forEach(([name, version]) => {
        const semverRangeRegex = /^[\^~]?\d+\.\d+\.\d+/;
        expect(semverRangeRegex.test(version as string)).toBe(true);
      });
    });

    it('should have express version 5+', () => {
      expect(packageJson.dependencies.express).toMatch(/^\^?5\./);
    });
  });

  describe('devDependencies', () => {
    it('should have all critical development dependencies', () => {
      const criticalDevDeps = ['typescript', 'vitest', '@types/node', '@types/express', 'nodemon', 'ts-node', 'prisma', 'supertest'];
      criticalDevDeps.forEach(dep => {
        expect(packageJson.devDependencies[dep]).toBeDefined();
      });
    });

    it('should have type definitions for typed dependencies', () => {
      expect(packageJson.devDependencies['@types/morgan']).toBeDefined();
      expect(packageJson.devDependencies['@types/express']).toBeDefined();
      expect(packageJson.devDependencies['@types/cors']).toBeDefined();
    });
  });

  describe('Prisma configuration', () => {
    it('should have Prisma section with schema path', () => {
      expect(packageJson.prisma).toBeDefined();
      expect(packageJson.prisma.schema).toBe('prisma/schema.prisma');
    });

    it('should have matching prisma versions', () => {
      const clientVersion = packageJson.dependencies['@prisma/client'];
      const prismaVersion = packageJson.devDependencies.prisma;
      expect(clientVersion).toBe(prismaVersion);
    });
  });

  describe('security and best practices', () => {
    it('should not contain tokens or secrets', () => {
      expect(rawContent).not.toMatch(/npm_[a-zA-Z0-9]{36}/);
      expect(rawContent).not.toMatch(/authToken/);
    });

    it('should not have wildcard versions', () => {
      const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      Object.values(allDeps).forEach((version: any) => {
        expect(version).not.toBe('*');
        expect(version).not.toBe('latest');
      });
    });

    it('should not have git URLs in dependencies', () => {
      const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      Object.values(allDeps).forEach((version: any) => {
        expect(version).not.toMatch(/^git\+/);
      });
    });
  });

  describe('morgan-specific security validation', () => {
    it('should have morgan version >= 1.10.1', () => {
      const morganVersion = packageJson.dependencies.morgan;
      const versionNumber = morganVersion.replace('^', '');
      const [major, minor, patch] = versionNumber.split('.').map(Number);
      
      expect(major).toBeGreaterThanOrEqual(1);
      if (major === 1 && minor === 10) {
        expect(patch).toBeGreaterThanOrEqual(1);
      }
    });

    it('should not have known vulnerable morgan versions', () => {
      const vulnerableVersions = ['1.10.0', '^1.10.0', '~1.10.0'];
      expect(vulnerableVersions.includes(packageJson.dependencies.morgan)).toBe(false);
    });

    it('should have morgan compatible with Express 5', () => {
      expect(packageJson.dependencies.express).toMatch(/^\^?5\./);
      expect(packageJson.dependencies.morgan).toMatch(/^\^?1\.10\.[1-9]/);
    });
  });

  describe('dependency structure validation', () => {
    it('should have all authentication dependencies', () => {
      ['bcrypt', 'jsonwebtoken', 'passport', 'passport-jwt'].forEach(dep => {
        expect(packageJson.dependencies[dep]).toBeDefined();
      });
    });

    it('should have all middleware dependencies', () => {
      ['cors', 'morgan', 'express'].forEach(dep => {
        expect(packageJson.dependencies[dep]).toBeDefined();
      });
    });

    it('should not have duplicate dependencies', () => {
      const prodDeps = Object.keys(packageJson.dependencies);
      const devDeps = Object.keys(packageJson.devDependencies);
      const overlap = prodDeps.filter(name => devDeps.includes(name));
      expect(overlap).toEqual([]);
    });

    it('should have reasonable number of dependencies', () => {
      expect(Object.keys(packageJson.dependencies).length).toBeGreaterThan(0);
      expect(Object.keys(packageJson.dependencies).length).toBeLessThan(100);
    });
  });

  describe('version format validation', () => {
    it('should have consistent version prefixes', () => {
      const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      Object.values(allDeps).forEach((version: any) => {
        expect(version.startsWith('^') || /^\d+\.\d+\.\d+$/.test(version)).toBe(true);
      });
    });

    it('should not have pre-release versions in prod dependencies', () => {
      Object.values(packageJson.dependencies).forEach((version: any) => {
        expect(version).not.toMatch(/-alpha|-beta|-rc/);
      });
    });
  });

  describe('edge cases', () => {
    it('should not have circular references', () => {
      expect(() => JSON.stringify(packageJson)).not.toThrow();
    });

    it('should have proper JSON formatting', () => {
      expect(rawContent.endsWith('\n')).toBe(true);
      expect(rawContent).not.toMatch(/,\s*[}\]]/);
    });

    it('should have module type set to commonjs', () => {
      expect(packageJson.type).toBe('commonjs');
    });
  });
});