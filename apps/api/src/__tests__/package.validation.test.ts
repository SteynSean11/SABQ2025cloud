import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Package.json Validation', () => {
  let packageJson: any;

  beforeEach(() => {
    const packagePath = path.join(__dirname, '../../package.json');
    const packageContent = fs.readFileSync(packagePath, 'utf-8');
    packageJson = JSON.parse(packageContent);
  });

  describe('Structure Validation', () => {
    it('should have all required fields', () => {
      expect(packageJson).toHaveProperty('name');
      expect(packageJson).toHaveProperty('version');
      expect(packageJson).toHaveProperty('dependencies');
      expect(packageJson).toHaveProperty('devDependencies');
      expect(packageJson).toHaveProperty('scripts');
    });

    it('should have correct package name', () => {
      expect(packageJson.name).toBe('api');
    });

    it('should have valid version format', () => {
      const versionRegex = /^\d+\.\d+\.\d+$/;
      expect(packageJson.version).toMatch(versionRegex);
    });

    it('should have commonjs module type', () => {
      expect(packageJson.type).toBe('commonjs');
    });
  });

  describe('Dependencies Validation', () => {
    it('should have morgan dependency', () => {
      expect(packageJson.dependencies).toHaveProperty('morgan');
    });

    it('should have morgan version 1.10.1 or higher', () => {
      const morganVersion = packageJson.dependencies.morgan;
      expect(morganVersion).toBeDefined();
      
      // Extract version number
      const versionMatch = morganVersion.match(/(\d+)\.(\d+)\.(\d+)/);
      expect(versionMatch).toBeTruthy();
      
      if (versionMatch) {
        const [, major, minor, patch] = versionMatch.map(Number);
        expect(major).toBeGreaterThanOrEqual(1);
        expect(minor).toBeGreaterThanOrEqual(10);
        
        if (minor === 10) {
          expect(patch).toBeGreaterThanOrEqual(1);
        }
      }
    });

    it('should have all required express-related dependencies', () => {
      expect(packageJson.dependencies).toHaveProperty('express');
      expect(packageJson.dependencies).toHaveProperty('cors');
      expect(packageJson.dependencies).toHaveProperty('morgan');
    });

    it('should have all required authentication dependencies', () => {
      expect(packageJson.dependencies).toHaveProperty('passport');
      expect(packageJson.dependencies).toHaveProperty('passport-jwt');
      expect(packageJson.dependencies).toHaveProperty('jsonwebtoken');
      expect(packageJson.dependencies).toHaveProperty('bcrypt');
    });

    it('should have prisma client', () => {
      expect(packageJson.dependencies).toHaveProperty('@prisma/client');
    });

    it('should have zod for validation', () => {
      expect(packageJson.dependencies).toHaveProperty('zod');
    });

    it('should have valid semantic version format for all dependencies', () => {
      const semverPattern = /^[\^~]?\d+\.\d+\.\d+$/;
      
      Object.entries(packageJson.dependencies).forEach(([name, version]) => {
        expect(version).toMatch(semverPattern, `Dependency ${name} has invalid version format: ${version}`);
      });
    });
  });

  describe('DevDependencies Validation', () => {
    it('should have TypeScript related dependencies', () => {
      expect(packageJson.devDependencies).toHaveProperty('typescript');
      expect(packageJson.devDependencies).toHaveProperty('ts-node');
      expect(packageJson.devDependencies).toHaveProperty('@types/node');
    });

    it('should have morgan type definitions', () => {
      expect(packageJson.devDependencies).toHaveProperty('@types/morgan');
    });

    it('should have testing dependencies', () => {
      expect(packageJson.devDependencies).toHaveProperty('vitest');
      expect(packageJson.devDependencies).toHaveProperty('supertest');
      expect(packageJson.devDependencies).toHaveProperty('@types/supertest');
    });

    it('should have type definitions for all major dependencies', () => {
      const typedDependencies = ['express', 'cors', 'morgan', 'bcrypt', 'passport', 'passport-jwt', 'jsonwebtoken'];
      
      typedDependencies.forEach(dep => {
        const typesDep = `@types/${dep}`;
        expect(
          packageJson.devDependencies[typesDep],
          `Missing type definitions for ${dep}`
        ).toBeDefined();
      });
    });

    it('should have valid semantic version format for all devDependencies', () => {
      const semverPattern = /^[\^~]?\d+\.\d+\.\d+$/;
      
      Object.entries(packageJson.devDependencies).forEach(([name, version]) => {
        expect(version).toMatch(semverPattern, `DevDependency ${name} has invalid version format: ${version}`);
      });
    });
  });

  describe('Scripts Validation', () => {
    it('should have essential npm scripts', () => {
      expect(packageJson.scripts).toHaveProperty('dev');
      expect(packageJson.scripts).toHaveProperty('build');
      expect(packageJson.scripts).toHaveProperty('start');
      expect(packageJson.scripts).toHaveProperty('test');
    });

    it('should have correct test script', () => {
      expect(packageJson.scripts.test).toBe('vitest');
    });

    it('should have prisma postinstall script', () => {
      expect(packageJson.scripts).toHaveProperty('postinstall');
      expect(packageJson.scripts.postinstall).toContain('prisma generate');
    });
  });

  describe('Prisma Configuration', () => {
    it('should have prisma schema configuration', () => {
      expect(packageJson).toHaveProperty('prisma');
      expect(packageJson.prisma).toHaveProperty('schema');
    });

    it('should have correct prisma schema path', () => {
      expect(packageJson.prisma.schema).toBe('prisma/schema.prisma');
    });
  });

  describe('Dependency Compatibility', () => {
    it('should have compatible Express and Morgan versions', () => {
      const expressVersion = packageJson.dependencies.express;
      const morganVersion = packageJson.dependencies.morgan;
      
      expect(expressVersion).toBeDefined();
      expect(morganVersion).toBeDefined();
      
      // Morgan 1.10.x is compatible with Express 5.x
      const expressMatch = expressVersion.match(/(\d+)/);
      const morganMatch = morganVersion.match(/(\d+)\.(\d+)/);
      
      if (expressMatch && morganMatch) {
        const [, expressMajor] = expressMatch.map(Number);
        const [, morganMajor, morganMinor] = morganMatch.map(Number);
        
        // Ensure we have compatible versions
        expect(expressMajor).toBeGreaterThanOrEqual(4);
        expect(morganMajor).toBe(1);
        expect(morganMinor).toBeGreaterThanOrEqual(10);
      }
    });
  });

  describe('Security and Best Practices', () => {
    it('should not have any wildcard versions', () => {
      const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      Object.entries(allDeps).forEach(([name, version]) => {
        expect(version).not.toBe('*');
        expect(version).not.toBe('latest');
        expect(version).not.toContain('x');
      });
    });

    it('should use caret ranges for dependencies', () => {
      Object.entries(packageJson.dependencies).forEach(([name, version]) => {
        expect(version.toString().startsWith('^'), 
          `Dependency ${name} should use caret range`).toBe(true);
      });
    });
  });
});