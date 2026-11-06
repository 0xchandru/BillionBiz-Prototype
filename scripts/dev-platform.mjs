import { spawn } from 'node:child_process';

const services = [
  ['backend', ['run', 'dev:backend']],
  ['editor', ['run', 'dev:editor']],
  ['storefront', ['run', 'dev:storefront']],
];
const children = [];
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

for (const [name, args] of services) {
  const child = spawn(npmCommand, args, { stdio: 'inherit', shell: process.platform === 'win32' });
  children.push({ name, child });
  child.once('exit', (code) => {
    if (code && code !== 0) {
      console.error(`[${name}] exited with code ${code}; stopping the other development services.`);
      stopAll(code);
    }
  });
}

let stopping = false;
function stopAll(exitCode = 0) {
  if (stopping) return;
  stopping = true;
  for (const { child } of children) if (child.exitCode === null) child.kill();
  setTimeout(() => process.exit(exitCode), 250).unref();
}

process.on('SIGINT', () => stopAll(0));
process.on('SIGTERM', () => stopAll(0));
