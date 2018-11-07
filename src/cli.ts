
import * as ts from 'typescript';
import * as path from 'path';
import * as llvm from 'llvm-node';

import {initializeLLVM, generateModuleFromProgram} from './backend/llvm';

const options = {
    lib: [
        path.join(__dirname, '..', 'runtime', 'lib.runtime.d.ts')
    ],
    types: []
};

const files = [
    'sandbox/do-simple-math.ts'
];

const host = ts.createCompilerHost(options);
const program = ts.createProgram(files, options, host);
const diagnostics = ts.getPreEmitDiagnostics(program);

if (diagnostics.length) {
    diagnostics.forEach(diagnostic => {
        const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
        if (!diagnostic.file) {
            console.log(message);
            return;
        }

        const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
        console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
    });

    process.exit(1);
}

initializeLLVM();

const llvmModule = generateModuleFromProgram(program);

llvm.verifyModule(llvmModule);

console.log(llvmModule.print());
