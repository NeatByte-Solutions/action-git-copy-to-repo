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

/***/ 63:
/***/ (function(module, __unusedexports, __webpack_require__) {

const fs = __webpack_require__(747)
const path = __webpack_require__(622)
const os = __webpack_require__(87)

const LINE = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg

// Parser src into an Object
function parse (src) {
  const obj = {}

  // Convert buffer to string
  let lines = src.toString()

  // Convert line breaks to same format
  lines = lines.replace(/\r\n?/mg, '\n')

  let match
  while ((match = LINE.exec(lines)) != null) {
    const key = match[1]

    // Default undefined or null to empty string
    let value = (match[2] || '')

    // Remove whitespace
    value = value.trim()

    // Check if double quoted
    const maybeQuote = value[0]

    // Remove surrounding quotes
    value = value.replace(/^(['"`])([\s\S]*)\1$/mg, '$2')

    // Expand newlines if double quoted
    if (maybeQuote === '"') {
      value = value.replace(/\\n/g, '\n')
      value = value.replace(/\\r/g, '\r')
    }

    // Add to object
    obj[key] = value
  }

  return obj
}

function _log (message) {
  console.log(`[dotenv][DEBUG] ${message}`)
}

function _resolveHome (envPath) {
  return envPath[0] === '~' ? path.join(os.homedir(), envPath.slice(1)) : envPath
}

// Populates process.env from .env file
function config (options) {
  let dotenvPath = path.resolve(process.cwd(), '.env')
  let encoding = 'utf8'
  const debug = Boolean(options && options.debug)
  const override = Boolean(options && options.override)

  if (options) {
    if (options.path != null) {
      dotenvPath = _resolveHome(options.path)
    }
    if (options.encoding != null) {
      encoding = options.encoding
    }
  }

  try {
    // Specifying an encoding returns a string instead of a buffer
    const parsed = DotenvModule.parse(fs.readFileSync(dotenvPath, { encoding }))

    Object.keys(parsed).forEach(function (key) {
      if (!Object.prototype.hasOwnProperty.call(process.env, key)) {
        process.env[key] = parsed[key]
      } else {
        if (override === true) {
          process.env[key] = parsed[key]
        }

        if (debug) {
          if (override === true) {
            _log(`"${key}" is already defined in \`process.env\` and WAS overwritten`)
          } else {
            _log(`"${key}" is already defined in \`process.env\` and was NOT overwritten`)
          }
        }
      }
    })

    return { parsed }
  } catch (e) {
    if (debug) {
      _log(`Failed to load ${dotenvPath} ${e.message}`)
    }

    return { error: e }
  }
}

const DotenvModule = {
  config,
  parse
}

module.exports.config = DotenvModule.config
module.exports.parse = DotenvModule.parse
module.exports = DotenvModule


/***/ }),

/***/ 87:
/***/ (function(module) {

module.exports = require("os");

/***/ }),

/***/ 478:
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const config = (env = process.env, context) => {
    // TODO Validation
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

/***/ 526:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
const config_1 = __importDefault(__webpack_require__(478));
const prepareTempFolders_1 = __importDefault(__webpack_require__(807));
const main = async ({ env = process.env, log, }) => {
    const context = { log };
    // process and validate config
    (0, config_1.default)(env, context);
    // Calculate paths that use temp diractory
    await (0, prepareTempFolders_1.default)(context);
    // Clone branches
    // await checkoutSrc(context);
    // await checkoutTarget(context);
    console.log(context);
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

/***/ 807:
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
const prepareTempFolders = async (context) => {
    const tempPath = await fs_1.promises.mkdtemp(path.join((0, os_1.tmpdir)(), 'git-publish-subdir-action-'));
    context.srcTempFolder = path.join(tempPath, 'repo/src');
    context.targetTempFolder = path.join(tempPath, 'repo/target');
};
exports.default = prepareTempFolders;
//# sourceMappingURL=prepareTempFolders.js.map

/***/ }),

/***/ 861:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
__webpack_require__(63).config();
const _1 = __webpack_require__(526);
(0, _1.main)({
    log: console,
    env: process.env,
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=run.js.map

/***/ })

/******/ });