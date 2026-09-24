// Kaguya Starport map importer convenience script for Foundry VTT v13.
// Run this as a Script Macro after enabling kaguya-map-stack-v13.
// The module performs the actual non-destructive provider scan and Scene imports.

if (!game.user.isGM) {
  ui.notifications.warn("Kaguya map import requires a GM user.");
} else if (!game.kaguyaMapStack?.importRelevantMaps) {
  ui.notifications.warn("Kaguya Map Stack is not active. Install and enable kaguya-map-stack-v13 first.");
} else {
  const preview = await game.kaguyaMapStack.preview();
  console.log("Kaguya import preview", preview);
  await game.kaguyaMapStack.importRelevantMaps();
}
