const { createRobot } = require('probot')
const commands = require('..')

describe('commands', () => {
  let callback
  let robot

  beforeEach(() => {
    callback = jest.fn()
    robot = createRobot({ app: jest.fn().mockReturnValue('test') })
    commands(robot, 'foo', callback)
  })

  it('invokes callback and passes command logic', async () => {
    await robot.receive({
      event: 'issue_comment',
      payload: {
        action: 'created',
        comment: { body: 'hello world\n\n/foo bar' }
      }
    })

    expect(callback).toHaveBeenCalled()
    expect(callback.mock.calls[0][1]).toEqual({ name: 'foo', arguments: 'bar' })
  })

  it('invokes the command without arguments', async () => {
    await robot.receive({
      event: 'issue_comment',
      payload: {
        action: 'created',
        comment: { body: 'hello world\n\n/foo' }
      }
    })

    expect(callback).toHaveBeenCalled()
    expect(callback.mock.calls[0][1]).toEqual({ name: 'foo', arguments: undefined })
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
        comment: { body: '/foobar' }
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
        comment: { body: '/foo bar' }
      }
    })

    await robot.receive({
      event: 'issue_comment',
      payload: {
        action: 'deleted',
        comment: { body: '/foo bar' }
      }
    })

    expect(callback).not.toHaveBeenCalled()
  })

  it('invokes command on issues.opened', async () => {
    await robot.receive({
      event: 'issues',
      payload: {
        action: 'opened',
        issue: { body: '/foo bar' }
      }
    })

    expect(callback).toHaveBeenCalled()
    expect(callback.mock.calls[0][1]).toEqual({ name: 'foo', arguments: 'bar' })
  })

  it('invokes command on pull_request.opened', async () => {
    await robot.receive({
      event: 'pull_request',
      payload: {
        action: 'opened',
        issue: { body: '/foo bar' }
      }
    })

    expect(callback).toHaveBeenCalled()
    expect(callback.mock.calls[0][1]).toEqual({ name: 'foo', arguments: 'bar' })
  })
})

describe('custom-format', () => {
  let callback
  let robot

  beforeEach(() => {
    callback = jest.fn()
    robot = createRobot({ app: jest.fn().mockReturnValue('test') })
    commands.setCommandFormat(/^@probot (\w+)\b *(.*)?$/m)
    commands(robot, 'foo', callback)
  })

  it('invokes callback and passes command logic', async () => {
    await robot.receive({
      event: 'issue_comment',
      payload: {
        action: 'created',
        comment: { body: 'hello world\n\n@probot foo bar' }
      }
    })

    expect(callback).toHaveBeenCalled()
    expect(callback.mock.calls[0][1]).toEqual({ name: 'foo', arguments: 'bar' })
  })

  it('invokes the command without arguments', async () => {
    await robot.receive({
      event: 'issue_comment',
      payload: {
        action: 'created',
        comment: { body: 'hello world\n\n@probot foo' }
      }
    })

    expect(callback).toHaveBeenCalled()
    expect(callback.mock.calls[0][1]).toEqual({ name: 'foo', arguments: undefined })
  })

  it('does not call callback for other commands', async () => {
    await robot.receive({
      event: 'issue_comment',
      payload: {
        action: 'created',
        comment: { body: 'hello world\n\n@probot nope no /foo see' }
      }
    })

    expect(callback).not.toHaveBeenCalled()
  })

  it('does not call callback for superstring command matches', async () => {
    await robot.receive({
      event: 'issue_comment',
      payload: {
        action: 'created',
        comment: { body: '@probot foobar' }
      }
    })

    expect(callback).not.toHaveBeenCalled()
  })

  it('does not call callback for superstring wakeword matches', async () => {
    await robot.receive({
      event: 'issue_comment',
      payload: {
        action: 'created',
        comment: { body: '@probots foobar' }
      }
    })

    expect(callback).not.toHaveBeenCalled()
  })

  it('does not call callback for command substring matches', async () => {
    await robot.receive({
      event: 'issue_comment',
      payload: {
        action: 'created',
        comment: { body: '@probot fo' }
      }
    })

    expect(callback).not.toHaveBeenCalled()
  })

  it('does not call callback for wakeword substring matches', async () => {
    await robot.receive({
      event: 'issue_comment',
      payload: {
        action: 'created',
        comment: { body: '@pro foo' }
      }
    })

    expect(callback).not.toHaveBeenCalled()
  })
})
