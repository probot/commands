# Probot: Commands

> A [Probot](https://github.com/probot/probot) extension that adds slash commands to GitHub.

For example, from a comment box someone could type:

![Slash commands in a comment box](https://user-images.githubusercontent.com/173/30231736-d752e7dc-94b1-11e7-84bf-d8475733d701.png)

A Probot app could then use this extension to listen for the `remind` slash command.

## Installation

```
$ npm install --save probot-commands
```

## Usage

```js
const commands = require('probot-commands')

module.exports = robot => {
  // Type `/label foo, bar` in a comment box for an Issue or Pull Request
  commands(robot, 'label', (context, command) => {
    const labels = command.arguments.split(/, */);
    return context.github.issues.addLabels(context.issue({labels}));
  });
}
```
