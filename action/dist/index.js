module.exports =
/******/ (function(modules, runtime) { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete installedModules[moduleId];
/******/ 		}
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	__webpack_require__.ab = __dirname + "/";
/******/
/******/ 	// the startup function
/******/ 	function startup() {
/******/ 		// Load entry module and return exports
/******/ 		return __webpack_require__(861);
/******/ 	};
/******/
/******/ 	// run startup
/******/ 	return startup();
/******/ })
/************************************************************************/
/******/ ({

/***/ 87:
/***/ (function(module) {

module.exports = require("os");

/***/ }),

/***/ 110:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.killSshProcesses = exports.setupSshKeys = void 0;
const path = __importStar(__webpack_require__(622));
const processUtils_1 = __webpack_require__(961);
// RegEx to extract SSH_AGENT_PID
const SSH_AGENT_PID_EXTRACT = /SSH_AGENT_PID=([0-9]+);/;
const createExecOpts = (context, envAppend, cwd) => {
    const { log } = context;
    const childEnv = Object.assign({}, process.env, envAppend);
    return {
        log,
        cwd,
        env: childEnv,
    };
};
const setupSshKeysForRepo = async (context, repoData, tempFolder, tempRepoFolder) => {
    const { log } = context;
    const SSH_AUTH_SOCK = path.join(tempFolder, 'ssh_agent.sock');
    let execOpts = createExecOpts(context, {
        SSH_AUTH_SOCK,
    });
    // Setup ssh-agent with private key
    log.log(`Setting up ssh-agent on ${SSH_AUTH_SOCK}`);
    const sshAgentMatch = SSH_AGENT_PID_EXTRACT.exec((await (0, processUtils_1.exec)(`ssh-agent -a ${SSH_AUTH_SOCK}`, execOpts)).stdout);
    if (!sshAgentMatch) {
        throw new Error('Unexpected output from ssh-agent');
    }
    log.log(`Adding private key to ssh-agent at ${SSH_AUTH_SOCK}`);
    // add PID to execOpts
    execOpts = createExecOpts(context, {
        SSH_AGENT_PID: sshAgentMatch[1],
        SSH_AUTH_SOCK,
    }, tempRepoFolder);
    // TODO: tune writeToProcess func to use execOpts object
    await (0, processUtils_1.writeToProcess)('ssh-add', ['-'], {
        data: repoData.sshPrivateKey + '\n',
        log,
        env: execOpts.env,
    });
    log.log(`Private key added to ssh agent at ${SSH_AUTH_SOCK}`);
    return execOpts;
};
const setupSshKeys = async (context) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    const { log } = context;
    if ((_b = (_a = context.config) === null || _a === void 0 ? void 0 : _a.src) === null || _b === void 0 ? void 0 : _b.sshPrivateKey) {
        log.log(`##[info] Setting ssh key for src repo`);
        const execOpts = await setupSshKeysForRepo(context, (_c = context.config) === null || _c === void 0 ? void 0 : _c.src, ((_d = context.temp) === null || _d === void 0 ? void 0 : _d.srcTempFolder) || '', ((_e = context.temp) === null || _e === void 0 ? void 0 : _e.srcTempRepo) || '');
        context.exec.srcExecOpt = execOpts;
    }
    else {
        context.exec.srcExecOpt = {
            log,
            cwd: ((_f = context.temp) === null || _f === void 0 ? void 0 : _f.srcTempRepo) || '',
            env: process.env,
        };
    }
    if ((_h = (_g = context.config) === null || _g === void 0 ? void 0 : _g.target) === null || _h === void 0 ? void 0 : _h.sshPrivateKey) {
        log.log(`##[info] Setting ssh key for target repo`);
        const execOpts = await setupSshKeysForRepo(context, (_j = context.config) === null || _j === void 0 ? void 0 : _j.target, ((_k = context.temp) === null || _k === void 0 ? void 0 : _k.targetTempFolder) || '', ((_l = context.temp) === null || _l === void 0 ? void 0 : _l.srcTempRepo) || '');
        context.exec.targetExecOpt = execOpts;
    }
    else {
        context.exec.targetExecOpt = {
            log,
            cwd: ((_m = context.temp) === null || _m === void 0 ? void 0 : _m.targetTempRepo) || '',
            env: process.env,
        };
    }
};
exports.setupSshKeys = setupSshKeys;
const killSshProcesses = async (context) => {
    var _a, _b, _c, _d;
    const { log } = context;
    if ((_b = (_a = context.config) === null || _a === void 0 ? void 0 : _a.src) === null || _b === void 0 ? void 0 : _b.sshPrivateKey) {
        log.log(`##[info] Killing ssh-agent for src repo`);
        await (0, processUtils_1.exec)(`ssh-agent -k`, context.exec.srcExecOpt);
    }
    if ((_d = (_c = context.config) === null || _c === void 0 ? void 0 : _c.target) === null || _d === void 0 ? void 0 : _d.sshPrivateKey) {
        log.log(`##[info] Killing ssh-agent for target repo`);
        await (0, processUtils_1.exec)(`ssh-agent -k`, context.exec.targetExecOpt);
    }
};
exports.killSshProcesses = killSshProcesses;
//# sourceMappingURL=ssh.js.map

/***/ }),

