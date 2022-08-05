import pako from "pako";
import { workspace } from "vscode";

export function activate() {
  return {
    extendMarkdownIt(md) {
      const config = workspace.getConfiguration("markdown-kroki");
      const highlight = md.options.highlight;
      md.options.highlight = (code: string, lang: string) => {
        if (supportedDiagramTypes.includes(lang.toLowerCase())) {
          const encodedDiagram = encodeDiagram(code);
          return `<img src="${config.get(
            "url",
            "https://kroki.io"
          )}/${lang}/svg/${encodedDiagram}">`;
        }
        return highlight(code, lang);
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
