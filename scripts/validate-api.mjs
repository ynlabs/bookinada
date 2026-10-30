import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Run from the repository root, using the version installed by npm ci.
const cli = fileURLToPath(new URL('../node_modules/@redocly/cli/bin/cli.js', import.meta.url));
const files = process.argv.slice(2);
if (files.length === 0) {
  files.push('api/hotel.openapi.yaml', 'api/flight.openapi.yaml');
}

let failed = false;
for (const file of files) {
  const result = spawnSync(process.execPath, [
    cli, 'lint', file, '--format=json', '--lint-config=error',
  ], { encoding: 'utf8' });

  if (result.error || result.signal || result.status === null) {
    console.error(`${file}: validator could not complete.`, result.error ?? result.signal);
    failed = true;
    continue;
  }

  let report;
  try {
    report = JSON.parse(result.stdout);
    if (!Number.isInteger(report.totals?.errors) || !Number.isInteger(report.totals?.warnings)) {
      throw new Error('Missing validation totals');
    }
  } catch {
    console.error(`${file}: validator did not return a usable JSON report.`);
    console.error(result.stdout, result.stderr);
    failed = true;
    continue;
  }

  const { errors, warnings } = report.totals;
  console.log(`${file}: ${errors} errors, ${warnings} warnings`);
  for (const problem of report.problems ?? []) {
    const location = problem.location?.[0];
    console.error(`  ${problem.severity}: ${problem.ruleId}: ${problem.message} (${location?.pointer ?? file})`);
  }
  if (result.status !== 0 || errors > 0 || warnings > 0) {
    failed = true;
    if (result.status !== 0 && errors === 0 && warnings === 0) {
      console.error(result.stderr);
    }
  }
}

process.exitCode = failed ? 1 : 0;
