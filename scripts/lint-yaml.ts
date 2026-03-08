import { readFile } from "node:fs/promises";
import { parseDocument } from "yaml";

const ignorePatterns = [
    /^node_modules\//,
    /^\.git\//,
    /^apps\/web\/\.next\//,
    /^build\//,
    /^dist\//,
    /^out\//,
    /^coverage\//,
    /^playwright-report\//,
    /^test-results\//,
];

function shouldIgnore(path: string): boolean {
    return ignorePatterns.some((pattern) => pattern.test(path));
}

const files = new Set<string>();

for (const pattern of ["**/*.yaml", "**/*.yml"]) {
    for await (const file of new Bun.Glob(pattern).scan({
        cwd: process.cwd(),
        onlyFiles: true,
    })) {
        if (!shouldIgnore(file)) {
            files.add(file);
        }
    }
}

let hasErrors = false;

for (const file of [...files].sort()) {
    const source = await readFile(file, "utf8");
    const document = parseDocument(source, {
        uniqueKeys: true,
        version: "1.2",
    });
    const issues = [...document.errors, ...document.warnings];

    if (issues.length === 0) {
        continue;
    }

    hasErrors = true;
    console.error(`\n${file}`);

    for (const issue of issues) {
        console.error(`  - ${issue.message}`);
    }
}

if (hasErrors) {
    process.exit(1);
}

console.log(`YAML lint passed for ${files.size} files.`);
