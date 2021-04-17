import { Probot, ProbotOctokit } from 'probot'
import { commands } from '../index'

describe('commands', () => {
  let callback: any;
  let robot: Probot;

  beforeEach(() => {
    callback = jest.fn()

    robot = new Probot({
      githubToken: "test",
      // @ts-ignore
      // Disable Probot logs to be a cleaner output in stdout
      logLevel: 'silent',
      // Disable throttling & retrying requests for easier testing
      Octokit: ProbotOctokit.defaults({
        retry: { enabled: false },
        throttle: { enabled: false },
      }),
    });

    commands(robot, 'foo', callback)
  })

  it('invokes callback and passes command logic', async () => {
    await robot.receive({
      id: '1',
      name: 'issue_comment',
      payload: {
        action: 'created',
        comment: { body: 'hello world\n\n/foo bar' }
      }
    })

    expect(callback).toHaveBeenCalled()
    expect(callback.mock.calls[0][1]).toEqual({ command: 'foo', args: ['bar'] })
  })

  it('invokes the command without arguments', async () => {
    await robot.receive({
      id: '1',
      name: 'issue_comment',
      payload: {
        action: 'created',
        comment: { body: 'hello world\n\n/foo' }
      }
    })

    expect(callback).toHaveBeenCalled()
    expect(callback.mock.calls[0][1]).toEqual({ command: 'foo', args: [] })
  })

  it('does not call callback for other commands', async () => {
    await robot.receive({
      id: '1',
      name: 'issue_comment',
      payload: {
        action: 'created',
        comment: { body: 'hello world\n\n/nope nothing to see' }
      }
    })

    expect(callback).not.toHaveBeenCalled()
  })

  it('does not call callback for superstring matches', async () => {
    await robot.receive({
      id: '1',
      name: 'issue_comment',
      payload: {
        action: 'created',
        comment: { body: '/foobar' }
      }
    })

    expect(callback).not.toHaveBeenCalled()
  })

  it('does not call callback for substring matches', async () => {
    await robot.receive({
      id: '1',
      name: 'issue_comment',
      payload: {
        action: 'created',
        comment: { body: '/fo' }
      }
    })

    expect(callback).not.toHaveBeenCalled()
  })

  it('invokes command on issue edit', async () => {
    await robot.receive({
      id: '1',
      name: 'issue_comment',
      payload: {
        action: 'updated',
        comment: { body: '/foo bar' }
      }
    })

    await robot.receive({
      id: '1',
      name: 'issue_comment',
      payload: {
        action: 'deleted',
        comment: { body: '/foo bar' }
      }
    })

    expect(callback).not.toHaveBeenCalled()
  })

  it('invokes command on issues.opened', async () => {
    await robot.receive({
      id: '1',
      name: 'issues',
      payload: {
        action: 'opened',
        issue: { body: '/foo bar' }
      }
    })

    expect(callback).toHaveBeenCalled()
    expect(callback.mock.calls[0][1]).toEqual({ command: 'foo', args: ['bar'] })
  })

  it('invokes command on pull_request.opened', async () => {
    await robot.receive({
      id: '1',
      name: 'pull_request',
      payload: {
        action: 'opened',
        issue: { body: '/foo bar' }
      }
    })

    expect(callback).toHaveBeenCalled()
    expect(callback.mock.calls[0][1]).toEqual({ command: 'foo', args: ['bar'] })
  })
})
