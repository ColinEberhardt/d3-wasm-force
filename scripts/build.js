const { Compiler, CompilerTarget, CompilerMemoryModel, typescript } = require("assemblyscript");
const { TextDecoder } = require("text-encoding");
const { writeFileSync } = require("fs");

const mod = Compiler.compileFile('src/wasm/force.ts', {
  target: CompilerTarget.WASM32
});

if (!mod) {
  throw Error("compilation failed");
}

// mod.optimize();

// if (!mod.validate()) {
//   throw Error("validation failed");
// }

const wasmFile = mod.emitBinary();
const decoder = new TextDecoder('utf8');
const encoded = new Buffer(decoder.decode(wasmFile)).toString('base64');
writeFileSync('build/wasmEncoded.js', `exports.wasmEncoded ='${encoded}'`);

mod.dispose();