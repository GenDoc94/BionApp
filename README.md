# ![BionApp](docs/bionapp-logo.png)

[![Version](https://img.shields.io/github/package-json/v/GenDoc94/BionApp?label=version)](https://github.com/GenDoc94/BionApp/blob/master/CHANGELOG.md)

Desktop application in testing (**beta**) for **Optical Genome Mapping (OGM) sample management** in the laboratory.

**Windows x64 · portable · no cloud account.**

## Download

1. Go to [Releases](https://github.com/GenDoc94/BionApp/releases/latest).
2. Download `BionApp.exe` and run it.

On **first launch** you choose a data folder and a master code. That creates `bionapp.sqlite` and `documentos/`. Full guide: [docs/uso.md](docs/uso.md).

The `.exe` is not signed. If Windows SmartScreen warns you: *More info* → *Run anyway*.

## Cite

[![DOI](https://img.shields.io/badge/DOI-10.5281%2Fzenodo.22116491-blue)](https://doi.org/10.5281/zenodo.22116491)

Use GitHub’s **Cite this repository** button or the [`CITATION.cff`](CITATION.cff) file.

Author: [Juan José Domínguez-García](https://orcid.org/0000-0001-6210-1294) ([GenDoc94](https://github.com/GenDoc94)).

- Concept DOI (cite BionApp): [10.5281/zenodo.22116491](https://doi.org/10.5281/zenodo.22116491)

## Artificial intelligence statement and notice

Artificial intelligence was used to **generate application code**.

The **original software idea**, the **foundations**, the **full architecture** of the app and its **intended use** are by [GenDoc94](https://github.com/GenDoc94) (Juan José Domínguez-García). AI is not the author of the product or of its laboratory design: it is an implementation tool under the author’s direction.

BionApp **was not created by a professional software engineer**, but by a **physician interested in computing**. There may be **code errors and even conceptual ones**. The author **is not liable** for damage, data loss, clinical or laboratory decisions, or any other harm arising from use of this application. It is provided as-is, in beta, under the [MIT license](LICENSE).

This statement also appears on the *Authorship* tab inside the app.

## Requirements to develop

- Node.js 20+
- Windows (portable packaging)

```bash
npm ci
npm test
npm run dist
```

The portable build is written to `release/BionApp.exe`.

## Architecture

- `src/main` — Electron + better-sqlite3 + IPC
- `src/preload` — `window.api`
- `src/renderer` — React (UI)
- `src/shared` — shared types
- `resources/` — app icon

License [MIT](LICENSE). Security: [SECURITY.md](SECURITY.md).
