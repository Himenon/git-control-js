import * as Command from "./command";
import * as logger from "./logger";
import * as rimraf from "rimraf";

export interface Params extends Omit<Command.CloneParams, "authToken"> {
  cmd: Command.Type;
  authToken?: string;
  workingDir: string;
}

export interface IO {
  /**
   * Set up the target Git repository in your local directory.
   */
  setup: () => Promise<void>;
  /**
   * Set up username and email.
   */
  setConfig: (key: string, value: string, type: "local" | "global" | "system") => Command.Shell.Type;
  /**
   * Make sure your git directory is clean.
   */
  isClean: () => Promise<boolean>;
  /**
   * Add the local changes to the stage.
   * (git add -A)
   */
  addAll: () => Command.Shell.Type;
  /**
   * Git commit.
   */
  createCommit: (message: string) => Command.Shell.Type;
  /**
   * Git push.
   */
  push: (branch?: string) => Command.Shell.Type;
  /**
   * Clear the working directory.
   */
  clear: () => void;
}

export const create = ({ cmd: git, workingDir, ...cloneParams }: Params): IO => {
  return {
    setup: async () => {
      await git.clone({
        ...cloneParams,
        outputDir: workingDir,
      });
    },
    setConfig: git.setConfig,
    isClean: async () => {
      const { stdout } = await git.getStatus();
      return !!stdout.match(/nothing to commit, working tree clean/);
    },
    addAll: () => git.addAll(),
    createCommit: (message = "chore: update data") => git.commit(message),
    push: (remote = "origin", branch = cloneParams.branch) => git.push(remote, branch),
    clear: () => {
      rimraf.sync(workingDir);
      logger.log(`Delete: ${workingDir}`);
    },
  };
};
