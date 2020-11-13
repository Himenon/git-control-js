import { EOL } from "os";

export const log = (message: string): void => {
  process.stdout.write(message + EOL);
};
