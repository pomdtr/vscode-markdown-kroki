import pako from "pako";
import { workspace } from "vscode";
import * as vscode from "vscode";
import fetch from "node-fetch";
import { URL } from "url";
import https from "https";

const config = workspace.getConfiguration("markdown-kroki");

export async function activate() {
  let channel = vscode.window.createOutputChannel("markdown-kroki");

  let url = new URL(config.get<string>("url", "https://kroki.io"));
  let allowSelfSignedHost = config.get<boolean>("allowSelfSignedHost", false);

  let supportedDiagramTypes: string[];

  try {
    supportedDiagramTypes = await fetchDiagramTypes(url, allowSelfSignedHost);
  } catch (error) {
    channel.appendLine(`Failed to get supported diagram types from ${url}`);
    channel.appendLine(error.message);
    return;
  }

  // Listen for configuration changes
  vscode.workspace.onDidChangeConfiguration(async (event) => {
    if (event.affectsConfiguration("markdown-kroki")) {
      // The setting has been changed, update it
      url = new URL(config.get<string>("url", "https://kroki.io"));
      allowSelfSignedHost = config.get<boolean>("allowSelfSignedHost", false);
      try {
        supportedDiagramTypes = await fetchDiagramTypes(url, allowSelfSignedHost);
      } catch (error) {
        channel.appendLine(
          `Failed to get supported diagram types from ${url}`,
        );
        channel.appendLine(error.message);
        return;
      }
    }
  });

  return {
    extendMarkdownIt(md) {
      const fence = md.renderer.rules.fence.bind(md.renderer.rules);
      const diagramPrefix = config.get<string>("prefix", "").toLowerCase();

      md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
        const token = tokens[idx];

        const diagramType = (() => {
          var res = token.info.toLowerCase() as string;
          res = res.trim();
          res = res.split(" ")[0];

          if (res.indexOf(diagramPrefix) == 0) {
            return res.slice(diagramPrefix.length);
          } else {
            return ""; // Prefix not found, so not our token.
          }
        })();

        if (supportedDiagramTypes.includes(diagramType)) {
          channel.appendLine("Rendering " + diagramType);

          const encodedDiagram = encodeDiagram(token.content.trim());
          return `<p><img src="${url}/${diagramType}/svg/${encodedDiagram}"></p>`;
        } else {
          channel.appendLine(
            "Skipping fence " + diagramType + ". Unknown type",
          );
        }
        return fence(tokens, idx, options, env, slf);
      };
      return md;
    },
  };
}

async function fetchDiagramTypes(
  url: URL,
  allowSelfSignedHost: boolean = false
): Promise<string[]> {
  let sslConfiguredAgent = null;
  const options = { rejectUnauthorized: allowSelfSignedHost ? true : false };

  sslConfiguredAgent = new https.Agent(options);
  const response = await fetch(`${url}/v1/health`, { agent: sslConfiguredAgent })
  if (!response.ok) {
    throw new Error(`Failed to get supported diagram types from ${url}`);
  }

  const data = await response.json() as any;
  const supportedDiagramTypes = Object.keys(data.version).filter(
    (key) => key !== "kroki",
  );
  return supportedDiagramTypes;
}

function encodeDiagram(source) {
  const data = Buffer.from(source, "utf8");
  const compressed = pako.deflate(data, { level: 9 });
  return Buffer.from(compressed)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}
