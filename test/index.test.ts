import { Probot, Application } from 'probot';
import commands, {Callback} from '..';

describe('commands', () => {
  let callback: jest.Mock<{}>;
  let probot: Probot;

  beforeEach(() => {
    callback = jest.fn();
    probot = new Probot({ id: 123, cert: 'test' })

    const app = probot.load((app: Application) => {
      commands(app, 'foo', callback as Callback)
    })

    app.app = () => 'test'
  })

  it('invokes callback and passes command logic', async () => {
    await probot.receive({
      name: 'issue_comment',
      payload: {
        action: 'created',
        comment: { body: 'hello world\n\n/foo bar' }
      }
    })

    expect(callback).toHaveBeenCalled()
    expect(callback.mock.calls[0][1]).toEqual({ name: 'foo', arguments: 'bar' })
  })

  it('invokes the command without arguments', async () => {
    await probot.receive({
      name: 'issue_comment',
      payload: {
        action: 'created',
        comment: { body: 'hello world\n\n/foo' }
      }
    })

    expect(callback).toHaveBeenCalled()
    expect(callback.mock.calls[0][1]).toEqual({ name: 'foo', arguments: undefined })
  })

  it('does not call callback for other commands', async () => {
    await probot.receive({
      name: 'issue_comment',
      payload: {
        action: 'created',
        comment: { body: 'hello world\n\n/nope nothing to see' }
      }
    })

    expect(callback).not.toHaveBeenCalled()
  })

  it('does not call callback for superstring matches', async () => {
    await probot.receive({
      name: 'issue_comment',
      payload: {
        action: 'created',
        comment: { body: '/foobar' }
      }
    })

    expect(callback).not.toHaveBeenCalled()
  })

  it('does not call callback for substring matches', async () => {
    await probot.receive({
      name: 'issue_comment',
      payload: {
        action: 'created',
        comment: { body: '/fo' }
      }
    })

    expect(callback).not.toHaveBeenCalled()
  })

  it('invokes command on issue edit', async () => {
    await probot.receive({
      name: 'issue_comment',
      payload: {
        action: 'updated',
        comment: { body: '/foo bar' }
      }
    })

    await probot.receive({
      name: 'issue_comment',
      payload: {
        action: 'deleted',
        comment: { body: '/foo bar' }
      }
    })

    expect(callback).not.toHaveBeenCalled()
  })

  it('invokes command on issues.opened', async () => {
    await probot.receive({
      name: 'issues',
      payload: {
        action: 'opened',
        issue: { body: '/foo bar' }
      }
    })

    expect(callback).toHaveBeenCalled()
    expect(callback.mock.calls[0][1]).toEqual({ name: 'foo', arguments: 'bar' })
  })

  it('invokes command on pull_request.opened', async () => {
    await probot.receive({
      name: 'pull_request',
      payload: {
        action: 'opened',
        issue: { body: '/foo bar' }
      }
    })

    expect(callback).toHaveBeenCalled()
    expect(callback.mock.calls[0][1]).toEqual({ name: 'foo', arguments: 'bar' })
  })
})
