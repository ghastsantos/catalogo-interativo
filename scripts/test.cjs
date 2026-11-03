const ts = require('typescript');
const path = require('node:path');
const fs = require('node:fs');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const outDir = path.join(root, '.test-build');
fs.rmSync(outDir, { recursive: true, force: true });
const files = ['src/domain/catalog.ts', 'src/domain/library.ts', 'src/domain/validation.ts'].map((file) => path.join(root, file));
const program = ts.createProgram(files, {
  target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, strict: true,
  noUncheckedIndexedAccess: true, rootDir: path.join(root, 'src'), outDir, types: [], skipLibCheck: true,
});
const result = program.emit();
const diagnostics = [...ts.getPreEmitDiagnostics(program), ...result.diagnostics];
if (diagnostics.length) {
  console.error(ts.formatDiagnosticsWithColorAndContext(diagnostics, {
    getCurrentDirectory: () => root, getCanonicalFileName: (file) => file, getNewLine: () => '\n',
  }));
  process.exit(1);
}
const test = spawnSync(process.execPath, ['--test', 'tests/domain.test.cjs'], { cwd: root, stdio: 'inherit' });
process.exit(test.status ?? 1);
