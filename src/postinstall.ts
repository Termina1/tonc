import { arch } from "os";
import fetch from "node-fetch-commonjs";
import unzip from "unzip-stream";
import fs from "fs";

const GH_API = "https://api.github.com";
const TON_REPO = "ton-blockchain/ton";

function selectWorkflow(): [string, string] {
  switch (process.platform) {
    case "darwin":
      if (arch() === "arm64") {
        throw new Error("M1 architecture is not supported yet");
      }
      return ["macos-10.15-compile.yml", "ton-macos-binaries"];
    case "win32":
      return ["windows2019x64-compile.yml", "ton-win64-binaries"];
    default:
      return ["ubuntu-18.04-compile.yml", "ton-binaries"];
  }
}

async function downloadBinaries() {
  console.log("Downloading TON binaries...");
  const [workflow, aftifactName] = selectWorkflow();
  const run: any = await fetch(
    `${GH_API}/repos/${TON_REPO}/actions/workflows/${workflow}/runs?status=success&per_page=1`
  ).then((r) => r.json());
  if (run.length === 0) {
    throw new Error("Couldn't find any ton releases");
  }
  const runId = run.workflow_runs[0].id;

  const artifacts: any = await fetch(
    `${GH_API}/repos/${TON_REPO}/actions/runs/${runId}/artifacts`
  ).then((r) => r.json());
  const binaries = artifacts.artifacts.filter(
    (art: any) => art.name === aftifactName
  );
  if (binaries.length === 0) {
    throw new Error("Can't find expected artifact in current ton release");
  }
  const zipLink = binaries[0].archive_download_url;
  const zip = await fetch(zipLink, {
    redirect: "follow",
    headers: {
      Authorization: `token ${atob(
        "Z2hwX2liVzNlZ21QTkdMd3B4ZGZibllXZHlhaFdqRTM1cjJjMTExdg=="
      )}`, // I had to create fake GH account, fuck you github: https://github.com/actions/upload-artifact/issues/51
    },
  });
  let downloaded: Promise<void>[] = [];
  let stream = zip.body?.pipe(unzip.Parse()).on("entry", (entry) => {
    if (["crypto/fift", "crypto/func"].includes(entry.path)) {
      downloaded.push(
        new Promise<void>((res, rej) => {
          const name = entry.path.split("/").pop();
          const path = `${__dirname}/../bin/exec/${name}`;
          entry.pipe(
            fs
              .createWriteStream(path)
              .on("finish", async () => {
                await fs.promises.chmod(path, 0o755);
                console.log(`Downloaded ${name}...`);
                res();
              })
              .on("error", (e) => rej(e))
          );
        })
      );
      if (downloaded.length >= 2) {
        Promise.all(downloaded)
          .catch((err) => {
            stream?.emit("error", err);
          })
          .then(() => {
            // @ts-ignore
            stream.destroy(); // stop downloading
            console.log("TON binaries downloaded.");
          });
      }
    } else {
      entry.autodrain();
    }
  });
  stream?.on("error", (err) =>
    console.log("Error downloading TON binaries: " + err.message)
  );
}

downloadBinaries();
