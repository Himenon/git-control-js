import * as Command from "./command";

export const wrapAsync = <T extends unknown[]>(fn: (...args: T) => Command.Shell.Type): ((...args: T) => Promise<string>) => {
  const wrapFunc = async (...args: T): Promise<string> => {
    const result = await fn(...args);
    return result.stdout;
  };
  return wrapFunc;
};

export const create = (workingDir: string): Command.Type<Promise<string>> => {
  const git = Command.create(workingDir);
  return {
    setConfig: wrapAsync(git.setConfig),
    updateRemote: wrapAsync(git.updateRemote),
    getBranch: wrapAsync(git.getBranch),
    getLatestCommitDate: wrapAsync(git.getLatestCommitDate),
    getHeadCommitSha: wrapAsync(git.getHeadCommitSha),
    clone: wrapAsync(git.clone),
    getRevListHead: wrapAsync(git.getRevListHead),
    getStatus: wrapAsync(git.getStatus),
    push: wrapAsync(git.push),
    commit: wrapAsync(git.commit),
    add: wrapAsync(git.add),
  };
};
