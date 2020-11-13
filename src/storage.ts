import * as fs from "fs";
import * as Git from "./git";
import * as logger from "./logger";

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
  git: Git.Command;
  protocol: "ssh" | "https";
  repoConfig: RepositoryConfig;
  workingDir: string;
}

export interface Storage {
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
  save: () => Git.Type;
  /**
   * Git commit.
   */
  commit: (message: string) => Git.Type;
  /**
   * Git push.
   */
  push: (branch?: string) => Git.Type;
  /**
   * Clear the working directory.
   */
  clear: () => void;
}

export const create = ({ git, repoConfig, protocol, workingDir }: Params): Storage => {
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
        cwd: process.cwd(),
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
      fs.unlinkSync(workingDir);
      logger.log(`Delete: ${workingDir}`);
    },
  };
};
