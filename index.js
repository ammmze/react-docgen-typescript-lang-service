/**
 * The MIT License
 *
 *  Further resources on the MIT License
 *  Copyright 2018 Jason Strothmann <jason@jasons.io>
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the  "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish,  distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to  the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR  ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */
const fs = require('fs');
const path = require('path');
const ts = require('typescript');
const { withDefaultConfig, withCustomConfig } = require('react-docgen-typescript');

let languageService = null;
const filesCache = new Map();
let parser = null;
let tsConfigFile = null;

function propsParser(file, source) {
    filesCache.set(file, {
        text: source,
        version: 0,
    });
    if (parser == null) {
        parser = withCustomConfig('./tsconfig.json');
    }
    if (tsConfigFile == null) {
        tsConfigFile = getTSConfigFile('./tsconfig.json');
    }
    return parser.parseWithProgramProvider(file, function() {
        if (languageService) {
            return languageService.getProgram();
        }

        const servicesHost = createServiceHost(
            tsConfigFile.compilerOptions,
            filesCache
        );

        languageService = ts.createLanguageService(
            servicesHost,
            ts.createDocumentRegistry()
        );

        return languageService.getProgram();
    });
}

function getTSConfigFile(tsconfigPath) {
    const basePath = path.dirname(tsconfigPath);
    const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
    return ts.parseJsonConfigFileContent(
        configFile.config,
        ts.sys,
        basePath,
        {},
        tsconfigPath
    );
}

function createServiceHost(compilerOptions, files) {
    return {
        getScriptFileNames: () => {
            return [...files.keys()];
        },
        getScriptVersion: fileName => {
            const file = files.get(fileName);
            return (file && file.version.toString()) || '';
        },
        getScriptSnapshot: fileName => {
            if (!fs.existsSync(fileName)) {
                return undefined;
            }

            let file = files.get(fileName);

            if (file === undefined) {
                const text = fs.readFileSync(fileName).toString();

                file = { version: 0, text };
                files.set(fileName, file);
            }

            return ts.ScriptSnapshot.fromString(file.text);
        },
        getCurrentDirectory: () => process.cwd(),
        getCompilationSettings: () => compilerOptions,
        getDefaultLibFileName: options => ts.getDefaultLibFilePath(options),
        fileExists: ts.sys.fileExists,
        readFile: ts.sys.readFile,
        readDirectory: ts.sys.readDirectory,
    };
}

const builder = {
    withDefaultConfig: function (options) {
        parser = withDefaultConfig(options);
        tsConfigFile = getTSConfigFile('./tsconfig.json');
        return builder;
    },
    withCustomConfig: function (file, options) {
        parser = withCustomConfig(file, options);
        tsConfigFile = getTSConfigFile(file);
        return builder;
    },
    parse: propsParser
};

module.exports = builder;