/***/ 129:
/***/ (function(module) {

module.exports = require("child_process");

/***/ }),

/***/ 205:
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const config = async (env, context) => {
    // TODO: Validation, use yup schema
    var _a, _b;
    context.config = {
        src: {
            sshRepo: env.SRC_SSH_REPO,
            // sshPrivateKey: env.SRC_SSH_PRIVATE_KEY,
            sshPrivateKey: (_a = env.SRC_SSH_PRIVATE_KEY) === null || _a === void 0 ? void 0 : _a.replace(/\\n/g, '\n'),
            githubRepo: env.SRC_GITHUB_REPO,
            githubToken: env.SRC_GITHUB_TOKEN,
            branch: env.SRC_BRANCH,
        },
        target: {
            sshRepo: env.TARGET_SSH_REPO,
            // sshPrivateKey: env.TARGET_SSH_PRIVATE_KEY,
            sshPrivateKey: (_b = env.TARGET_SSH_PRIVATE_KEY) === null || _b === void 0 ? void 0 : _b.replace(/\\n/g, '\n'),
            githubRepo: env.TARGET_GITHUB_REPO,
            githubToken: env.TARGET_GITHUB_TOKEN,
            branch: env.TARGET_BRANCH,
            baseBranch: env.TARGET_BASE_BRANCH || 'master',
        },
        commit: {
            message: env.COMMIT_MESSAGE,
            author: env.COMMIT_AUTHOR,
            authorEmail: env.COMMIT_AUTHOR_EMAIL,
        },
        knownHostsFile: env.KNOWN_HOSTS_FILE,
    };
};
exports.config = config;
//# sourceMappingURL=config.js.map

/***/ }),

