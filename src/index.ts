import pako from "pako";
import { workspace } from "vscode";
import * as vscode from 'vscode';

export function activate() {
  return {
    extendMarkdownIt(md) {
      const config = workspace.getConfiguration("markdown-kroki");

      const fence = md.renderer.rules.fence.bind(md.renderer.rules);
      const diagramPrefix = config.get<string>("prefix", "").toLowerCase();
      const url = config.get<string>("url", "https://kroki.io");
    
      md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
        const token = tokens[idx]

        const diagramType = (() => {
          var tokenName = token.info.toLowerCase();
          if (tokenName.indexOf(diagramPrefix) == 0) {
            return tokenName.slice(diagramPrefix.length);
          } else {
            return ""; // Prefix not found, so not our token.
          }
        })();

        if (supportedDiagramTypes.includes(diagramType)) {
          const encodedDiagram = encodeDiagram(token.content.trim());
          return `<p><img src="${url}/${diagramType}/svg/${encodedDiagram}"></p>`;
        }
        return fence(tokens, idx, options, env, slf);
      };
      return md;
    },
  };
}

function encodeDiagram(source) {
  const data = Buffer.from(source, "utf8");
  const compressed = pako.deflate(data, { level: 9 });
  return Buffer.from(compressed)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

const supportedDiagramTypes = [
  "actdiag",
  "blockdiag",
  "bpmn",
  "bytefield",
  "c4plantuml",
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
