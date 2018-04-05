const Command = require('..')

describe('Commands', () => {
  let commands
  let testCommand

  beforeEach(() => {
    commands = new Command()

    testCommand = {
      name: 'test',
      action: jest.fn()
    }
  })

  describe('use', () => {
    test('calls middleware before command', async () => {
      let called = false
      commands.use((command, next) => {
        called = true
        return next()
      })
      commands.register(testCommand)
      await commands.invoke({name: 'test'})

      expect(called).toBe(true)
    })

    test('allows middlware to halt execution', async () => {
      commands.use((command, next) => {
        // does not call next()
      })
      commands.register(testCommand)
      await commands.invoke({name: 'test'})

      expect(testCommand.action).not.toHaveBeenCalled()
    })

    test('can catch errors', async () => {
      commands.use(async (command, next) => {
        try {
          await next()
        } catch (err) {
          return 'rescued'
        }
      })
      commands.register({
        name: 'test',
        action: () => {
          throw new Error()
        }
      })

      expect(await commands.invoke({name: 'test'})).toEqual('rescued')
    })
  })

  describe('invoke', () => {
    test('calls command with args passed', async () => {
      commands.register(testCommand)
      const cmd = {name: 'test'}
      await commands.invoke(cmd)
      expect(testCommand.action).toHaveBeenCalledWith(cmd, expect.anything())
    })

    test('does not call command with different name', async () => {
      commands.register(testCommand)
      await commands.invoke({name: 'nope'})
      expect(testCommand.action).not.toHaveBeenCalled()
    })

    test('returns response value from command', async () => {
      commands.register(testCommand)
      testCommand.action.mockReturnValue('hello world')
      expect(await commands.invoke({name: 'test'})).toEqual('hello world')
    })
  })

  describe('register', () => {
    test('can define a custom matcher', async () => {
      const action = jest.fn()

      commands.register({
        name: 'custom-matcher',
        matches: (command) => command.args[0],
        action
      })

      await commands.invoke({name: 'anything', args: [false]})
      expect(action).not.toHaveBeenCalled()

      await commands.invoke({name: 'anything', args: [true]})
      expect(action).toHaveBeenCalled()
    })
  })
})
