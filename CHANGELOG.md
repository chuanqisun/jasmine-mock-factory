# 3.0.0
 * The package no longer includes raw *.ts file. Instead, it includes compiled js with d.ts typing file. This decouples users' tsconfig file from the library's own tsconfig file.
 * Now supports Typescript >= 3.0.0, Jasmine >= 2.9.0,

# 2.1.0
 * [Typescript 2.9](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-9.html) supports `number` and `symbol` named properties. Since Jasmine can only spy on `string` named properties according to its [official spec](https://jasmine.github.io/api/3.3/global.html#spyOnProperty), Jasmine-mock-factory will return undefined when user reads those properties and ignores any write operations. With this update, a warning message will be displayed when user tries to spy on a `number` or `symbol` named properties.
 * ignore `index.spec.ts` from npm package
 * Note: You may not need to upgrade to Typescript 2.9 to use this version since the newer syntax was only used in the `index.spec.ts` file which is ignored in npm packages.

# 2.0.2
 * Support `--strictNullChecks` compile

# 2.0.0
 * Support typing of spies through the `_spy` facade.
 * Allow spying and stubbing value accessors on any property