# Markdown Kroki

Adds diagram support to VS Code's builtin markdown preview using [Kroki](https://kroki.io/).

![A mermaid diagram in VS Code's built-in markdown preview](https://github.com/pomdtr/vscode-markdown-kroki/raw/master/docs/example.png)

## Usage

Create diagrams in markdown using fenced code blocks:

````markdown
```mermaid
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
```
````

Supported formats:

- actdiag
- blockdiag
- bpmn
- bytefield
- c4plantuml
- d2
- dbml
- diagramsnet
- ditaa
- erd
- excalidraw
- graphviz
- mermaid
- nomnoml
- nwdiag
- packetdiag
- pikchr
- plantuml
- rackdiag
- seqdiag
- structurizr
- svgbob
- umlet
- vega
- vegalite
- wavedrom
- wireviz
