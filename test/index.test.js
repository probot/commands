const { createRobot } = require('probot')
const commands = require('..')

function runCommandTests (commandName) {
  let callback
  let robot

  beforeEach(() => {
    callback = jest.fn()
    robot = createRobot({ app: jest.fn().mockReturnValue('test') })
    commands(robot, commandName, callback)
  })

  it('invokes callback and passes command logic', async () => {
    await robot.receive({
      event: 'issue_comment',
      payload: {
        action: 'created',
        comment: { body: `hello world\n\n/${commandName} bar` }
      }
    })

    expect(callback).toHaveBeenCalled()
    expect(callback.mock.calls[0][1]).toEqual({ name: commandName, arguments: 'bar' })
  })

  it('invokes the command without arguments', async () => {
    await robot.receive({
      event: 'issue_comment',
      payload: {
        action: 'created',
        comment: { body: `hello world\n\n/${commandName}` }
      }
    })

    expect(callback).toHaveBeenCalled()
    expect(callback.mock.calls[0][1]).toEqual({ name: commandName, arguments: undefined })
  })

  it('does not call callback for other commands', async () => {
    await robot.receive({
      event: 'issue_comment',
      payload: {
        action: 'created',
        comment: { body: 'hello world\n\n/nope nothing to see' }
      }
    })

    expect(callback).not.toHaveBeenCalled()
  })

  it('does not call callback for superstring matches', async () => {
    await robot.receive({
      event: 'issue_comment',
      payload: {
        action: 'created',
        comment: { body: `/${commandName}bar` }
      }
    })

    expect(callback).not.toHaveBeenCalled()
  })

  it('does not call callback for substring matches', async () => {
    await robot.receive({
      event: 'issue_comment',
      payload: {
        action: 'created',
        comment: { body: '/fo' }
      }
    })

    expect(callback).not.toHaveBeenCalled()
  })

  it('invokes command on issue edit', async () => {
    await robot.receive({
      event: 'issue_comment',
      payload: {
        action: 'updated',
        comment: { body: `/${commandName} bar` }
      }
    })

    await robot.receive({
      event: 'issue_comment',
      payload: {
        action: 'deleted',
        comment: { body: `/${commandName} bar` }
      }
    })

    expect(callback).not.toHaveBeenCalled()
  })

  it('invokes command on issues.opened', async () => {
    await robot.receive({
      event: 'issues',
      payload: {
        action: 'opened',
        issue: { body: `/${commandName} bar` }
      }
    })

    expect(callback).toHaveBeenCalled()
    expect(callback.mock.calls[0][1]).toEqual({ name: commandName, arguments: 'bar' })
  })

  it('invokes command on pull_request.opened', async () => {
    await robot.receive({
      event: 'pull_request',
      payload: {
        action: 'opened',
        issue: { body: `/${commandName} bar` }
      }
    })

    expect(callback).toHaveBeenCalled()
    expect(callback.mock.calls[0][1]).toEqual({ name: commandName, arguments: 'bar' })
  })
}

describe('commands', () => {
  runCommandTests('foo')
})

describe('commands with hyphen', () => {
  runCommandTests('foo-bar')
})
