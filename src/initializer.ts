import { generateType } from './generateType.js';
import { Config, getConfig } from './getConfig.js';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Project, SyntaxKind } from 'ts-morph';
import camelcase from 'camelcase';
import throttle from 'throttleit';

import chalk from 'chalk';
import ora from 'ora';

const greenLog = chalk.green;

const spinner = ora();

function relative(from: string, to: string) {
  if (!from || !to) throw new Error('Invalid or empty paths');
  if (from.startsWith('/') !== to.startsWith('/'))
    throw new Error('Mixed absolute and relative paths');
  let path = '';
  // make from point to the folder we're starting from
  // (only relevant if the path does not end in a slash)
  let current = from.substr(0, from.lastIndexOf('/') + 1);
  // If target is same as current directory...
  if (current === to) return './';
  while (!to.startsWith(current)) {
    const index = current.lastIndexOf('/', current.length - 2);
    if (index !== -1) path += '../';
    current = current.substr(0, index + 1);
    continue;
  }

  path += to.substr(current.length);
  return path;
}

class HandleDataWrapper {
  isRunning: boolean;
  pendingData: Map<string, any>;
  project: Project;
  config: Config;

  constructor() {
    this.isRunning = false;
    this.pendingData = new Map<string, any>();
    this.project = new Project({
      tsConfigFilePath: 'tsconfig.json',
    });
    this.config = getConfig();
    if (!this.config.typePath || !this.config.apiPath || !this.config.fetchType) {
      console.log(
        chalk.red(
          'Please make sure you have a valid typePath, apiPath and fetchType in your package.json'
        )
      );
      process.exit(1);
    }
    console.log(chalk.green('Type Generation Service Started'));
  }

  handleData(data: unknown, typeName: string) {
    const project = new Project({
      tsConfigFilePath: 'tsconfig.json',
    });

    this.isRunning = true;
    project.getDirectoryOrThrow(`${this.config.apiPath}`);
    project.getDirectoryOrThrow(`${this.config.typePath}`);

    const sourceFiles = project.getSourceFiles(`${this.config.apiPath}/*.ts`);
    if (data) {
      spinner.start(`Generating ${this.config.objectType} for ${typeName}\n`);
      // check if type file exists
      const thisTypeSourceFile = project.getSourceFile(
        `${this.config.typePath}/${typeName}.ts`
      );
      // only generate type file if it does not exist, so that we don't
      // make unnecessary multiple changes to the file
      if (!thisTypeSourceFile) {
        const formattedName = camelcase(typeName, { pascalCase: true });
        // generate type file
        generateType(`${typeName}.ts`, data, `${formattedName}`);

        spinner.succeed(
          greenLog(`${formattedName} type generated. `) +
            chalk.dim.underline(
              `See -> ${this.config.typePath}/${typeName}.ts\n`
            )
        );

        // get the correct path to the new type file
        let cwd = relative(
          `${this.config.apiPath}/${typeName}.ts`,
          `${this.config.typePath}/${typeName}.ts`
        );
        // remove the .ts extension
        cwd = cwd.replace('.ts', '');

        sourceFiles.forEach((sourceFile) => {
          if (sourceFile.getImportDeclaration('realtime-api-types')) {
            const text = sourceFile.getText();
            const fileName = sourceFile.getBaseName();
            spinner.start(
              `Adding ${this.config.objectType} to ${typeName} in ${this.config.apiPath}/${fileName}.ts`
            );
            if (
              text &&
              text.includes('typedApiWrapper') &&
              text.includes(typeName)
            ) {
              const method = sourceFile
                .getDescendantsOfKind(SyntaxKind.MethodDeclaration)
                .find((fnDef) => fnDef.getName() === typeName);

              const properties = sourceFile.getDescendantsOfKind(
                SyntaxKind.PropertyAssignment
              );

              let success = false;

              if (method) {
                method.setReturnType(
                  this.config.fetchType === 'axios'
                    ? `Promise<{ data: ${formattedName} }>`
                    : `Promise<${formattedName}>`
                );
                success = true;
              } else {
                properties.forEach((prop) => {
                  prop
                    .getDescendantsOfKind(SyntaxKind.Identifier)
                    .forEach((id) => {
                      if (id.getText() === typeName) {
                        const arrowFunc = prop.getFirstDescendantByKind(
                          SyntaxKind.ArrowFunction
                        );
                        if (arrowFunc) {
                          arrowFunc.setReturnType(
                            this.config.fetchType === 'axios'
                              ? `Promise<{ data: ${formattedName} }>`
                              : `Promise<${formattedName}>`
                          );
                          success = true;
                        }
                      }
                    });
                });
              }
              if (success) {
                sourceFile.addImportDeclaration({
                  moduleSpecifier: `${cwd}`,
                  namedImports: [formattedName],
                });
                spinner.succeed(
                  greenLog(`Type added to ${typeName} in -> `) +
                    chalk.dim.underline(
                      `${this.config.apiPath}/${fileName}.ts\n`
                    )
                );
                sourceFile.saveSync();
              } else {
                spinner.fail(
                  chalk.red(
                    `Could not add type to ${typeName} in -> ${this.config.apiPath}/${fileName}.ts\n`
                  )
                );
              }
            }
          }
        });
      }
    }
    spinner.stop();
    this.isRunning = false;
  }
}

export const initialise = async () => {
  const app = express();
  const port = 4141;
  const handler = new HandleDataWrapper();

  const throttled = throttle((d, t) => handler.handleData(d, t), 1500);

  app.use(cors());
  app.use(bodyParser.json());
  app.use(function (_, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept'
    );
    next();
  });

  app.options('*', cors());

  app.post('/', (req: any, res: any) => {
    if (req.body.type && req.body.data) {
      throttled(req.body.data, req.body.type);
    }
    res.send(true);
  });

  app.listen(port, () => {
    console.log(chalk.gray(`Generation Service running on port ${port}`));
  });
};
