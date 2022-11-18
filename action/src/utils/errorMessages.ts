export const KNOWN_HOSTS_WARNING = `
##[warning] KNOWN_HOSTS_FILE not set
This will probably mean that host verification will fail later on
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
