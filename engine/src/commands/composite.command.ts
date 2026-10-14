import { createCommandId, type Command } from './command';

export class CompositeCommand<TContext> implements Command<TContext> {
  readonly id = createCommandId('composite');

  constructor(
    readonly name: string,
    private readonly commands: Command<TContext>[]
  ) {}

  execute(context: TContext): void {
    for (const command of this.commands) command.execute(context);
  }

  undo(context: TContext): void {
    for (const command of [...this.commands].reverse()) command.undo(context);
  }

  redo(context: TContext): void {
    for (const command of this.commands) command.redo(context);
  }
}
