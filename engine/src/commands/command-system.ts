import type { Command } from './command';
import { CommandHistory } from '../history/command-history';

export class CommandSystem<TContext> {
  private readonly history = new CommandHistory<TContext>();

  execute(command: Command<TContext>, context: TContext): void {
    command.execute(context);
    this.history.push(command);
  }

  undo(context: TContext): boolean {
    return this.history.undo(context);
  }

  redo(context: TContext): boolean {
    return this.history.redo(context);
  }

  getHistoryIndex(): number {
    return this.history.getHistoryIndex();
  }

  canUndo(): boolean {
    return this.history.canUndo();
  }

  canRedo(): boolean {
    return this.history.canRedo();
  }
}
