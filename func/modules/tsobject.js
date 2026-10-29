"use strict";
/*
  WARNING: This source code is created by Liane Cagara.
  Any unauthorized modifications or attempts to tamper with this code
  can result in severe consequences, including a global ban from my server.
  Proceed with extreme caution and refrain from any unauthorized actions.
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TsObject = void 0;
exports.compileTS = compileTS;
const typescript_1 = __importDefault(require("typescript"));
class TsObject {
    type;
    checker;
    constructor(typeString) {
        const sourceCode = `type __T = ${typeString};`;
        const sourceFile = typescript_1.default.createSourceFile("temp.ts", sourceCode, typescript_1.default.ScriptTarget.Latest, true);
        const program = typescript_1.default.createProgram({
            rootNames: ["temp.ts"],
            options: { noEmit: true },
        });
        this.checker = program.getTypeChecker();
        const typeNode = sourceFile.statements[0];
        this.type = this.checker.getTypeAtLocation(typeNode.type);
    }
    /** Import TypeScript Module (as a type) */
    static import(modulePath) {
        return new TsObject(`import(${JSON.stringify(modulePath)})`);
    }
    /** Get all object members */
    getAllMembers() {
        const members = {};
        this.type.getProperties().forEach((symbol) => {
            const propType = this.checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration);
            members[symbol.getName()] = new TsObject(this.checker.typeToString(propType));
        });
        return members;
    }
    /** Get a specific member */
    getMember(key) {
        const symbol = this.type.getProperty(key);
        if (!symbol || !symbol.valueDeclaration)
            return null;
        const propType = this.checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration);
        return new TsObject(this.checker.typeToString(propType));
    }
    /** Get all namespace members */
    getAllNsMembers() {
        if (!(this.type.symbol && typescript_1.default.SymbolFlags.Namespace))
            return {};
        const exports = this.type.symbol.exports;
        const members = {};
        exports?.forEach((symbol, name) => {
            const propType = this.checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration);
            members[name.toString()] = new TsObject(this.checker.typeToString(propType));
        });
        return members;
    }
    /** Get a specific namespace member */
    getNsMember(key) {
        return this.getAllNsMembers()[key] || null;
    }
    /** Get return type (if callable) */
    getReturn() {
        const signatures = this.type.getCallSignatures();
        if (signatures.length === 0)
            return null;
        return new TsObject(this.checker.typeToString(signatures[0].getReturnType()));
    }
    /** Get function arguments (if callable) */
    getArguments() {
        const signatures = this.type.getCallSignatures();
        if (signatures.length === 0)
            return [];
        return signatures[0].getParameters().map((param) => {
            const paramType = this.checker.getTypeOfSymbolAtLocation(param, param.valueDeclaration);
            return new TsObject(this.checker.typeToString(paramType));
        });
    }
    /** Get JSDoc description */
    getDescription() {
        const symbol = this.type.symbol;
        if (!symbol || !symbol.getDocumentationComment)
            return null;
        return (typescript_1.default.displayPartsToString(symbol.getDocumentationComment(this.checker)) ||
            null);
    }
    /** Get JSDoc throws annotation */
    getThrows() {
        const symbol = this.type.symbol;
        if (!symbol)
            return null;
        const jsDocs = symbol.getJsDocTags();
        const throwsTag = jsDocs.find((tag) => tag.name === "throws");
        return throwsTag
            ? throwsTag.text.map((i) => new TsObject(i.text || "unknown"))
            : null;
    }
    /** Convert type to string (mimic VSCode hover behavior) */
    toString() {
        return this.checker.typeToString(this.type);
    }
}
exports.TsObject = TsObject;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function compileTS(tsCode, tsConfigPath = "tsconfig.json") {
    const configFilePath = path_1.default.resolve(process.cwd(), tsConfigPath);
    if (!fs_1.default.existsSync(configFilePath)) {
        throw new Error(`tsconfig.json not found at ${configFilePath}`);
    }
    const configFileText = fs_1.default.readFileSync(configFilePath, "utf8");
    const { config, error } = typescript_1.default.parseConfigFileTextToJson(configFilePath, configFileText);
    if (error) {
        throw new Error(`tsconfig.json error: ${typescript_1.default.flattenDiagnosticMessageText(error.messageText, "\n")}`);
    }
    const { options, errors } = typescript_1.default.convertCompilerOptionsFromJson(config.compilerOptions, process.cwd());
    if (errors.length) {
        throw new Error(`tsconfig.json options error: ${errors
            .map((e) => typescript_1.default.flattenDiagnosticMessageText(e.messageText, "\n"))
            .join("\n")}`);
    }
    options.noEmit = true;
    options.allowJs = options.allowJs ?? false;
    options.checkJs = options.checkJs ?? false;
    const host = {
        ...typescript_1.default.sys,
        getSourceFile: (fileName, languageVersion) => {
            if (fileName === "temp.ts") {
                return typescript_1.default.createSourceFile(fileName, tsCode, languageVersion, true);
            }
            return undefined;
        },
        getDefaultLibFileName: (options) => typescript_1.default.getDefaultLibFileName(options),
        writeFile: () => { },
        getCurrentDirectory: () => process.cwd(),
        getCanonicalFileName: (fileName) => fileName,
        useCaseSensitiveFileNames: () => typescript_1.default.sys.useCaseSensitiveFileNames,
        getNewLine: () => typescript_1.default.sys.newLine,
        fileExists: (fileName) => fileName === "temp.ts" || typescript_1.default.sys.fileExists(fileName),
        readFile: (fileName) => fileName === "temp.ts" ? tsCode : typescript_1.default.sys.readFile(fileName),
    };
    const program = typescript_1.default.createProgram({
        rootNames: ["temp.ts"],
        options,
        host,
    });
    const diagnostics = typescript_1.default.getPreEmitDiagnostics(program);
    if (diagnostics.length) {
        const errorMessages = diagnostics
            .map((d) => typescript_1.default.flattenDiagnosticMessageText(d.messageText, "\n"))
            .join("\n");
        throw new Error(`TypeScript errors:\n${errorMessages}`);
    }
    const { outputText } = typescript_1.default.transpileModule(tsCode, {
        compilerOptions: options,
        fileName: "temp.ts",
    });
    return outputText;
}
