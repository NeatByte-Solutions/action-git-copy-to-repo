export const KNOWN_HOSTS_WARNING = `
##[warning] Using default known host file (supports GitHub, GitLab, Bitbucket).
Host verification will fail later if other domain is used.
You can use KNOWN_HOSTS_FILE option to fix it.
`;

export const KNOWN_HOSTS_ERROR = `
##[error] Host key verification failed!
This is probably because you forgot to supply a value for KNOWN_HOSTS_FILE
or the file is invalid or doesn't correctly verify the host
`;

export const SSH_KEY_ERROR = `
##[error] Permission denied (publickey)
Make sure that the ssh private key is set correctly, and
that the public key has been added to the target repo
`;
