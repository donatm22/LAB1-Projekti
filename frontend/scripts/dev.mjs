import { spawn } from "node:child_process";

const processes = [
  {
    name: "frontend",
    child: spawn("npm", ["run", "dev:client"], {
      stdio: "inherit",
      shell: true,
    }),
  },
  {
    name: "backend",
    child: spawn(process.execPath, ["../backend/server.js"], {
      stdio: "inherit",
      shell: false,
    }),
  },
];

const shutdown = () => {
  for (const { child } of processes) {
    if (!child.killed) {
      child.kill();
    }
  }
};

for (const { name, child } of processes) {
  child.on("exit", (code, signal) => {
    if (signal || (code !== null && code !== 0)) {
      console.error(`${name} exited unexpectedly.`);
    }

    shutdown();
    process.exit(code ?? 0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
