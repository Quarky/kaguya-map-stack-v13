# Kaguya Starport Map Stack — Foundry VTT v13

A small dependency/meta module for the Android / Shadow of the Beanstalk Kaguya campaign.

It **does not redistribute any third-party map art**. Instead it:

- declares useful free map modules as Foundry `requires` dependencies;
- declares paid/Marketplace map modules as `recommends` dependencies;
- scans enabled Scene compendia for spaceport, terminal, hangar, military, lunar, industrial, security, laboratory, and maintenance maps;
- previews matches before importing;
- imports copies into `Kaguya — External Maps` and provider subfolders;
- stores the source compendium UUID in flags so repeat runs skip duplicates;
- never modifies or deletes the source map modules or compendia.

## Foundry version

- Minimum: Foundry VTT 13
- Verified: Foundry VTT 13
- Maximum: Foundry VTT 13
- System: intended for `genesys`, though imported Scenes themselves are system-neutral.

## Required free dependencies

Foundry should prompt to install/enable these when this module is installed/enabled:

- `fragmaps-free` — FragMaps Cyberpunk Battlemaps
- `maps-in-cyberspace` — Maps in Cyberspace
- `miskasmaps` — Miska's Maps Battlemap Pack
- `mapdoctor-free-bundle` — Map Doctor Free Bundle

## Recommended dependencies

These are not forced because some are commercial/Marketplace products and require ownership:

- `moonlight-maps-sci-fi-strange-worlds-collection-1`
- `mmp-scifi-beyond-earth-map-pack-walled`
- `mmp-scifi-garrisons-map-pack-walled`
- `tc-modern`
- `sci-fi-map-tiles`
- `sci-fi-map-tiles-ii`

The two Studio WyldFurr tile modules primarily provide art assets rather than pre-built Scene compendia, so the importer may find zero Scenes in them; they are included as map-building dependencies only.

## Import maps

Enable the provider modules in the world, then as GM open the browser developer console and run:

```js
await game.kaguyaMapStack.preview();
```

Review the console table. Then import:

```js
await game.kaguyaMapStack.importRelevantMaps();
```

The importer is repeat-safe. Already imported source UUIDs are skipped.

To delete only the imported world copies:

```js
await game.kaguyaMapStack.removeImportedMaps();
```

The original module compendia remain untouched.

## Why not auto-import on every load?

The importer is deliberately manual/non-destructive. Campaign edits to imported Scenes are preserved and are not overwritten every time Foundry starts.

## Installing from GitHub

Use this manifest URL directly in Foundry VTT v13:

`https://raw.githubusercontent.com/Quarky/kaguya-map-stack-v13/main/module.json`

The manifest downloads the current packaged module from:

`https://raw.githubusercontent.com/Quarky/kaguya-map-stack-v13/main/kaguya-map-stack-v13.zip`

Tagged releases may also be published later through the included GitHub Actions workflow.

## Licensing

Code in this repository may be used under the MIT License. Third-party modules, map art, and premium content remain under their own authors' licenses and are never included in this repository.
