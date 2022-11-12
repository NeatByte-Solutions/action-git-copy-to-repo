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
const setupSshKeysForRepo = async (context, repoData, tempFolder) => {
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
    });
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
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const { log } = context;
    if ((_b = (_a = context.config) === null || _a === void 0 ? void 0 : _a.src) === null || _b === void 0 ? void 0 : _b.sshPrivateKey) {
        log.log(`##[info] Setting ssh key for src repo`);
        const execOpts = await setupSshKeysForRepo(context, (_c = context.config) === null || _c === void 0 ? void 0 : _c.src, ((_d = context.temp) === null || _d === void 0 ? void 0 : _d.srcTempFolder) || '');
        context.exec.srcExecOpt = execOpts;
    }
    if ((_f = (_e = context.config) === null || _e === void 0 ? void 0 : _e.target) === null || _f === void 0 ? void 0 : _f.sshPrivateKey) {
        log.log(`##[info] Setting ssh key for target repo`);
        const execOpts = await setupSshKeysForRepo(context, (_g = context.config) === null || _g === void 0 ? void 0 : _g.target, ((_h = context.temp) === null || _h === void 0 ? void 0 : _h.targetTempFolder) || '');
        context.exec.targetExecOpt = execOpts;
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

/***/ 264:
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
const fs_1 = __webpack_require__(747);
const os_1 = __webpack_require__(87);
const path = __importStar(__webpack_require__(622));
exports.default = async (context) => {
    const tempPath = await fs_1.promises.mkdtemp(path.join((0, os_1.tmpdir)(), 'action-git-copy-to-repo-'));
    context.temp = {
        srcTempFolder: path.join(tempPath, 'src'),
        targetTempFolder: path.join(tempPath, 'target'),
        srcTempRepo: path.join(tempPath, 'src/repo'),
        targetTempRepo: path.join(tempPath, 'target/repo'),
    };
};
//# sourceMappingURL=tempFoldersAndFiles.js.map

/***/ }),

/***/ 478:
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
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
        },
        commit: {
            message: env.COMMIT_MESSAGE,
            author: env.COMMIT_AUTHOR,
            authorEmail: env.COMMIT_AUTHOR_EMAIL,
        },
        knownHostsFile: env.KNOWN_HOSTS_FILE,
    };
};
exports.default = config;
//# sourceMappingURL=config.js.map

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

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
const context_1 = __webpack_require__(482);
const config_1 = __importDefault(__webpack_require__(478));
const tempFoldersAndFiles_1 = __importDefault(__webpack_require__(264));
const ssh_1 = __webpack_require__(110);
// import { checkoutSrc, checkoutTarget } from './checkout';
const main = async (env = process.env, log) => {
    const context = await (0, context_1.createContext)(log);
    // process and validate config
    await (0, config_1.default)(env, context);
    // calculate paths that use temp directories
    await (0, tempFoldersAndFiles_1.default)(context);
    // if needed setup ssh keys for git access
    await (0, ssh_1.setupSshKeys)(context);
    // Clone branches
    // await checkoutSrc(context);
    // await checkoutTarget(context);
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