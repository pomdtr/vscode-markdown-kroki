import pako from "pako";
import { workspace } from "vscode";

export function activate() {
  return {
    extendMarkdownIt(md) {
      const config = workspace.getConfiguration("markdown-kroki");
      const fence = md.renderer.rules.fence.bind(md.renderer.rules);
      md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
        const token = tokens[idx];
        if (supportedDiagramTypes.includes(token.info.toLowerCase())) {
          const encodedDiagram = encodeDiagram(token.content.trim());
          return `<p><img src="${config.get("url", "https://kroki.io")}/${
            token.info
          }/svg/${encodedDiagram}"></p>`;
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
