import execa from "execa";

export type Type = execa.ExecaChildProcess<string>;

export const exec = (command: string, cwd: string = process.cwd()): execa.ExecaChildProcess<string> => {
  return execa(command, {
    stdio: ["pipe", "pipe", "inherit"],
    shell: true,
    cwd,
  });
};
