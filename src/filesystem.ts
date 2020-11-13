import * as fs from "fs";

/** ディレクトリがディレクトリとして存在するか. */
export const existDirectory = (dirname: string): boolean => {
  return fs.existsSync(dirname) && fs.statSync(dirname).isDirectory();
};

/** ディレクトリで在るかどうか. */
export const isDirectory = (dirname: string): boolean => {
  return fs.existsSync(dirname) && fs.statSync(dirname).isDirectory();
};
