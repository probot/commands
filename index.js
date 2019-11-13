class Command {
  constructor (name, callback) {
    this.name = name
    this.callback = callback
  }

  get matcher () {
    return /^\/([\w]+)\b *(.*)?$/m
  }

  listener (context) {
    const { comment, issue, pull_request: pr } = context.payload

    const commands = (comment || issue || pr).body.split('\n').map(line => {
      return line.match(this.matcher)
    })

    commands.forEach(command => {
      if (command && this.name === command[1]) {
        this.callback(context, { name: command[1], arguments: command[2] })
      }
    })
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
module.exports = (robot, name, callback) => {
  const command = new Command(name, callback)
  const events = ['issue_comment.created', 'issues.opened', 'pull_request.opened']
  robot.on(events, command.listener.bind(command))
}

module.exports.Command = Command
