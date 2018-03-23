const compose = require('koa-compose')

class Definition {
  constructor ({name, description, usage, action, matches}) {
    this.name = name
    this.description = description
    this.usage = usage
    this.action = action

    // Override matches function if one is provided
    if (matches) {
      this.matches = matches
    }
  }

  matches (command) {
    return this.name === command.name
  }

  handle (command, next) {
    return this.matches(command) ? this.action(command, next) : next()
  }
}

module.exports = class Command {
  constructor () {
    this.stack = []
  }

  use (middleware) {
    this.stack.push({handle: middleware})
  }

  register (args) {
    this.stack.push(new Definition(args))
  }

  get middleware () {
    return compose(this.stack.map(command => command.handle.bind(command)))
  }

  invoke (command) {
    return this.middleware(command)
  }
}
