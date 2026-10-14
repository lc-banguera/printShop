let nextCommandId = 0;

export interface Command<TContext> {
  readonly id: string;
  readonly name: string;
  execute(context: TContext): void;
  undo(context: TContext): void;
  redo(context: TContext): void;
  canMerge?(other: Command<TContext>): boolean;
}

export function createCommandId(name: string): string {
  nextCommandId += 1;
  return `${name}-${nextCommandId}`;
}
