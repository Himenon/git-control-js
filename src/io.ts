import * as Command from "./command";
import * as logger from "./logger";
import * as rimraf from "rimraf";

/**
 * Storageして利用するリポジトリの情報
 */
export interface RepositoryConfig {
  baseUrl: string;
  baseSshUrl: string;
  owner: string;
  repo: string;
  branch: string;
}

export interface Params {
  git: Command.Type;
  protocol: "ssh" | "https";
  repoConfig: RepositoryConfig;
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

export const create = ({ git, repoConfig, protocol, workingDir }: Params): IO => {
  return {
    setup: async () => {
      await git.clone({
        owner: repoConfig.owner,
        repo: repoConfig.repo,
        branch: repoConfig.branch,
        baseUrl: repoConfig.baseUrl,
        baseSshUrl: repoConfig.baseSshUrl,
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
    push: (branch = "origin") => git.push(branch, repoConfig.branch),
    clear: () => {
      rimraf.sync(workingDir);
      logger.log(`Delete: ${workingDir}`);
    },
  };
};
