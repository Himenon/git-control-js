export interface AuthParams {
  authToken: string;
  owner: string;
  repo: string;
}

/**
 * HTTP-based Git access by an installation
 * https://developer.github.com/apps/building-github-apps/authenticating-with-github-apps/#http-based-git-access-by-an-installation
 */
export const generateHttpBaseAccessUrl = ({ authToken, owner, repo }: AuthParams): string => {
  return `https://x-access-token:${authToken}@github.com/${owner}/${repo}.git`;
};
