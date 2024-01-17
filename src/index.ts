import pako from "pako";
import { workspace } from "vscode";
import * as vscode from 'vscode';
import fetch from "node-fetch";

const config = workspace.getConfiguration("markdown-kroki");

export function activate() {
  let channel = vscode.window.createOutputChannel("markdown-kroki");

  let url = config.get<string>("url", "https://kroki.io");
  let supportedDiagramTypes = staticSupportedDiagramTypes;

  // Listen for configuration changes
  vscode.workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration("markdown-kroki")) {
      // The setting has been changed, update it
      url = config.get<string>("url", "https://kroki.io");
      channel.appendLine(`URL updated: ${url}`);
      getSupportedDiagramTypes(url, channel).then(function (data: string[]) {
        supportedDiagramTypes = data;
      });
    }
  });

  getSupportedDiagramTypes(url, channel).then(function (data: string[]) {
    supportedDiagramTypes = data;
  });

  return {
    extendMarkdownIt(md) {
      const fence = md.renderer.rules.fence.bind(md.renderer.rules);
      const diagramPrefix = config.get<string>("prefix", "").toLowerCase();

      md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
        const token = tokens[idx];

        const diagramType = (() => {
          var tokenName = token.info.toLowerCase();
          if (tokenName.indexOf(diagramPrefix) == 0) {
            return tokenName.slice(diagramPrefix.length);
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
            "Skipping fence " + diagramType + ". Unknown type"
          );
        }
        return fence(tokens, idx, options, env, slf);
      };
      return md;
    },
  };
}

async function getSupportedDiagramTypes(
  url: string,
  channel: vscode.OutputChannel
): Promise<string[]> {
  let supportedDiagramTypes = staticSupportedDiagramTypes;

  let data;
  const healthURL = `${url}/v1/health`;
  channel.appendLine("Fetching known types from " + healthURL);

  const response = await fetch(healthURL);
  if (!response.ok) {
    channel.appendLine(
      "Error fetching supported document types, will use hardcoded list"
    );
    channel.appendLine("HTTP Error: " + response.status);
    return;
  }

  data = await response.json();

  supportedDiagramTypes = Object.keys(data.version).filter(
    (key) => key !== "kroki"
  );
  channel.appendLine("Setting supported types to: " + supportedDiagramTypes);
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

const staticSupportedDiagramTypes = [
  "actdiag",
  "blockdiag",
  "bpmn",
  "bytefield",
  "c4plantuml",
  "d2",
  "dbml",
  "diagramsnet",
  "ditaa",
  "erd",
  "excalidraw",
  "graphviz",
  "mermaid",
  "nomnoml",
  "nwdiag",
  "packetdiag",
  "pikchr",
  "plantuml",
  "rackdiag",
  "seqdiag",
  "structurizr",
  "svgbob",
  "umlet",
  "vega",
  "vegalite",
  "wavedrom",
];