/***/ 444:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.checkout = void 0;
const processUtils_1 = __webpack_require__(961);
const errorMessages_1 = __webpack_require__(788);
class NoSuchBranchError extends Error {
    constructor(branch, repo) {
        super(`Failed to checkout branch "${branch}" from repository "${repo}"`);
    }
}
const clone = async ({ context, repoData, execOpts }) => {
    const { log } = context;
    const repo = (repoData === null || repoData === void 0 ? void 0 : repoData.sshPrivateKey)
        ? (repoData === null || repoData === void 0 ? void 0 : repoData.sshRepo) || ''
        : `https://x-access-token:${repoData === null || repoData === void 0 ? void 0 : repoData.githubToken}@github.com/${repoData === null || repoData === void 0 ? void 0 : repoData.githubRepo}.git`;
    log.log(`##[info] Cloning the repo: git clone "${repo}"`);
    try {
        // check if "." is working same as "tempFolder"
        await (0, processUtils_1.exec)(`git clone "${repo}" ${execOpts.cwd}`, {
            log,
            env: execOpts === null || execOpts === void 0 ? void 0 : execOpts.env,
        });
    }
    catch (err) {
        const s = err.toString();
        if (repoData === null || repoData === void 0 ? void 0 : repoData.sshPrivateKey) {
            if (s.indexOf('Host key verification failed') !== -1) {
                log.error(errorMessages_1.KNOWN_HOSTS_ERROR);
            }
            else if (s.indexOf('Permission denied (publickey') !== -1) {
                log.error(errorMessages_1.SSH_KEY_ERROR);
            }
        }
        throw err;
    }
};
const checkIfBranchExists = async (branch, repo, execOpts) => {
    try {
        // Fetch branch if it exists
        await (0, processUtils_1.exec)(`git fetch -u origin ${branch}:${branch}`, execOpts);
        // Check if branch already exists
        const branchCheck = await (0, processUtils_1.exec)(`git branch --list "${branch}"`, execOpts);
        if (branchCheck.stdout.trim() === '') {
            throw new NoSuchBranchError(branch, repo);
        }
    }
    catch (err) {
        const s = err.toString();
        if (s.indexOf("Couldn't find remote ref") === -1) {
            throw new NoSuchBranchError(branch, repo);
        }
        else {
            throw err;
        }
    }
};
const checkoutBranch = async ({ context, repoData, execOpts }) => {
    const { log } = context;
    const branch = (repoData === null || repoData === void 0 ? void 0 : repoData.branch) || 'master';
    const repo = (repoData === null || repoData === void 0 ? void 0 : repoData.sshRepo) || (repoData === null || repoData === void 0 ? void 0 : repoData.githubRepo) || '';
    log.log(`##[info] Checkout branch "${branch}"`);
    try {
        await checkIfBranchExists(branch, repo, execOpts);
        // Checkout branch
        await (0, processUtils_1.exec)(`git checkout "${branch}"`, execOpts);
    }
    catch (err) {
        if (err instanceof NoSuchBranchError) {
            log.error(`##[warning] Failed to fetch a branch "${branch}", probably doesn't exist`);
        }
        throw err;
    }
};
const createNewBranch = async ({ context, repoData, execOpts }) => {
    const { log } = context;
    log.log(`##[info] ${repoData === null || repoData === void 0 ? void 0 : repoData.branch} does not exist, creating new one`);
    try {
        // Checkout base branch if specified
        if (repoData === null || repoData === void 0 ? void 0 : repoData.baseBranch) {
            await checkoutBranch({
                context,
                repoData: { ...repoData, branch: repoData === null || repoData === void 0 ? void 0 : repoData.baseBranch },
                execOpts,
            });
        }
        // Create new branch
        await (0, processUtils_1.exec)(`git checkout -b "${repoData === null || repoData === void 0 ? void 0 : repoData.branch}"`, execOpts);
    }
    catch (err) {
        if (err instanceof NoSuchBranchError) {
            log.error(`##[warning] Failed to fetch a base branch "${repoData === null || repoData === void 0 ? void 0 : repoData.baseBranch}", probably doesn't exist`);
        }
        throw err;
    }
};
const switchOrCreateBranch = async (props) => {
    try {
        // Try to checkout branch
        await checkoutBranch(props);
    }
    catch (err) {
        if (err instanceof NoSuchBranchError) {
            // Create new branch if it does not exists yet
            await createNewBranch(props);
        }
        else {
            throw err;
        }
    }
};
const checkoutSrc = async (params) => {
    // Clone source repo
    await clone(params);
    // Switch to source branch
    await checkoutBranch(params);
};
const checkoutTarget = async (params) => {
    // Clone target repo
    await clone(params);
    // Switch to target branch or create new one if such doesn't exist
    await switchOrCreateBranch(params);
};
const checkout = async (context) => {
    var _a, _b;
    const srcParams = {
        context,
        repoData: (_a = context.config) === null || _a === void 0 ? void 0 : _a.src,
        execOpts: context.exec.srcExecOpt,
    };
    const targetParams = {
        context,
        repoData: (_b = context.config) === null || _b === void 0 ? void 0 : _b.target,
        execOpts: context.exec.targetExecOpt,
    };
    await checkoutSrc(srcParams);
    await checkoutTarget(targetParams);
};
exports.checkout = checkout;
//# sourceMappingURL=checkout.js.map

/***/ }),

/***/ 482:
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.createContext = void 0;
const createContext = async (log) => {
    const context = {
        log,
        temp: {},
        exec: {
            srcExecOpt: { log, env: process.env },
            targetExecOpt: { log, env: process.env },
        },
    };
    return context;
};
exports.createContext = createContext;
//# sourceMappingURL=context.js.map

/***/ }),

/***/ 526:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
const context_1 = __webpack_require__(482);
// TODO: do not use default exports for steps
const config_1 = __webpack_require__(205);
const tempFolders_1 = __webpack_require__(897);
const ssh_1 = __webpack_require__(110);
const checkout_1 = __webpack_require__(444);
const main = async (env = process.env, log) => {
    const context = await (0, context_1.createContext)(log);
    // process and validate config
    await (0, config_1.config)(env, context);
    // calculate paths that use temp directories
    await (0, tempFolders_1.prepareTempFolders)(context);
    // if needed setup ssh keys for git access
    await (0, ssh_1.setupSshKeys)(context);
    // Clone branches
    await (0, checkout_1.checkout)(context);
    // Kill ssh processes if private keys were installed
    await (0, ssh_1.killSshProcesses)(context);
};
exports.main = main;
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 622:
/***/ (function(module) {

module.exports = require("path");

/***/ }),

