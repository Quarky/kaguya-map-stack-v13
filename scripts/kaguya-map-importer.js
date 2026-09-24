const MODULE_ID = "kaguya-map-stack-v13";
const IMPORT_FLAG = "sourceSceneUuid";
const IMPORT_FOLDER = "Kaguya — External Maps";

const PROVIDERS = [
  {
    "id": "fragmaps-free",
    "label": "FragMaps Cyberpunk Battlemaps",
    "tier": "required-free",
    "maxScenes": 8,
    "include": [
      "server",
      "security",
      "office",
      "corporate",
      "industrial",
      "warehouse",
      "garage",
      "factory",
      "lab",
      "street",
      "apartment",
      "clinic"
    ],
    "exclude": [
      "desert",
      "wasteland",
      "forest",
      "beach"
    ]
  },
  {
    "id": "maps-in-cyberspace",
    "label": "Maps in Cyberspace",
    "tier": "required-free",
    "maxScenes": 12,
    "include": [
      "station",
      "hangar",
      "hanger",
      "bay",
      "dock",
      "cargo",
      "terminal",
      "security",
      "engineering",
      "reactor",
      "bridge",
      "control",
      "corridor",
      "maintenance",
      "lab",
      "medical",
      "storage",
      "industrial",
      "shuttle",
      "spaceport"
    ],
    "exclude": []
  },
  {
    "id": "miskasmaps",
    "label": "Miska's Maps - Battlemap Pack",
    "tier": "required-free",
    "maxScenes": 8,
    "include": [
      "space",
      "sci-fi",
      "scifi",
      "station",
      "hangar",
      "hanger",
      "dock",
      "ship",
      "lab",
      "industrial",
      "facility",
      "bunker",
      "control"
    ],
    "exclude": [
      "fantasy",
      "dungeon",
      "forest",
      "tavern"
    ]
  },
  {
    "id": "mapdoctor-free-bundle",
    "label": "Map Doctor: Free Bundle",
    "tier": "required-free",
    "maxScenes": 8,
    "include": [
      "space",
      "station",
      "sci-fi",
      "scifi",
      "modern",
      "industrial",
      "lab",
      "warehouse",
      "terminal",
      "airport",
      "security",
      "facility"
    ],
    "exclude": [
      "fantasy",
      "castle",
      "forest",
      "swamp",
      "temple"
    ]
  },
  {
    "id": "moonlight-maps-sci-fi-strange-worlds-collection-1",
    "label": "Moonlight Maps SciFi - Strange Worlds 1",
    "tier": "recommended-premium",
    "maxScenes": 10,
    "include": [
      "sky port",
      "long range shuttle",
      "mars habitation",
      "remote outpost",
      "forward outpost",
      "cargo runner",
      "valley station",
      "deep sea lab",
      "frozen drill site"
    ],
    "exclude": []
  },
  {
    "id": "mmp-scifi-beyond-earth-map-pack-walled",
    "label": "Beyond Earth - Map Pack (Walled)",
    "tier": "recommended-premium",
    "maxScenes": 10,
    "include": [
      "moon base",
      "moon terrain",
      "iss",
      "mars base",
      "mars terrain",
      "docking"
    ],
    "exclude": []
  },
  {
    "id": "mmp-scifi-garrisons-map-pack-walled",
    "label": "SciFi Military Garrisons - Map Pack (Walled)",
    "tier": "recommended-premium",
    "maxScenes": 12,
    "include": [
      "hangar",
      "hanger",
      "hangar control",
      "hanger control",
      "security",
      "bridge",
      "workshop",
      "engineering",
      "medical",
      "officer",
      "crew",
      "air tower",
      "land tower",
      "command"
    ],
    "exclude": [
      "water tower",
      "swamp"
    ]
  },
  {
    "id": "tc-modern",
    "label": "TC Modern",
    "tier": "recommended-premium",
    "maxScenes": 8,
    "include": [
      "terminal",
      "airport",
      "security",
      "office",
      "warehouse",
      "industrial",
      "lab",
      "station",
      "garage",
      "control"
    ],
    "exclude": [
      "residential",
      "suburb",
      "park"
    ]
  }
];

function packageIdForPack(pack) {
  return pack?.metadata?.packageName ?? pack?.metadata?.package ?? pack?.metadata?.packageId ?? "";
}

