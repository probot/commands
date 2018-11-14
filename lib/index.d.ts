import { Context, Application } from "probot";
export declare type Paramters = {
    name: string;
    arguments: string;
};
export declare type Callback = (context: Context, params: Paramters) => void;
export declare class Command {
    name: string;
    callback: Callback;
    constructor(name: string, callback: Callback);
    readonly matcher: RegExp;
    listener(context: Context): void;
}
declare const _default: (app: Application, name: string, callback: Callback) => void;
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
export default _default;
