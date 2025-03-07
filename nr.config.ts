import path from 'node:path'

import { defineConfig } from '@darkobits/nr'
import { defaultPackageScripts } from '@darkobits/ts'

export default defineConfig([
  defaultPackageScripts,
  ({ command, fn, script }) => {
    // This re-defines the default build script without parallelization. This is
    // necessary because this project's ESLint configuration relies on the
    // project having been built first.
    script('build', [
      command('vite', { args: ['build'] }),
      'script:lint'
    ], {
      group: 'Build',
      description: 'Build, type-check, and lint the project.',
      timing: true
    })

    // ----- Smoke Tests -------------------------------------------------------

    const FIXTURES_DIR = 'fixtures'
    const NEW_CONFIG = 'eslint.config.mjs'

    const fixturesTsFlat = command('eslint', {
      args: ['src', { format: 'codeframe', config: NEW_CONFIG }],
      prefix: () => 'ts/flat',
      cwd: path.resolve(FIXTURES_DIR, 'ts'),
      env: {
        ESLINT_USE_FLAT_CONFIG: 'true'
      }
    })

    const fixturesTsxFlat = command('eslint', {
      args: ['src', { format: 'codeframe', config: NEW_CONFIG }],
      prefix: () => 'tsx/flat',
      cwd: path.resolve(FIXTURES_DIR, 'tsx'),
      env: {
        ESLINT_USE_FLAT_CONFIG: 'true'
      }
    })

    script('test.smoke.flat', [
      fn(() => {
        // log.info(log.prefix('test.smoke.flat'), 'Starting test...');
      }),
      [fixturesTsFlat, fixturesTsxFlat]
    ], {
      group: 'Test',
      description: 'Run ESLint in the fixtures directory using a flat configuration file.',
      timing: true
    })

    script('test.smoke.all', [
      fn(() => {
        // log.info(log.prefix('test.smoke.flat'), 'Starting test...');
      }),
      [
        fixturesTsFlat,
        fixturesTsxFlat
      ]
    ], {
      group: 'Test',
      description: 'Run ESLint in the fixtures directory using a both configuration files.',
      timing: true
    })

    // Watch build directory and lint fixtures on changes.
    script('test.smoke.watch', [
      command('nodemon', {
        args: {
          watch: ['dist', FIXTURES_DIR].join(' '),
          ext: 'ts,tsx,js,jsx,cjs,mjs,json',
          delay: '100ms',
          exec: [
            'clear && ',
            'nr test.smoke.flat'
          ].join('')
        }
      })
    ], {
      group: 'Test',
      description: 'When changes are detected in the output directory, run smoke tests.'
    })

    script('preBump', 'script:test.smoke.all')
  }
])