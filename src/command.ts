import { EOL } from "os";
import * as Shell from "./shell";
import * as path from "path";
import { generateHttpBaseAccessUrl } from "./utils";
import { existDirectory } from "./filesystem";

export { Shell };

export interface CloneOption {
  owner: string;
  repo: string;
  branch: string;
  baseUrl: "https://github.com" | string;
  baseSsh: "git@github.com" | string;
  protocol: "ssh" | "https";
  outputDir: string;
  authToken?: string;
}

export interface SetConfigOption {
  key: string;
  value: string;
  type?: "local" | "global" | "system";
}

export interface CliOption {
  cwd?: string;
}

export interface GitRevListOption {
  remotes?: string;
  branches?: string;
}

export interface UpdateRemoteOption {
  owner: string;
  repo: string;
  remote: string;
  authToken: string;
}

export interface PushOption {
  remote: string;
  branch: string;
}

export interface CommitOption {
  shortMessage: string;
}

export interface AddOption {
  all?: boolean;
  file?: string;
}

export interface FetchOption {
  target: string;
}

export interface Type<T> {
  /**
   * git config --${type} ${key} ${value}
   */
  setConfig: (option: SetConfigOption) => T;
  /**
   *
   */
  updateRemote: (option: UpdateRemoteOption) => T;
  /**
   * 現在のローカルブランチ名を取得する
   * @example "master"
   */
  getBranch: (option: CliOption) => T;
  /**
   * 最新のコミットの日付取得する
   * @example "Mon Oct 28 20:18:16 2019 +0900"
   */
  getLatestCommitDate: (option: CliOption) => T;
  /**
   * Head CommitのShaを取得する
   */
  getHeadCommitSha: (option: CliOption) => T;
  /**
   * `git clone`
   *
   * @param owner オーナー
   * @param repo リポジトリ名
   * @param outputDir 出力先
   * @param branch ブランチ名
   * @param baseUrl GitHub EnterPriseなどのBaseUrl
   */
  clone: (option: CloneOption) => T;
  /**
   * git rev-list HEAD
   */
  getRevListHead: (params: GitRevListOption) => T;
  /**
   * `git status`
   */
  getStatus: (option?: CliOption) => T;
  /**
   * `git push`
   * @param remote
   * @param branch
   */
  push: (option: PushOption) => T;
  /**
   * `git commit -m ${message} --no-verify`
   * @param message
   */
  commit: (option: CommitOption) => T;
  /**
   * `git add -A`
   */
  add: (option: AddOption) => T;
  /**
   * git fetch [target]
   */
  fetch: (option: FetchOption) => T;
}

/**
 * gitコマンドを生成する
 * @param pwd コマンド実行ディレクトリ
 */
export const create = (workingDir: string): Type<Shell.Type> => {
  /**
   * @param args `git`コマンドの引数
   */
  const git = (args: string, cwd = workingDir) => {
    process.stdout.write("Command: " + "git " + args + EOL);
    return Shell.exec("git " + args, cwd);
  };
  return {
    setConfig: ({ key, value, type = "local" }) => {
      return git(`config --${type} ${key} ${value}`);
    },
    updateRemote: ({ owner, repo, remote, authToken }) => {
      const url = generateHttpBaseAccessUrl({ authToken, owner, repo });
      try {
        return git(`remote set-url ${remote} ${url}`);
      } catch (error) {
        git(`remote rm ${remote}`);
        return git(`remote add ${remote} ${url}`);
      }
    },
    getRevListHead: (option?: GitRevListOption): Shell.Type => {
      const options: string[] = [];
      const command = "rev-list HEAD";
      if (!option) {
        return git(command);
      }
      if (option.branches) {
        options.push(`--branches="${option.branches}"`);
      }
      if (option.remotes) {
        options.push(`--remotes="${option.remotes}"`);
      }
      return git([command, ...options].join(" "));
    },
    getBranch: ({ cwd }): Shell.Type => git("symbolic-ref --short HEAD", cwd),
    getLatestCommitDate: ({ cwd }): Shell.Type => git(`log --pretty=format:"%ad" -1`, cwd),
    getHeadCommitSha: ({ cwd }): Shell.Type => git("rev-parse HEAD", cwd),
    clone: ({ owner, repo, branch, baseUrl, baseSsh, protocol, outputDir, authToken }) => {
      if (existDirectory(outputDir)) {
        throw new Error(`Already exist directory: "${outputDir}`);
      }
      if (protocol === "ssh") {
        return git(`clone -b ${branch} ${baseSsh}:${owner}/${repo} ${outputDir}`, path.dirname(outputDir));
      }
      if (authToken) {
        const url = generateHttpBaseAccessUrl({ authToken, owner, repo });
        return git(`clone -b ${branch} ${url} ${outputDir}`, path.dirname(outputDir));
      }
      return git(`clone -b ${branch} ${baseUrl}/${owner}/${repo} ${outputDir}`, path.dirname(outputDir));
    },
    getStatus: (): Shell.Type => git("status"),
    push: ({ remote, branch }: PushOption): Shell.Type => git(`push ${remote} ${branch}`),
    commit: ({ shortMessage }: CommitOption): Shell.Type => git(`commit -m '${shortMessage}' --no-verify`),
    add: ({ all, file }: AddOption) => {
      if (all) {
        return git("add -A");
      }
      if (file) {
        return git(`add ${file}`);
      }
      return git("add -A");
    },
    fetch: ({ target }) => git(`fetch ${target}`),
  };
};
