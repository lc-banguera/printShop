import type { Command } from './command';

export class CommandSystem<TContext> {
  private commands: Command<TContext>[] = [];
  private currentIndex = -1;

  execute(command: Command<TContext>, context: TContext): void {
    command.execute(context);
    this.commands = [...this.commands.slice(0, this.currentIndex + 1), command];
    this.currentIndex = this.commands.length - 1;
  }

  undo(context: TContext): boolean {
    const command = this.commands[this.currentIndex];
    if (!command) return false;

    command.undo(context);
    this.currentIndex -= 1;
    return true;
  }

  redo(context: TContext): boolean {
    const command = this.commands[this.currentIndex + 1];
    if (!command) return false;

    command.redo(context);
    this.currentIndex += 1;
    return true;
  }

  getHistoryIndex(): number {
    return this.currentIndex;
  }

  canUndo(): boolean {
    return this.currentIndex >= 0;
  }

  canRedo(): boolean {
    return this.currentIndex < this.commands.length - 1;
  }
}
