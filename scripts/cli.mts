import {
  cancel,
  intro,
  isCancel,
  log,
  outro,
  select,
  spinner,
} from "@clack/prompts";
import { execa } from "execa";
import pc from "picocolors";

console.clear();
intro(pc.bgCyan(pc.black(" DEPLOY MODEL ")));

for (const file of [".env", ".env.local"]) {
  try {
    process.loadEnvFile(file);
  } catch {
    // env files are optional
  }
}

function isSet(name: string, placeholder?: string) {
  const value = process.env[name]?.trim();
  return Boolean(value && value !== placeholder);
}

function check(label: string, ok: boolean, missing = "missing") {
  if (ok) log.success(pc.green(`${label} is set`));
  else log.warn(pc.yellow(`${label} is ${missing}`));
}

check("OPENROUTER_API_KEY", isSet("OPENROUTER_API_KEY", "sk-or-..."));
check("DATABASE_URL", isSet("DATABASE_URL"));
check("BETTER_AUTH_SECRET", isSet("BETTER_AUTH_SECRET"));
check(
  "Google OAuth",
  isSet("GOOGLE_CLIENT_ID") && isSet("GOOGLE_CLIENT_SECRET"),
  "not configured (sign-in disabled)"
);

const postgres = await execa(
  "docker",
  ["compose", "ps", "--status", "running", "--quiet", "postgres"],
  { reject: false }
);
if (postgres.exitCode !== 0) log.warn(pc.yellow("Docker is not reachable"));
else if (postgres.stdout.trim()) log.success(pc.green("Postgres is running"));
else log.warn(pc.yellow("Postgres is stopped"));

const tasks = {
  "db:up": {
    label: "Start Postgres",
    hint: "docker compose up -d postgres",
    command: "docker",
    args: ["compose", "up", "-d", "--wait", "postgres"],
  },
  "db:down": {
    label: "Stop Postgres",
    hint: "docker compose down",
    command: "docker",
    args: ["compose", "down"],
  },
  "db:generate": {
    label: "Generate migration",
    hint: "drizzle-kit generate",
    command: "drizzle-kit",
    args: ["generate"],
  },
  "db:migrate": {
    label: "Apply migrations",
    hint: "drizzle-kit migrate",
    command: "drizzle-kit",
    args: ["migrate"],
  },
  "db:push": {
    label: "Push schema",
    hint: "drizzle-kit push",
    command: "drizzle-kit",
    args: ["push"],
  },
  "db:studio": {
    label: "Drizzle Studio",
    hint: "drizzle-kit studio",
    command: "drizzle-kit",
    args: ["studio"],
  },
  "user:create": {
    label: "Create dummy user",
    hint: "Email/password user with verified email",
    command: "tsx",
    args: ["scripts/create-user.mts"],
  },
  "docker:build": {
    label: "Build app image",
    hint: "docker compose --profile app build",
    command: "docker",
    args: ["compose", "--profile", "app", "build"],
  },
  "docker:up": {
    label: "Run full stack",
    hint: "Postgres, migrations, and app on :3000",
    command: "docker",
    args: ["compose", "--profile", "app", "up", "--build"],
  },
  "docker:down": {
    label: "Stop full stack",
    hint: "docker compose --profile app down",
    command: "docker",
    args: ["compose", "--profile", "app", "down"],
  },
  build: {
    label: "Production build",
    hint: "next build",
    command: "next",
    args: ["build"],
  },
  start: {
    label: "Serve production build",
    hint: "next start",
    command: "next",
    args: ["start"],
  },
  lint: {
    label: "Lint",
    hint: "eslint",
    command: "eslint",
    args: ["."],
  },
} as const;

type TaskId = keyof typeof tasks;

const groups = [
  {
    label: "Database",
    hint: "Postgres container and Drizzle migrations",
    tasks: [
      "db:up",
      "db:down",
      "db:generate",
      "db:migrate",
      "db:push",
      "db:studio",
    ],
  },
  {
    label: "Users",
    hint: "Local test accounts",
    tasks: ["user:create"],
  },
  {
    label: "Docker",
    hint: "Containerized app stack",
    tasks: ["docker:build", "docker:up", "docker:down"],
  },
  {
    label: "App",
    hint: "Build, serve, and lint",
    tasks: ["build", "start", "lint"],
  },
] as const satisfies readonly {
  label: string;
  hint: string;
  tasks: readonly TaskId[];
}[];

const group = await select({
  message: "Group",
  options: groups.map((entry) => ({
    value: entry.label,
    label: entry.label,
    hint: entry.hint,
  })),
});

if (isCancel(group)) {
  cancel("Cancelled");
  process.exit(0);
}

const selectedGroup = groups.find((entry) => entry.label === group);
if (!selectedGroup) {
  cancel("Unknown group");
  process.exit(1);
}

const taskId = await select<TaskId>({
  message: selectedGroup.label,
  options: selectedGroup.tasks.map((id) => ({
    value: id,
    label: tasks[id].label,
    hint: tasks[id].hint,
  })),
});

if (isCancel(taskId)) {
  cancel("Cancelled");
  process.exit(0);
}

const task = tasks[taskId];
const startup = spinner();
startup.start(`Starting ${task.label}`);
startup.stop(`Starting ${task.label}`);

const result = await execa(task.command, [...task.args], {
  stdio: "inherit",
  preferLocal: true,
  reject: false,
});

const code = result.exitCode ?? 1;

if (code === 0 || code === 130) {
  outro(code === 0 ? "Done" : "Stopped");
  process.exit(0);
}

cancel(`Failed with code ${code}`);
process.exit(code);