/***/ 747:
/***/ (function(module) {

module.exports = require("fs");

/***/ }),

/***/ 788:
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.SSH_KEY_ERROR = exports.KNOWN_HOSTS_ERROR = exports.KNOWN_HOSTS_WARNING = void 0;
exports.KNOWN_HOSTS_WARNING = `
##[warning] KNOWN_HOSTS_FILE not set
This will probably mean that host verification will fail later on
`;
exports.KNOWN_HOSTS_ERROR = `
##[error] Host key verification failed!
This is probably because you forgot to supply a value for KNOWN_HOSTS_FILE
or the file is invalid or doesn't correctly verify the host
`;
exports.SSH_KEY_ERROR = `
##[error] Permission denied (publickey)
Make sure that the ssh private key is set correctly, and
that the public key has been added to the target repo
`;
//# sourceMappingURL=errorMessages.js.map

/***/ }),

/***/ 861:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const _1 = __webpack_require__(526);
(0, _1.main)(process.env, console).catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=run.js.map

/***/ }),

/***/ 897:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareTempFolders = void 0;
const fs_1 = __webpack_require__(747);
const os_1 = __webpack_require__(87);
const path = __importStar(__webpack_require__(622));
const prepareTempFolders = async (context) => {
    const tempPath = await fs_1.promises.mkdtemp(path.join((0, os_1.tmpdir)(), 'action-git-copy-to-repo-'));
    await fs_1.promises.mkdir(path.join(tempPath, 'src'));
    await fs_1.promises.mkdir(path.join(tempPath, 'target'));
    context.temp = {
        srcTempFolder: path.join(tempPath, 'src'),
        targetTempFolder: path.join(tempPath, 'target'),
        srcTempRepo: path.join(tempPath, 'src/repo'),
        targetTempRepo: path.join(tempPath, 'target/repo'),
    };
};
exports.prepareTempFolders = prepareTempFolders;
//# sourceMappingURL=tempFolders.js.map

/***/ }),

/***/ 961:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeToProcess = exports.exec = void 0;
const child_process = __importStar(__webpack_require__(129));
const exec = async (cmd, opts) => {
    const { log } = opts;
    const env = (opts === null || opts === void 0 ? void 0 : opts.env) || {};
    const ps = child_process.spawn('bash', ['-c', cmd], {
        env: {
            HOME: process.env.HOME,
            ...env,
        },
        cwd: opts.cwd,
        stdio: ['pipe', 'pipe', 'pipe'],
    });
    const output = {
        stderr: '',
        stdout: '',
    };
    // We won't be providing any input to command
    ps.stdin.end();
    ps.stdout.on('data', (data) => {
        output.stdout += data;
        log.log(`data`, data.toString());
    });
    ps.stderr.on('data', (data) => {
        output.stderr += data;
        log.error(data.toString());
    });
    return new Promise((resolve, reject) => ps.on('close', (code) => {
        if (code !== 0) {
            reject(new Error('Process exited with code: ' + code + ':\n' + output.stderr));
        }
        else {
            resolve(output);
        }
    }));
};
exports.exec = exec;
const writeToProcess = (command, args, opts) => new Promise((resolve, reject) => {
    const child = child_process.spawn(command, args, {
        env: opts.env,
        stdio: 'pipe',
    });
    child.stdin.setDefaultEncoding('utf-8');
    child.stdin.write(opts.data);
    child.stdin.end();
    child.on('error', reject);
    let stderr = '';
    child.stdout.on('data', (data) => {
        /* istanbul ignore next */
        opts.log.log(data.toString());
    });
    child.stderr.on('data', (data) => {
        stderr += data;
        opts.log.error(data.toString());
    });
    child.on('close', (code) => {
        /* istanbul ignore else */
        if (code === 0) {
            resolve();
        }
        else {
            reject(new Error(stderr));
        }
    });
});
exports.writeToProcess = writeToProcess;
//# sourceMappingURL=processUtils.js.map

/***/ })

/******/ });