import { shell, Type } from "./shell";
import { existDirectory } from "./filesystem";

export { Type };

export interface Command {
  /**
   * 現在のローカルブランチ名を取得する
   * @example "master"
   */
  getBranch: (cwd: string) => Type;
  /**
   * 最新のコミットの日付取得する
   * @example "Mon Oct 28 20:18:16 2019 +0900"
   */
  getLatestCommitDate: (cwd: string) => Type;
  /**
   * Head CommitのShaを取得する
   */
  getHeadCommitSha: (cwd: string) => Type;
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
    baseSshUrl: string;
    protocol: "ssh" | "https";
    outputDir: string;
    cwd: string;
  }) => Type;
  /**
   * `git status`
   */
  getStatus: () => Type;
  /**
   * `git push`
   * @param remote
   * @param branch
   */
  push: (remote: string, branch: string) => Type;
  /**
   * `git commit -m ${message} --no-verify`
   * @param message
   */
  commit: (message: string) => Type;
  /**
   * `git add -A`
   */
  addAll: () => Type;
}

/**
 * gitコマンドを生成する
 * @param pwd コマンド実行ディレクトリ
 */
export const createCommand = (pwd: string): Command => {
  /**
   * @param args `git`コマンドの引数
   * @param cwd `git`コマンド実行ディレクトリ
   */
  const git = (args: string, cwd: string = pwd) => {
    console.log("Command: " + "git " + args);
    return shell("git " + args, cwd);
  };
  return {
    getBranch: (cwd: string): Type => git("symbolic-ref --short HEAD", cwd),
    getLatestCommitDate: (cwd: string): Type => git(`log --pretty=format:"%ad" -1`, cwd),
    getHeadCommitSha: (cwd: string): Type => git("rev-parse HEAD", cwd),
    clone: ({ owner, repo, branch, baseUrl, baseSshUrl, protocol, outputDir, cwd }) => {
      if (existDirectory(outputDir)) {
        throw new Error(`Already exist directory: "${outputDir}`);
      }
      if (protocol === "ssh") {
        return git(`clone -b ${branch} ${baseSshUrl}:${owner}/${repo} ${outputDir}`, cwd);
      }
      return git(`clone -b ${branch} ${baseUrl}/${owner}/${repo} ${outputDir}`, cwd);
    },
    getStatus: (): Type => git("status"),
    push: (remote: string, branch: string): Type => git(`push ${remote} ${branch}`),
    commit: (message: string): Type => git(`commit -m '${message}' --no-verify`),
    addAll: () => git("add -A"),
  };
};
