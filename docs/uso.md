# Using BionApp Desktop

**Beta.** The app is still under test. There may be code errors and even conceptual ones. Do not use it as a certified clinical system or as the only source of truth. The author (a physician interested in computing, not a professional software engineer) is not liable for damage or loss arising from its use. MIT license.

The interface is available in **English** and **Spanish** (language toggle on the login screen and under Options).

This file covers installation, the data folder, updates and backups. Day-to-day laboratory work is documented inside the app (see [Laboratory manual](#laboratory-manual) below) so the two texts do not drift apart.

## Install (Windows)

1. Open [Releases](https://github.com/GenDoc94/BionApp/releases/latest).
2. Download `BionApp.exe` (portable x64). No installer is required.
3. Put it in a permanent folder (for example `C:\BionApp\`) and create a shortcut if you want one.

The executable **is not signed** (there is no Authenticode certificate). On first launch, Windows SmartScreen may warn you: *More info* → *Run anyway*.

## First launch

1. Choose the **data folder**. `bionapp.sqlite` and `documentos/` are created there.
2. Set a **master code** (admin) used to create users. You can change it later in the app, but only if you still know the code you entered, so write it down.
3. Create the first user and sign in.

The data folder and the master code belong to that installation. Do not choose a temporary folder.

If the folder you pick already contains `bionapp.sqlite`, BionApp uses that database and its existing master code. It does not ask for a new code and it does not replace the file.

From the login screen, **Settings** (master code) lets you point the app at a different folder that already holds `bionapp.sqlite`.

## Laboratory manual

Sample workflow, status colors, actions and roles live in the app: **Options → Manual**. The same text is shown in the language you selected. In short, that tab covers:

- **Work order.** Create samples from **Preselection** (queue requests, then assign a Bionano number) or add and edit them on the **main page**.
- **Sample status.** The icon to the left of the BN number: gray (not started), red (not assessable), yellow (pending), green (done).
- **Actions.** Prepare, Read extracted, Discard, Label, Read labeled, and Pending chip.
- **Other screens.** Quality (shipments, stock, lots, traceability, air filters), Chips, Lots, Calculations, and Options (profile, variables, statistics, documents, export, appearance, manual, authorship and log).
- **Roles.** **User** can view samples. **TEL** can enter and edit laboratory data, but does not see Variables, statistics, export, the change log or the user list. **Administrator** has full access, including roles and the master code in Profile.
- **Edit and save.** **Edit** changes data and status. **Save** confirms. **Cancel** discards everything unsaved, including the status color.

Protocols you upload from Options → Documents are stored in `documentos/` inside the data folder.

## Update

1. Close BionApp.
2. Download the new `BionApp.exe` from Releases and **replace** the previous one.
3. **Do not touch** the data folder. The schema and the documents stay there.

On the start screen, *Check for updates* looks up the latest version published on GitHub.

## Backups

Close the app and copy the **entire** data folder:

- `bionapp.sqlite`
- `bionapp.sqlite-wal` and `bionapp.sqlite-shm` if they exist (WAL mode)
- `documentos/`

To restore, point BionApp at that folder again (or replace its contents). The footer shows when the SQLite database was last changed, which helps you see whether several PCs are using the most recent folder.

## Several PCs

Several computers can use the **same data folder on the network**. SQLite runs in WAL mode. Do not copy the `.sqlite` file while the app is open.

## Limits

- Windows x64 only (portable).
- Everything is local: there is no cloud account and no automatic upload of data.
- It does not replace a certified LIMS or a clinical record system.

## Build from source

Requirement: Node.js 20+ on Windows.

```bash
npm ci
npm test
npm run dist
```

The portable build is written to `release/BionApp.exe`.
