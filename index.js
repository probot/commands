class Command {
  constructor (name, callback) {
    this.name = name
    this.callback = callback
  }

  get matcher () {
    return this._matcher
  }

  listener (context) {
    const { comment, issue, pull_request: pr } = context.payload

    const command = (comment || issue || pr).body.match(this.matcher)

    if (command && this.name === command[1]) {
      return this.callback(context, { name: command[1], arguments: command[2] })
    }
  }
}

Command.prototype._matcher = /^\/([\w]+)\b *(.*)?$/m

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
module.exports = (robot, name, callback) => {
  const command = new Command(name, callback)
  const events = ['issue_comment.created', 'issues.opened', 'pull_request.opened']
  robot.on(events, command.listener.bind(command))
}

module.exports.Command = Command

module.exports.setCommandFormat = (fmt) => {
  Command.prototype._matcher = fmt
}
