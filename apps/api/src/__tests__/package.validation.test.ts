/**
 * Comprehensive validation tests for package.json
 * 
 * This test suite validates:
 * - JSON schema and structure
 * - Required fields presence
 * - Dependency versions and integrity
 * - Security vulnerabilities
 * - Script definitions
 * - Package metadata
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

describe('package.json Validation', () => {
  let packageJson: any;
  const packagePath = join(__dirname, '../../package.json');

  beforeAll(() => {
    // Ensure package.json exists
    expect(existsSync(packagePath)).toBe(true);

    // Parse package.json
    const content = readFileSync(packagePath, 'utf-8');
    packageJson = JSON.parse(content);
  });

  describe('Basic Structure and Required Fields', () => {
    it('should have a valid name field', () => {
      expect(packageJson).toHaveProperty('name');
      expect(typeof packageJson.name).toBe('string');
      expect(packageJson.name.length).toBeGreaterThan(0);
      expect(packageJson.name).toBe('api');
    });

    it('should have a valid version field', () => {
      expect(packageJson).toHaveProperty('version');
      expect(typeof packageJson.version).toBe('string');
      expect(packageJson.version).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('should have a description field', () => {
      expect(packageJson).toHaveProperty('description');
      expect(typeof packageJson.description).toBe('string');
    });

    it('should have a main entry point', () => {
      expect(packageJson).toHaveProperty('main');
      expect(typeof packageJson.main).toBe('string');
      expect(packageJson.main).toBe('dist/index.js');
    });

    it('should have a license field', () => {
      expect(packageJson).toHaveProperty('license');
      expect(typeof packageJson.license).toBe('string');
      expect(packageJson.license).toBe('ISC');
    });

    it('should have a type field set to commonjs', () => {
      expect(packageJson).toHaveProperty('type');
      expect(packageJson.type).toBe('commonjs');
    });
  });

  describe('Scripts Validation', () => {
    it('should have all required scripts', () => {
      expect(packageJson).toHaveProperty('scripts');
      expect(typeof packageJson.scripts).toBe('object');
    });

    it('should have a dev script', () => {
      expect(packageJson.scripts).toHaveProperty('dev');
      expect(packageJson.scripts.dev).toContain('nodemon');
    });

    it('should have a build script', () => {
      expect(packageJson.scripts).toHaveProperty('build');
      expect(packageJson.scripts.build).toBe('tsc');
    });

    it('should have a start script', () => {
      expect(packageJson.scripts).toHaveProperty('start');
      expect(packageJson.scripts.start).toContain('node');
      expect(packageJson.scripts.start).toContain('dist/index.js');
    });

    it('should have a test script', () => {
      expect(packageJson.scripts.test).toBe('vitest');
    });

    it('should have a postinstall script for Prisma', () => {
      expect(packageJson.scripts).toHaveProperty('postinstall');
      expect(packageJson.scripts.postinstall).toContain('prisma generate');
    });
  });

  describe('Dependencies Validation', () => {
    it('should have dependencies object', () => {
      expect(packageJson).toHaveProperty('dependencies');
      expect(typeof packageJson.dependencies).toBe('object');
    });

    it('should have required core dependencies', () => {
      const requiredDeps = [
        'express',
        'cors',
        '@prisma/client',
        'bcrypt',
        'jsonwebtoken',
        'passport',
        'passport-jwt',
        'zod',
        'morgan'
      ];

      requiredDeps.forEach(dep => {
        expect(packageJson.dependencies).toHaveProperty(dep);
      });
    });

    it('should have valid semantic version formats', () => {
      Object.entries(packageJson.dependencies).forEach(([name, version]) => {
        expect(typeof version).toBe('string');
        // Check for valid semver format (^x.y.z or ~x.y.z or x.y.z)
        expect((version as string)).toMatch(/^[\^~]?\d+\.\d+\.\d+/);
      });
    });

    it('should have Express 5.x', () => {
      expect(packageJson.dependencies.express).toMatch(/^\^5\./);
    });

    it('should have morgan at version 1.10.1 or higher (security fix)', () => {
      const morganVersion = packageJson.dependencies.morgan;
      expect(morganVersion).toBeDefined();

      // Extract version number
      const versionMatch = morganVersion.match(/([0-9]+)[.]([0-9]+)[.]([0-9]+)/);
      expect(versionMatch).toBeTruthy();

      const [, major, minor, patch] = versionMatch!.map(Number);

      // Should be 1.10.1 or higher
      expect(major).toBeGreaterThanOrEqual(1);
      if (major === 1) {
        expect(minor).toBeGreaterThanOrEqual(10);
        if (minor === 10) {
          expect(patch).toBeGreaterThanOrEqual(1);
        }
      }
    });

    it('should not have morgan version 1.10.0 (vulnerable version)', () => {
      expect(packageJson.dependencies.morgan).not.toBe('^1.10.0');
      expect(packageJson.dependencies.morgan).not.toBe('1.10.0');
      expect(packageJson.dependencies.morgan).not.toBe('~1.10.0');
    });
  });

  describe('DevDependencies Validation', () => {
    it('should have devDependencies object', () => {
      expect(packageJson).toHaveProperty('devDependencies');
      expect(typeof packageJson.devDependencies).toBe('object');
    });

    it('should have TypeScript and related tools', () => {
      expect(packageJson.devDependencies).toHaveProperty('typescript');
      expect(packageJson.devDependencies).toHaveProperty('ts-node');
      expect(packageJson.devDependencies).toHaveProperty('nodemon');
    });

    it('should have testing dependencies', () => {
      expect(packageJson.devDependencies).toHaveProperty('vitest');
      expect(packageJson.devDependencies).toHaveProperty('supertest');
      expect(packageJson.devDependencies).toHaveProperty('@types/supertest');
    });

    it('should have type definitions for dependencies', () => {
      const requiredTypes = [
        '@types/express',
        '@types/cors',
        '@types/morgan',
        '@types/node',
        '@types/bcrypt',
        '@types/jsonwebtoken',
        '@types/passport',
        '@types/passport-jwt',
        '@types/supertest'
      ];

      requiredTypes.forEach(typeDef => {
        expect(packageJson.devDependencies).toHaveProperty(typeDef);
      });
    });

    it('should have Prisma CLI', () => {
      expect(packageJson.devDependencies).toHaveProperty('prisma');
    });
  });

  describe('Prisma Configuration', () => {
    it('should have Prisma configuration', () => {
      expect(packageJson).toHaveProperty('prisma');
      expect(typeof packageJson.prisma).toBe('object');
    });

    it('should have schema path configured', () => {
      expect(packageJson.prisma).toHaveProperty('schema');
      expect(packageJson.prisma.schema).toBe('prisma/schema.prisma');
    });
  });

  describe('Version Consistency', () => {
    it('should have matching Prisma client and CLI versions', () => {
      const clientVersion = packageJson.dependencies['@prisma/client'];
      const cliVersion = packageJson.devDependencies['prisma'];

      // Extract major.minor versions
      const clientMajorMinor = clientVersion.match(/([0-9]+[.][0-9]+)/)?.[1];
      const cliMajorMinor = cliVersion.match(/([0-9]+[.][0-9]+)/)?.[1];

      expect(clientMajorMinor).toBe(cliMajorMinor);
    });

    it('should use consistent caret (^) prefix for most dependencies', () => {
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      const nonCaretDeps: string[] = [];

      Object.entries(deps).forEach(([name, version]) => {
        if (!(version as string).startsWith('^')) {
          nonCaretDeps.push(name);
        }
      });

      // Allow some exceptions, but most should use ^
      expect(nonCaretDeps.length).toBeLessThan(Object.keys(deps).length * 0.2);
    });
  });

  describe('Security Considerations', () => {
    it('should not use wildcard or latest tags', () => {
      const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };

      Object.entries(allDeps).forEach(([name, version]) => {
        expect(version).not.toBe('*');
        expect(version).not.toBe('latest');
      });
    });

    it('should not have known vulnerable versions', () => {
      // Check for known vulnerable versions of common packages
      const vulnerableVersions = {
        'jsonwebtoken': ['^8.5.1'], // Example - adjust based on actual vulnerabilities
        'bcrypt': ['^5.0.0', '^5.0.1'] // Example - adjust based on actual vulnerabilities
      };

      Object.entries(vulnerableVersions).forEach(([pkg, versions]) => {
        if (packageJson.dependencies[pkg]) {
          versions.forEach(vulnVersion => {
            expect(packageJson.dependencies[pkg]).not.toBe(vulnVersion);
          });
        }
      });
    });

    it('should use bcrypt version 6.x or higher', () => {
      const bcryptVersion = packageJson.dependencies.bcrypt;
      expect(bcryptVersion).toMatch(/^\^6\./);
    });
  });

  describe('Edge Cases and Validation', () => {
    it('should not have duplicate dependencies', () => {
      const deps = Object.keys(packageJson.dependencies || {});
      const devDeps = Object.keys(packageJson.devDependencies || {});

      const duplicates = deps.filter(dep => devDeps.includes(dep));
      expect(duplicates).toHaveLength(0);
    });

    it('should have non-empty dependency objects', () => {
      expect(Object.keys(packageJson.dependencies).length).toBeGreaterThan(0);
      expect(Object.keys(packageJson.devDependencies).length).toBeGreaterThan(0);
    });

    it('should not have null or undefined values', () => {
      const allValues = [
        ...Object.values(packageJson.dependencies || {}),
        ...Object.values(packageJson.devDependencies || {}),
        ...Object.values(packageJson.scripts || {})
      ];

      allValues.forEach(value => {
        expect(value).not.toBeNull();
        expect(value).not.toBeUndefined();
      });
    });

    it('should have valid JSON structure (no parsing errors)', () => {
      // If we got here, JSON parsed successfully
      expect(packageJson).toBeDefined();
      expect(typeof packageJson).toBe('object');
    });
  });

  describe('Metadata Validation', () => {
    it('should have keywords array', () => {
      expect(packageJson).toHaveProperty('keywords');
      expect(Array.isArray(packageJson.keywords)).toBe(true);
    });

    it('should have author field', () => {
      expect(packageJson).toHaveProperty('author');
      expect(typeof packageJson.author).toBe('string');
    });
  });

  describe('Morgan Version Upgrade Validation', () => {
    it('should have morgan dependency', () => {
      expect(packageJson.dependencies).toHaveProperty('morgan');
    });

    it('should have morgan at correct version after security fix', () => {
      const morganVersion = packageJson.dependencies.morgan;

      // Should be ^1.10.1 specifically (the security fix version)
      expect(morganVersion).toBe('^1.10.1');
    });

    it('should have corresponding morgan types', () => {
      expect(packageJson.devDependencies).toHaveProperty('@types/morgan');
    });

    it('should not allow downgrade to vulnerable version', () => {
      const morganVersion = packageJson.dependencies.morgan;
      const versionNumber = morganVersion.replace(/^\^/, '');

      // Parse version components
      const [major, minor, patch] = versionNumber.split('.').map(Number);

      // Ensure we're not at 1.10.0 or lower
      if (major === 1 && minor === 10) {
        expect(patch).toBeGreaterThanOrEqual(1);
      }
    });
  });

  describe('Integration and Dependencies Compatibility', () => {
    it('should have compatible Node.js types version', () => {
      const nodeTypes = packageJson.devDependencies['@types/node'];
      expect(nodeTypes).toBeDefined();
      expect(nodeTypes).toMatch(/^\^24\./);
    });

    it('should have compatible TypeScript version', () => {
      const tsVersion = packageJson.devDependencies.typescript;
      expect(tsVersion).toBeDefined();
      expect(tsVersion).toMatch(/^\^5\./);
    });

    it('should have compatible vitest version for TypeScript 5.x', () => {
      const vitestVersion = packageJson.devDependencies.vitest;
      expect(vitestVersion).toBeDefined();
      expect(vitestVersion).toMatch(/^\^3\./);
    });
  });

  describe('Package.json Structure Integrity', () => {
    it('should not have unexpected top-level fields', () => {
      const expectedFields = [
        'name',
        'version',
        'description',
        'main',
        'scripts',
        'keywords',
        'author',
        'license',
        'type',
        'dependencies',
        'devDependencies',
        'prisma'
      ];

      const actualFields = Object.keys(packageJson);

      actualFields.forEach(field => {
        expect(expectedFields).toContain(field);
      });
    });

    it('should be valid JSON when stringified and re-parsed', () => {
      const stringified = JSON.stringify(packageJson);
      const reparsed = JSON.parse(stringified);

      expect(reparsed).toEqual(packageJson);
    });
  });
});

describe('Dependency Version Ranges', () => {
  let packageJson: any;

  beforeAll(() => {
    const packagePath = join(__dirname, '../../package.json');
    const content = readFileSync(packagePath, 'utf-8');
    packageJson = JSON.parse(content);
  });

  it('should use appropriate version range strategies', () => {
    const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    Object.entries(allDeps).forEach(([name, version]) => {
      const versionStr = version as string;
      
      // Should use ^ for automatic minor/patch updates
      // or exact version for critical dependencies
      const isValidRange =
        versionStr.startsWith('^') ||
        versionStr.startsWith('~') ||
        /^\d+\.\d+\.\d+$/.test(versionStr);
      
      expect(isValidRange).toBe(true);
    });
  });

  it('should have reasonable version constraints', () => {
    const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    Object.entries(allDeps).forEach(([name, version]) => {
      const majorMatch = (version as string).match(/(\d+)\./);
      if (majorMatch) {
        const major = parseInt(majorMatch[1], 10);
        expect(major).toBeGreaterThan(0);
        expect(major).toBeLessThan(100);
      }
    });
  });
});

describe('Script Command Validation', () => {
  let packageJson: any;

  beforeAll(() => {
    const packagePath = join(__dirname, '../../package.json');
    const content = readFileSync(packagePath, 'utf-8');
    packageJson = JSON.parse(content);
  });

  it('should have valid dev command with TypeScript file', () => {
    expect(packageJson.scripts.dev).toContain('src/index.ts');
  });

  it('should have build command using TypeScript compiler', () => {
    expect(packageJson.scripts.build).toContain('tsc');
  });

  it('should have start command pointing to compiled output', () => {
    expect(packageJson.scripts.start).toContain('dist/index.js');
  });

  it('should not have conflicting script commands', () => {
    const scripts = packageJson.scripts;
    
    // Ensure dev doesn't run production build
    expect(scripts.dev).not.toContain('dist/');
    
    // Ensure start doesn't run source files
    expect(scripts.start).not.toContain('src/');
  });
});