function normalizeName(s) {
  return String(s ?? "").normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function scoreName(name, rule) {
  const n = normalizeName(name);
  let score = 0;
  for (const term of rule.include ?? []) {
    const t = normalizeName(term);
    if (t && n.includes(t)) score += Math.max(2, t.split(" ").length * 2);
  }
  for (const term of rule.exclude ?? []) {
    const t = normalizeName(term);
    if (t && n.includes(t)) score -= 50;
  }
  return score;
}

function moduleStatus(rule) {
  const mod = game.modules.get(rule.id);
  return {
    id: rule.id,
    label: rule.label,
    tier: rule.tier,
    installed: Boolean(mod),
    active: Boolean(mod?.active),
    version: mod?.version ?? mod?.data?.version ?? null
  };
}

async function scenePacksFor(rule) {
  return game.packs.filter(p => p.documentName === "Scene" && packageIdForPack(p) === rule.id);
}

async function findCandidates(options={}) {
  const all = [];
  for (const rule of PROVIDERS) {
    const status = moduleStatus(rule);
    if (!status.installed || !status.active) continue;
    const packs = await scenePacksFor(rule);
    const candidates = [];
    for (const pack of packs) {
      let index;
      try {
        index = await pack.getIndex({fields:["name"]});
      } catch (err) {
        console.warn(`[Kaguya Maps] Could not index ${pack.collection}`, err);
        continue;
      }
      for (const entry of index) {
        const score = scoreName(entry.name, rule);
        if (score <= 0) continue;
        candidates.push({
          providerId: rule.id,
          providerLabel: rule.label,
          tier: rule.tier,
          packId: pack.collection,
          packLabel: pack.metadata?.label ?? pack.title ?? pack.collection,
          sceneId: entry._id,
          sceneName: entry.name,
          score,
          uuid: `Compendium.${pack.collection}.Scene.${entry._id}`
        });
      }
    }
    candidates.sort((a,b) => b.score-a.score || a.sceneName.localeCompare(b.sceneName));
    all.push(...candidates.slice(0, options.limitPerProvider ?? rule.maxScenes ?? 10));
  }
  return all;
}

async function ensureFolder(name=IMPORT_FOLDER, parent=null) {
  let folder = game.folders.find(f => f.type === "Scene" && f.name === name && (f.folder?.id ?? f.folder ?? null) === (parent?.id ?? parent ?? null));
  if (!folder) folder = await Folder.create({name, type:"Scene", folder: parent?.id ?? parent ?? null, sorting:"a"});
  return folder;
}

async function preview(options={}) {
  if (!game.user.isGM) return ui.notifications.warn("Kaguya map import requires a GM user.");
  const statuses = PROVIDERS.map(moduleStatus);
  const candidates = await findCandidates(options);
  console.group("Kaguya map importer — module status");
  console.table(statuses);
  console.groupEnd();
  console.group(`Kaguya map importer — ${candidates.length} candidate scenes`);
  console.table(candidates.map(c => ({provider:c.providerLabel, pack:c.packLabel, scene:c.sceneName, score:c.score})));
  console.groupEnd();
  const inactive = statuses.filter(s => s.installed && !s.active).length;
  const missing = statuses.filter(s => !s.installed).length;
  ui.notifications.info(`Kaguya preview: ${candidates.length} matching scenes. ${inactive} installed-but-disabled provider(s), ${missing} missing. See console.`);
  return {statuses, candidates};
}

async function importRelevantMaps(options={}) {
  if (!game.user.isGM) return ui.notifications.warn("Kaguya map import requires a GM user.");
  const candidates = await findCandidates(options);
  if (!candidates.length) {
    ui.notifications.warn("No matching Scene compendia found. Make sure the map modules are installed and enabled.");
    return {created:[], skipped:[], errors:[]};
  }
  const root = await ensureFolder();
  const created = [], skipped = [], errors = [];
  for (const c of candidates) {
    const existing = game.scenes.find(s => s.getFlag(MODULE_ID, IMPORT_FLAG) === c.uuid);
    if (existing && !options.force) { skipped.push({...c, existingId:existing.id}); continue; }
    try {
      const pack = game.packs.get(c.packId);
      const source = await pack?.getDocument(c.sceneId);
      if (!source) throw new Error(`Scene not found in ${c.packId}`);
      let providerFolder = game.folders.find(f => f.type === "Scene" && f.name === c.providerLabel && (f.folder?.id ?? f.folder ?? null) === root.id);
      if (!providerFolder) providerFolder = await ensureFolder(c.providerLabel, root);
      const data = source.toObject();
      delete data._id;
      data.folder = providerFolder.id;
      data.name = `${c.sceneName} — Kaguya source`;
      data.flags ??= {};
      data.flags[MODULE_ID] = {
        sourceSceneUuid: c.uuid,
        sourceModule: c.providerId,
        sourcePack: c.packId,
        originalName: c.sceneName,
        importedByVersion: game.modules.get(MODULE_ID)?.version ?? "standalone",
        importedAt: new Date().toISOString()
      };
      const scene = await Scene.create(data, {renderSheet:false});
      created.push({...c, worldSceneId:scene.id});
    } catch (err) {
      console.error(`[Kaguya Maps] Failed importing ${c.sceneName} from ${c.providerLabel}`, err);
      errors.push({...c, error:String(err?.message ?? err)});
    }
  }
  ui.notifications.info(`Kaguya import complete: ${created.length} created, ${skipped.length} already present, ${errors.length} error(s).`);
  console.group("Kaguya map import results"); console.table(created); console.table(skipped); if (errors.length) console.table(errors); console.groupEnd();
  return {created, skipped, errors};
}

async function removeImportedMaps() {
  if (!game.user.isGM) return ui.notifications.warn("Kaguya map cleanup requires a GM user.");
  const targets = game.scenes.filter(s => Boolean(s.getFlag(MODULE_ID, IMPORT_FLAG)));
  if (!targets.length) return ui.notifications.info("No Kaguya-imported external scenes found.");
  await Scene.deleteDocuments(targets.map(s => s.id));
  ui.notifications.info(`Removed ${targets.length} Kaguya-imported external scene(s). Original compendia were not changed.`);
  return targets.length;
}

function reportModules() {
  const rows = PROVIDERS.map(moduleStatus);
  console.table(rows);
  return rows;
}

export const KaguyaMapImporter = { PROVIDERS, preview, importRelevantMaps, removeImportedMaps, reportModules };

Hooks.once("init", () => {
  game.settings.register(MODULE_ID, "welcomeShown", {scope:"world", config:false, type:Boolean, default:false});
});

Hooks.once("ready", async () => {
  game.kaguyaMapStack = KaguyaMapImporter;
  if (!game.user.isGM) return;
  const shown = game.settings.get(MODULE_ID, "welcomeShown");
  if (!shown) {
    await game.settings.set(MODULE_ID, "welcomeShown", true);
    ui.notifications.info("Kaguya Map Stack ready. Run game.kaguyaMapStack.preview() in the console, then game.kaguyaMapStack.importRelevantMaps().");
  }
});
