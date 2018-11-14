import { Context, Application } from "probot";

type Paramters = { name: string, arguments: string };
type Callback = (context: Context, params: Paramters) => void;

export class Command {
  name: string;
  callback: Callback;

  constructor(name: string, callback: Callback) {
    this.name = name
    this.callback = callback
  }

  get matcher() {
    return /^\/([\w]+)\b *(.*)?$/m
  }

  listener(context: Context) {
    const { comment, issue, pull_request: pr } = context.payload

    const command = (comment || issue || pr).body.match(this.matcher)

    if (command && this.name === command[1]) {
      return this.callback(context, { name: command[1], arguments: command[2] })
    }
  }
}

/**
 * Probot extension to abstract pattern for receiving slash commands in comments.
 *
 * @example
 *
 * // Type `/label foo, bar` in a comment box to add labels
 * commands(robot, 'label', (context, command) => {
 *   const labels = command.arguments.split(/, *\/);
 *   context.github.issues.addLabels(context.issue({labels}));
 * });
 */
export default (app: Application, name: string, callback: Callback) => {
  const command = new Command(name, callback)
  const events = ['issue_comment.created', 'issues.opened', 'pull_request.opened']
  app.on(events, command.listener.bind(command))
}
