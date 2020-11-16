import * as Command from "./command";
import * as logger from "./logger";
import * as rimraf from "rimraf";

/**
 * Storageして利用するリポジトリの情報
 */
export interface Config {
  baseUrl: "https://github.com" | string;
  baseSsh: "git@github.com" | string;
  owner: string;
  repo: string;
  branch: string;
}

export interface Params {
  cmd: Command.Type;
  protocol: "ssh" | "https";
  config: Config;
  workingDir: string;
}

export interface IO {
  /**
   * Set up the target Git repository in your local directory.
   */
  setup: () => Promise<void>;
  /**
   * Make sure your git directory is clean.
   */
  isClean: () => Promise<boolean>;
  /**
   * Add the local changes to the stage.
   * (git add -A)
   */
  save: () => Command.Shell.Type;
  /**
   * Git commit.
   */
  commit: (message: string) => Command.Shell.Type;
  /**
   * Git push.
   */
  push: (branch?: string) => Command.Shell.Type;
  /**
   * Clear the working directory.
   */
  clear: () => void;
}

export const create = ({ cmd: git, config, protocol, workingDir }: Params): IO => {
  return {
    setup: async () => {
      await git.clone({
        owner: config.owner,
        repo: config.repo,
        branch: config.branch,
        baseUrl: config.baseUrl,
        baseSsh: config.baseSsh,
        protocol: protocol,
        outputDir: workingDir,
      });
    },
    isClean: async () => {
      const { stdout } = await git.getStatus();
      return !!stdout.match(/nothing to commit, working tree clean/);
    },
    save: () => git.addAll(),
    commit: (message = "chore: update data") => git.commit(message),
    push: (branch = "origin") => git.push(branch, config.branch),
    clear: () => {
      rimraf.sync(workingDir);
      logger.log(`Delete: ${workingDir}`);
    },
  };
};
