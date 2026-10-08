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
