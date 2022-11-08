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

/***/ 129:
/***/ (function(module) {

module.exports = require("child_process");

/***/ }),

/***/ 526:
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
exports.main = exports.exec = void 0;
const child_process = __importStar(__webpack_require__(129));
const fs_1 = __webpack_require__(747);
const os_1 = __webpack_require__(87);
const path = __importStar(__webpack_require__(622));
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
const main = async ({ env = process.env, log, }) => {
    log.log(`env`, env);
    // const config = genConfig(env);
    // Calculate paths that use temp diractory
    const TMP_PATH = await fs_1.promises.mkdtemp(path.join((0, os_1.tmpdir)(), 'git-publish-subdir-action-'));
    const REPO_TEMP = path.join(TMP_PATH, 'repo');
    const SSH_AUTH_SOCK = path.join(TMP_PATH, 'ssh_agent.sock');
    // Environment to pass to children
    const childEnv = Object.assign({}, process.env, {
        SSH_AUTH_SOCK,
    });
    // Clone source repo
    log.log(`##[info] Vit Cloning the repo: git clone "${env.SRC_REPO}" "${REPO_TEMP}"`);
    await (0, exports.exec)(`git clone "${env.SRC_REPO}" "${REPO_TEMP}"`, {
        log,
        env: childEnv,
    }).catch((err) => {
        // const s = err.toString();
        // /* istanbul ignore else */
        // if (config.mode === 'ssh') {
        //   /* istanbul ignore else */
        //   if (s.indexOf('Host key verification failed') !== -1) {
        //     log.error(KNOWN_HOSTS_ERROR(config.parsedUrl.resource));
        //   } else if (s.indexOf('Permission denied (publickey') !== -1) {
        //     log.error(SSH_KEY_ERROR);
        //   }
        // }
        throw err;
    });
};
exports.main = main;


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

/* istanbul ignore file - this file is used purely as an entry-point */
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = __webpack_require__(526);
(0, _1.main)({
    log: console,
    env: process.env,
}).catch((err) => {
    console.error(err);
    process.exit(1);
});


/***/ })

/******/ });