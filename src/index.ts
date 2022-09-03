import { file as createTempFile } from "tmp-promise";
import { promises as fs } from "fs";
import * as path from "path";
import * as child from "child_process";

export function executeFunc(args: string[]) {
  const fiftPath = path.resolve(__dirname, "..", "bin", "func");
  child.execSync(fiftPath + " " + args.join(" "), {
    stdio: "inherit",
  });
}

export function executeFift(args: string[]) {
  const fiftPath = path.resolve(__dirname, "..", "bin", "fift");
  child.execSync(fiftPath + " " + args.join(" "), {
    stdio: "inherit",
  });
}

export async function compileFunc(source: string): Promise<string> {
  let sourceFile = await createTempFile({ postfix: ".fc" });
  let fiftFile = await createTempFile({ postfix: ".fif" });
  let funcLib = path.resolve(__dirname, "..", "funclib", "stdlib.fc");
  try {
    await fs.writeFile(sourceFile.path, source);
    executeFunc(["-PS", "-o", fiftFile.path, funcLib, sourceFile.path]);
    let fiftContent = await fs.readFile(fiftFile.path);
    fiftContent = fiftContent.slice(fiftContent.indexOf("\n") + 1); // Remove first line
    return fiftContent.toString();
  } finally {
    sourceFile.cleanup();
    fiftFile.cleanup();
  }
}

export async function compileFift(source: string): Promise<Buffer> {
  let fiftOpFile = await createTempFile({ postfix: ".fif" });
  let cellFile = await createTempFile({ postfix: ".cell" });
  try {
    let body = "";
    body += `"Asm.fif" include\n`;
    body += source;
    body += "\n";
    body += `boc>B "${cellFile.path}" B>file`;
    await fs.writeFile(fiftOpFile.path, body, "utf-8");
    executeFift([fiftOpFile.path]);
    return await fs.readFile(cellFile.path);
  } finally {
    fiftOpFile.cleanup();
    cellFile.cleanup();
  }
}
