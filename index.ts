import { Context, Probot, WebhookPayloadWithRepository } from "probot";
import { WebhookEvents } from "@octokit/webhooks";

declare type ProbotHandlerContext = Omit<Context<WebhookPayloadWithRepository>, keyof WebhookEvents>;

interface CommandsContext {
    command: string,
    args: string[]
}

type CommandHandler = (context: ProbotHandlerContext, commanderCtx: CommandsContext) => void

class Command {
    constructor(name: string, callback: CommandHandler, separator: string = " ") {
        this.name = name
        this.callback = callback
        this.sep = separator
    }

    name: string;
    sep: string;
    callback: CommandHandler;

    get matcher(): RegExp {
        return /^\/([\w]+)\b *(.*)?$/m
    }

    listener(context: ProbotHandlerContext) {
        const { comment, issue, pull_request: pr } = context.payload

        const command = (comment || issue || pr).body.match(this.matcher)

        context.log.info({ command, comment, issue, pr })
        if (command && this.name === command[1]) {
            const args = command[2] ? command[2].split(this.sep) : []
            return this.callback(context, { command: command[1], args: args })
        }
    }
}


function commands(robot: Probot, name: string, callback: CommandHandler) {
    const command = new Command(name, callback)
    const binded = command.listener.bind(command)
    // TODO: Put it in a list, example:
    // robot.on(['issue_comment.created','issues.opened','pull_request.opened'], binded)
    robot.on('issue_comment.created', binded)
    robot.on('issues.opened', binded)
    robot.on('pull_request.opened', binded)
}

export { commands, Command, CommandHandler }