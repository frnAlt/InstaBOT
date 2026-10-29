/*
  WARNING: This source code is created by Liane Cagara.
  Any unauthorized modifications or attempts to tamper with this code 
  can result in severe consequences, including a global ban from my server.
  Proceed with extreme caution and refrain from any unauthorized actions.
*/

import ts from "typescript";

export class TsObject {
  private type: ts.Type;
  private checker: ts.TypeChecker;

  constructor(typeString: string) {
    const sourceCode = `type __T = ${typeString};`;
    const sourceFile = ts.createSourceFile(
      "temp.ts",
      sourceCode,
      ts.ScriptTarget.Latest,
      true
    );

    const program = ts.createProgram({
      rootNames: ["temp.ts"],
      options: { noEmit: true },
    });

    this.checker = program.getTypeChecker();

    const typeNode = sourceFile.statements[0] as ts.TypeAliasDeclaration;
    this.type = this.checker.getTypeAtLocation(typeNode.type);
  }

  /** Import TypeScript Module (as a type) */
  static import(modulePath: string): TsObject {
    return new TsObject(`import(${JSON.stringify(modulePath)})`);
  }

  /** Get all object members */
  getAllMembers(): Record<string, TsObject> {
    const members: Record<string, TsObject> = {};
    this.type.getProperties().forEach((symbol) => {
      const propType = this.checker.getTypeOfSymbolAtLocation(
        symbol,
        symbol.valueDeclaration!
      );
      members[symbol.getName()] = new TsObject(
        this.checker.typeToString(propType)
      );
    });
    return members;
  }

  /** Get a specific member */
  getMember(key: string): TsObject | null {
    const symbol = this.type.getProperty(key);
    if (!symbol || !symbol.valueDeclaration) return null;
    const propType = this.checker.getTypeOfSymbolAtLocation(
      symbol,
      symbol.valueDeclaration
    );
    return new TsObject(this.checker.typeToString(propType));
  }

  /** Get all namespace members */
  getAllNsMembers(): Record<string, TsObject> {
    if (!(this.type.symbol && ts.SymbolFlags.Namespace)) return {};
    const exports = this.type.symbol.exports;
    const members: Record<string, TsObject> = {};

    exports?.forEach((symbol, name) => {
      const propType = this.checker.getTypeOfSymbolAtLocation(
        symbol,
        symbol.valueDeclaration!
      );

      members[name.toString()] = new TsObject(
        this.checker.typeToString(propType)
      );
    });

    return members;
  }

  /** Get a specific namespace member */
  getNsMember(key: string): TsObject | null {
    return this.getAllNsMembers()[key] || null;
  }

  /** Get return type (if callable) */
  getReturn(): TsObject | null {
    const signatures = this.type.getCallSignatures();
    if (signatures.length === 0) return null;
    return new TsObject(
      this.checker.typeToString(signatures[0].getReturnType())
    );
  }

  /** Get function arguments (if callable) */
  getArguments(): TsObject[] {
    const signatures = this.type.getCallSignatures();
    if (signatures.length === 0) return [];
    return signatures[0].getParameters().map((param) => {
      const paramType = this.checker.getTypeOfSymbolAtLocation(
        param,
        param.valueDeclaration!
      );
      return new TsObject(this.checker.typeToString(paramType));
    });
  }

  /** Get JSDoc description */
  getDescription(): string | null {
    const symbol = this.type.symbol;
    if (!symbol || !symbol.getDocumentationComment) return null;
    return (
      ts.displayPartsToString(symbol.getDocumentationComment(this.checker)) ||
      null
    );
  }

  /** Get JSDoc throws annotation */
  getThrows(): TsObject[] | null {
    const symbol = this.type.symbol;
    if (!symbol) return null;
    const jsDocs = symbol.getJsDocTags();
    const throwsTag = jsDocs.find((tag) => tag.name === "throws");
    return throwsTag
      ? throwsTag.text.map((i) => new TsObject(i.text || "unknown"))
      : null;
  }

  /** Convert type to string (mimic VSCode hover behavior) */
  toString(): string {
    return this.checker.typeToString(this.type);
  }
}
import fs from "fs";
import path from "path";

export function compileTS(
  tsCode: string,
  tsConfigPath: string = "tsconfig.json"
): string {
  const configFilePath = path.resolve(process.cwd(), tsConfigPath);

  if (!fs.existsSync(configFilePath)) {
    throw new Error(`tsconfig.json not found at ${configFilePath}`);
  }

  const configFileText = fs.readFileSync(configFilePath, "utf8");
  const { config, error } = ts.parseConfigFileTextToJson(
    configFilePath,
    configFileText
  );

  if (error) {
    throw new Error(
      `tsconfig.json error: ${ts.flattenDiagnosticMessageText(
        error.messageText,
        "\n"
      )}`
    );
  }

  const { options, errors } = ts.convertCompilerOptionsFromJson(
    config.compilerOptions,
    process.cwd()
  );

  if (errors.length) {
    throw new Error(
      `tsconfig.json options error: ${errors
        .map((e) => ts.flattenDiagnosticMessageText(e.messageText, "\n"))
        .join("\n")}`
    );
  }

  options.noEmit = true;
  options.allowJs = options.allowJs ?? false;
  options.checkJs = options.checkJs ?? false;

  const host: ts.CompilerHost = {
    ...ts.sys,
    getSourceFile: (fileName: string, languageVersion: ts.ScriptTarget) => {
      if (fileName === "temp.ts") {
        return ts.createSourceFile(fileName, tsCode, languageVersion, true);
      }
      return undefined;
    },
    getDefaultLibFileName: (options: ts.CompilerOptions) =>
      ts.getDefaultLibFileName(options),
    writeFile: () => {},
    getCurrentDirectory: () => process.cwd(),
    getCanonicalFileName: (fileName: string) => fileName,
    useCaseSensitiveFileNames: () => ts.sys.useCaseSensitiveFileNames,
    getNewLine: () => ts.sys.newLine,
    fileExists: (fileName: string) =>
      fileName === "temp.ts" || ts.sys.fileExists(fileName),
    readFile: (fileName: string) =>
      fileName === "temp.ts" ? tsCode : ts.sys.readFile(fileName),
  };

  const program = ts.createProgram({
    rootNames: ["temp.ts"],
    options,
    host,
  });

  const diagnostics = ts.getPreEmitDiagnostics(program);

  if (diagnostics.length) {
    const errorMessages = diagnostics
      .map((d) => ts.flattenDiagnosticMessageText(d.messageText, "\n"))
      .join("\n");
    throw new Error(`TypeScript errors:\n${errorMessages}`);
  }

  const { outputText } = ts.transpileModule(tsCode, {
    compilerOptions: options,
    fileName: "temp.ts",
  });

  return outputText;
}
