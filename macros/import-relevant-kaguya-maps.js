// Kaguya Starport External Map Importer — Foundry VTT v13
// Paste into a Script Macro. The kaguya-map-stack-v13 module is preferred,
// but this macro also works standalone when its provider modules are enabled.

if (game.kaguyaMapStack?.importRelevantMaps) {
  await game.kaguyaMapStack.preview();
  await game.kaguyaMapStack.importRelevantMaps();
} else {
  ui.notifications.warn("Kaguya Map Stack module is not active. Install/enable it first, or use scripts/kaguya-map-importer.js as a module.");
}
