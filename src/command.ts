import { EOL } from "os";
import * as Shell from "./shell";
import * as path from "path";
import { generateHttpBaseAccessUrl } from "./utils";
import { existDirectory } from "./filesystem";

export { Shell };

export interface CloneParams {
  owner: string;
  repo: string;
  branch: string;
  baseUrl: "https://github.com" | string;
  baseSsh: "git@github.com" | string;
  protocol: "ssh" | "https";
  outputDir: string;
  authToken?: string;
}

export interface Type {
  setConfig: (key: string, value: string, type?: "local" | "global" | "system") => Shell.Type;
  updateAuthRemoteOrigin: (authToken: string) => Shell.Type;
  /**
   * 現在のローカルブランチ名を取得する
   * @example "master"
   */
  getBranch: (cwd: string) => Shell.Type;
  /**
   * 最新のコミットの日付取得する
   * @example "Mon Oct 28 20:18:16 2019 +0900"
   */
  getLatestCommitDate: (cwd: string) => Shell.Type;
  /**
   * Head CommitのShaを取得する
   */
  getHeadCommitSha: (cwd: string) => Shell.Type;
  /**
   * `git clone`
   *
   * @param owner オーナー
   * @param repo リポジトリ名
   * @param outputDir 出力先
   * @param branch ブランチ名
   * @param baseUrl GitHub EnterPriseなどのBaseUrl
   */
  clone: (params: CloneParams) => Shell.Type;
  /**
   * `git status`
   */
  getStatus: () => Shell.Type;
  /**
   * `git push`
   * @param remote
   * @param branch
   */
  push: (remote: string, branch: string) => Shell.Type;
  /**
   * `git commit -m ${message} --no-verify`
   * @param message
   */
  commit: (message: string) => Shell.Type;
  /**
   * `git add -A`
   */
  addAll: () => Shell.Type;
}

/**
 * gitコマンドを生成する
 * @param pwd コマンド実行ディレクトリ
 */
export const create = (workingDir: string): Type => {
  /**
   * @param args `git`コマンドの引数
   */
  const git = (args: string, cwd = workingDir) => {
    process.stdout.write("Command: " + "git " + args + EOL);
    return Shell.exec("git " + args, cwd);
  };
  return {
    setConfig: (key, value, type = "local") => {
      return git(`config --${type} ${key} ${value}`);
    },
    updateAuthRemoteOrigin: (authToken: string) => {
      const url = generateHttpBaseAccessUrl({ authToken, owner, repo });
      try {
        git(`remote rm origin`);
        return git(`remote add origin ${url}`);
      } catch (error) {
        return git(`remote set-url origin ${url}`);
      }
    },
    getBranch: (): Shell.Type => git("symbolic-ref --short HEAD"),
    getLatestCommitDate: (): Shell.Type => git(`log --pretty=format:"%ad" -1`),
    getHeadCommitSha: (): Shell.Type => git("rev-parse HEAD"),
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
    push: (remote: string, branch: string): Shell.Type => git(`push ${remote} ${branch}`),
    commit: (message: string): Shell.Type => git(`commit -m '${message}' --no-verify`),
    addAll: () => git("add -A"),
  };
};
