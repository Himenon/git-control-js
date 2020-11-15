import * as Shell from "./shell";
import * as path from "path";
import { existDirectory } from "./filesystem";

export { Shell };

export interface Type {
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
  clone: (params: {
    owner: string;
    repo: string;
    branch: string;
    baseUrl: string;
    baseSsh: string;
    protocol: "ssh" | "https";
    outputDir: string;
  }) => Shell.Type;
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
    console.log("Command: " + "git " + args);
    return Shell.exec("git " + args, cwd);
  };
  return {
    getBranch: (): Shell.Type => git("symbolic-ref --short HEAD"),
    getLatestCommitDate: (): Shell.Type => git(`log --pretty=format:"%ad" -1`),
    getHeadCommitSha: (): Shell.Type => git("rev-parse HEAD"),
    clone: ({ owner, repo, branch, baseUrl, baseSsh, protocol, outputDir }) => {
      if (existDirectory(outputDir)) {
        throw new Error(`Already exist directory: "${outputDir}`);
      }
      if (protocol === "ssh") {
        return git(`clone -b ${branch} ${baseSsh}:${owner}/${repo} ${outputDir}`, path.dirname(outputDir));
      }
      return git(`clone -b ${branch} ${baseUrl}/${owner}/${repo} ${outputDir}`, path.dirname(outputDir));
    },
    getStatus: (): Shell.Type => git("status"),
    push: (remote: string, branch: string): Shell.Type => git(`push ${remote} ${branch}`),
    commit: (message: string): Shell.Type => git(`commit -m '${message}' --no-verify`),
    addAll: () => git("add -A"),
  };
};
