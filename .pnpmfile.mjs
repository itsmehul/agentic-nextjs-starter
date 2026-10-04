// typescript-eslint needs the TypeScript JS compiler API, which TypeScript 7 does not ship.
// Pin its packages to TypeScript 6 while the project itself stays on TypeScript 7.
const LINT_TYPESCRIPT = "~6.0.3";

function readPackage(pkg) {
  const isTypescriptEslint =
    pkg.name === "typescript-eslint" || pkg.name?.startsWith("@typescript-eslint/");

  if (isTypescriptEslint && pkg.peerDependencies?.typescript) {
    delete pkg.peerDependencies.typescript;
    delete pkg.peerDependenciesMeta?.typescript;
    pkg.dependencies = { ...pkg.dependencies, typescript: LINT_TYPESCRIPT };
  }

  return pkg;
}

export const hooks = { readPackage };
