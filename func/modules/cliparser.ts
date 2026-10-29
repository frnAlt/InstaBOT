export interface CommandParams {
  args: string[];
  flags: Record<string, string | boolean>;
}

export interface CommandConfig {
  handler: (params: CommandParams) => string | unknown;
  description: string;
  usage: string;
  subcommands: Record<string, SubcommandConfig>;
}

export interface SubcommandConfig {
  handler: (params: CommandParams) => string;
  description: string;
  usage: string;
}

/**
 * CLIParser class for managing and parsing commands, subcommands, and flags.
 */
export class CLIParser {
  private commands: Record<string, CommandConfig>;

  constructor() {
    this.commands = {};
  }

  /**
   * Registers a new top-level command.
   * @param params The parameters for the command.
   */
  registerCommand({
    command,
    handler,
    description = "",
    usage = "",
  }: {
    command: string;
    handler: (params: CommandParams) => string | unknown;
    description?: string;
    usage?: string;
  }): void {
    this.commands[command] = {
      handler,
      description,
      usage,
      subcommands: {},
    };
  }

  /**
   * Registers a subcommand under a parent command.
   * @param params The parameters for the subcommand.
   * @returns void or error message
   */
  registerSubcommand({
    command,
    subcommand,
    handler,
    description = "",
    usage = "",
  }: {
    command: string;
    subcommand: string;
    handler: (params: CommandParams) => string;
    description?: string;
    usage?: string;
  }): void | string {
    if (this.commands[command]) {
      this.commands[command].subcommands[subcommand] = {
        handler,
        description,
        usage,
      };
    } else {
      return `Command ${command} does not exist.`;
    }
  }

  /**
   * Executes a command handler with provided flags.
   * @param commandName The name of the command or subcommand to execute.
   * @param flags The flags passed to the command (key-value pairs).
   * @returns Output message
   */
  executeCommand(
    commandName: string,
    flags: Record<string, string | boolean>
  ): string {
    const [command, subcommand] = commandName.split(" ");

    if (!this.commands[command]) {
      return `Unknown command: ${command}`;
    }

    if (subcommand && this.commands[command].subcommands[subcommand]) {
      return this.commands[command].subcommands[subcommand].handler({
        args: [command, subcommand],
        flags,
      });
    }

    return this.commands[command].handler({ args: [command], flags }) as string;
  }

  /**
   * Parses an input string, identifies the command/subcommand/flags, and executes the respective handler.
   * @param input The input string containing the command, subcommand, and flags.
   * @returns Output message
   */
  async parse(input: string): Promise<string> {
    const args = input.trim().split(" ");
    const command = args[0];
    const subcommand = args[1];
    const flags: Record<string, string | boolean> = {};

    if (!this.commands[command]) {
      return `casscli: ${command}: command not found`;
    }

    for (let i = 1; i < args.length; i++) {
      if (args[i].startsWith("--")) {
        const flag = args[i].slice(2);
        const value =
          i + 1 < args.length && !args[i + 1].startsWith("--")
            ? args[i + 1]
            : true;
        flags[flag] = value;
        if (value !== true) i++;
      }
    }

    if (subcommand && this.commands[command].subcommands[subcommand]) {
      return this.commands[command].subcommands[subcommand].handler({
        args,
        flags,
      });
    }

    return this.commands[command].handler({ args, flags }) as string;
  }

  /**
   * Displays help information for a specific command or all commands.
   * @param command The name of the command for which to show help. If null, shows all commands.
   * @returns Help information
   */
  showHelp(command: string | null = null): string {
    let output = "";
    if (command) {
      if (this.commands[command]) {
        output += `Command: **${command}**\nDescription: ${this.commands[command].description}\nUsage: ${this.commands[command].usage}\n`;
        for (const subcommand in this.commands[command].subcommands) {
          output += `  Subcommand: ${subcommand} - ${this.commands[command].subcommands[subcommand].description}\nUsage: ${this.commands[command].subcommands[subcommand].usage}\n\n`;
        }
      } else {
        output += `Unknown command: ${command}\n`;
      }
    } else {
      for (const command in this.commands) {
        output += `**${command}** - ${this.commands[command].description}\nUsage: ${this.commands[command].usage}\n\n`;
      }
    }
    return output;
  }
}
