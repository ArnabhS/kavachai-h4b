

import fs from 'fs';
import path from 'path';

export function detectProjectType(): 'next' | 'react' | 'node' | 'unknown' {
  try {
    // Try to find package.json in the project root
    const packageJsonPath = path.resolve(process.cwd(), 'package.json');
    if (!fs.existsSync(packageJsonPath)) return 'unknown';

    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    if ('next' in deps) return 'next';
    if ('react' in deps) return 'react';
    if ('express' in deps || 'koa' in deps || 'fastify' in deps) return 'node';

    // Fallback: check for next.config.js/ts
    if (fs.existsSync(path.resolve(process.cwd(), 'next.config.js')) ||
        fs.existsSync(path.resolve(process.cwd(), 'next.config.ts'))) {
      return 'next';
    }
    // Fallback: check for server.js/app.js/index.js
    if (fs.existsSync(path.resolve(process.cwd(), 'server.js')) ||
        fs.existsSync(path.resolve(process.cwd(), 'app.js')) ||
        fs.existsSync(path.resolve(process.cwd(), 'index.js'))) {
      return 'node';
    }
    return 'unknown';
  } catch {
    return 'unknown';
  }
}