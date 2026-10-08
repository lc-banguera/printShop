export type DesignerKeyboardCommand =
  | "undo"
  | "redo"
  | "copy"
  | "cut"
  | "paste"
  | "duplicate"
  | "delete"
  | "deselect"
  | "move-left"
  | "move-right"
  | "move-up"
  | "move-down"
  | "select-all"
  | "save";

export type DesignerToolShortcut =
  | "select"
  | "move"
  | "direct-select"
  | "pen"
  | "crop"
  | "text"
  | "zoom"
  | "hand";

const commandsByShortcut: Readonly<Record<string, DesignerKeyboardCommand>> = {
  "mod+z": "undo",
  "mod+shift+z": "redo",
  "mod+y": "redo",
  "mod+c": "copy",
  "mod+x": "cut",
  "mod+v": "paste",
  "mod+d": "duplicate",
  "delete": "delete",
  "backspace": "delete",
  "escape": "deselect",
  "arrowleft": "move-left",
  "shift+arrowleft": "move-left",
  "arrowright": "move-right",
  "shift+arrowright": "move-right",
  "arrowup": "move-up",
  "shift+arrowup": "move-up",
  "arrowdown": "move-down",
  "shift+arrowdown": "move-down",
  "mod+a": "select-all",
  "mod+s": "save",
};

const toolsByShortcut: Readonly<Record<string, DesignerToolShortcut>> = {
  v: "select",
  m: "move",
  a: "direct-select",
  p: "pen",
  c: "crop",
  t: "text",
  z: "zoom",
  h: "hand",
};

export function resolveDesignerKeyboardCommand(
  event: Pick<
    KeyboardEvent,
    "key" | "ctrlKey" | "metaKey" | "shiftKey" | "altKey"
  >,
): DesignerKeyboardCommand | null {
  if (event.altKey) return null;
  const key = event.key.toLowerCase();
  const shortcut = event.ctrlKey || event.metaKey
    ? `mod+${event.shiftKey ? "shift+" : ""}${key}`
    : `${event.shiftKey ? "shift+" : ""}${key}`;
  return commandsByShortcut[shortcut] ?? null;
}

export function resolveDesignerToolShortcut(
  event: Pick<KeyboardEvent, "key" | "ctrlKey" | "metaKey" | "shiftKey" | "altKey">,
): DesignerToolShortcut | null {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return null;
  return toolsByShortcut[event.key.toLowerCase()] ?? null;
}
