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

/***/ 45:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


// Dependencies

var parseUrl = __webpack_require__(823),
    isSsh = __webpack_require__(720);

/**
 * gitUp
 * Parses the input url.
 *
 * @name gitUp
 * @function
 * @param {String} input The input url.
 * @return {Object} An object containing the following fields:
 *
 *  - `protocols` (Array): An array with the url protocols (usually it has one element).
 *  - `port` (null|Number): The domain port.
 *  - `resource` (String): The url domain (including subdomains).
 *  - `user` (String): The authentication user (usually for ssh urls).
 *  - `pathname` (String): The url pathname.
 *  - `hash` (String): The url hash.
 *  - `search` (String): The url querystring value.
 *  - `href` (String): The input url.
 *  - `protocol` (String): The git url protocol.
 *  - `token` (String): The oauth token (could appear in the https urls).
 */
function gitUp(input) {
    var output = parseUrl(input);
    output.token = "";

    var splits = output.user.split(":");
    if (splits.length === 2) {
        if (splits[1] === "x-oauth-basic") {
            output.token = splits[0];
        } else if (splits[0] === "x-token-auth") {
            output.token = splits[1];
        }
    }

    if (isSsh(output.protocols) || isSsh(input)) {
        output.protocol = "ssh";
    } else if (output.protocols.length) {
        output.protocol = output.protocols[0];
    } else {
        output.protocol = "file";
    }

    output.href = output.href.replace(/\/$/, "");
    return output;
}

module.exports = gitUp;

/***/ }),

/***/ 53:
/***/ (function(module) {

"use strict";


// https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
const DATA_URL_DEFAULT_MIME_TYPE = 'text/plain';
const DATA_URL_DEFAULT_CHARSET = 'us-ascii';

const testParameter = (name, filters) => {
	return filters.some(filter => filter instanceof RegExp ? filter.test(name) : filter === name);
};

const normalizeDataURL = (urlString, {stripHash}) => {
	const match = /^data:(?<type>[^,]*?),(?<data>[^#]*?)(?:#(?<hash>.*))?$/.exec(urlString);

	if (!match) {
		throw new Error(`Invalid URL: ${urlString}`);
	}

	let {type, data, hash} = match.groups;
	const mediaType = type.split(';');
	hash = stripHash ? '' : hash;

	let isBase64 = false;
	if (mediaType[mediaType.length - 1] === 'base64') {
		mediaType.pop();
		isBase64 = true;
	}

	// Lowercase MIME type
	const mimeType = (mediaType.shift() || '').toLowerCase();
	const attributes = mediaType
		.map(attribute => {
			let [key, value = ''] = attribute.split('=').map(string => string.trim());

			// Lowercase `charset`
			if (key === 'charset') {
				value = value.toLowerCase();

				if (value === DATA_URL_DEFAULT_CHARSET) {
					return '';
				}
			}

			return `${key}${value ? `=${value}` : ''}`;
		})
		.filter(Boolean);

	const normalizedMediaType = [
		...attributes
	];

	if (isBase64) {
		normalizedMediaType.push('base64');
	}

	if (normalizedMediaType.length !== 0 || (mimeType && mimeType !== DATA_URL_DEFAULT_MIME_TYPE)) {
		normalizedMediaType.unshift(mimeType);
	}

	return `data:${normalizedMediaType.join(';')},${isBase64 ? data.trim() : data}${hash ? `#${hash}` : ''}`;
};

const normalizeUrl = (urlString, options) => {
	options = {
		defaultProtocol: 'http:',
		normalizeProtocol: true,
		forceHttp: false,
		forceHttps: false,
		stripAuthentication: true,
		stripHash: false,
		stripTextFragment: true,
		stripWWW: true,
		removeQueryParameters: [/^utm_\w+/i],
		removeTrailingSlash: true,
		removeSingleSlash: true,
		removeDirectoryIndex: false,
		sortQueryParameters: true,
		...options
	};

	urlString = urlString.trim();

	// Data URL
	if (/^data:/i.test(urlString)) {
		return normalizeDataURL(urlString, options);
	}

	if (/^view-source:/i.test(urlString)) {
		throw new Error('`view-source:` is not supported as it is a non-standard protocol');
	}

	const hasRelativeProtocol = urlString.startsWith('//');
	const isRelativeUrl = !hasRelativeProtocol && /^\.*\//.test(urlString);

	// Prepend protocol
	if (!isRelativeUrl) {
		urlString = urlString.replace(/^(?!(?:\w+:)?\/\/)|^\/\//, options.defaultProtocol);
	}

	const urlObj = new URL(urlString);

	if (options.forceHttp && options.forceHttps) {
		throw new Error('The `forceHttp` and `forceHttps` options cannot be used together');
	}

	if (options.forceHttp && urlObj.protocol === 'https:') {
		urlObj.protocol = 'http:';
	}

	if (options.forceHttps && urlObj.protocol === 'http:') {
		urlObj.protocol = 'https:';
	}

	// Remove auth
	if (options.stripAuthentication) {
		urlObj.username = '';
		urlObj.password = '';
	}

	// Remove hash
	if (options.stripHash) {
		urlObj.hash = '';
	} else if (options.stripTextFragment) {
		urlObj.hash = urlObj.hash.replace(/#?:~:text.*?$/i, '');
	}

	// Remove duplicate slashes if not preceded by a protocol
	if (urlObj.pathname) {
		urlObj.pathname = urlObj.pathname.replace(/(?<!\b(?:[a-z][a-z\d+\-.]{1,50}:))\/{2,}/g, '/');
	}

	// Decode URI octets
	if (urlObj.pathname) {
		try {
			urlObj.pathname = decodeURI(urlObj.pathname);
		} catch (_) {}
	}

	// Remove directory index
	if (options.removeDirectoryIndex === true) {
		options.removeDirectoryIndex = [/^index\.[a-z]+$/];
	}

	if (Array.isArray(options.removeDirectoryIndex) && options.removeDirectoryIndex.length > 0) {
		let pathComponents = urlObj.pathname.split('/');
		const lastComponent = pathComponents[pathComponents.length - 1];

		if (testParameter(lastComponent, options.removeDirectoryIndex)) {
			pathComponents = pathComponents.slice(0, pathComponents.length - 1);
			urlObj.pathname = pathComponents.slice(1).join('/') + '/';
		}
	}

	if (urlObj.hostname) {
		// Remove trailing dot
		urlObj.hostname = urlObj.hostname.replace(/\.$/, '');

		// Remove `www.`
		if (options.stripWWW && /^www\.(?!www\.)(?:[a-z\-\d]{1,63})\.(?:[a-z.\-\d]{2,63})$/.test(urlObj.hostname)) {
			// Each label should be max 63 at length (min: 1).
			// Source: https://en.wikipedia.org/wiki/Hostname#Restrictions_on_valid_host_names
			// Each TLD should be up to 63 characters long (min: 2).
			// It is technically possible to have a single character TLD, but none currently exist.
			urlObj.hostname = urlObj.hostname.replace(/^www\./, '');
		}
	}

	// Remove query unwanted parameters
	if (Array.isArray(options.removeQueryParameters)) {
		for (const key of [...urlObj.searchParams.keys()]) {
			if (testParameter(key, options.removeQueryParameters)) {
				urlObj.searchParams.delete(key);
			}
		}
	}

	if (options.removeQueryParameters === true) {
		urlObj.search = '';
	}

	// Sort query parameters
	if (options.sortQueryParameters) {
		urlObj.searchParams.sort();
	}

	if (options.removeTrailingSlash) {
		urlObj.pathname = urlObj.pathname.replace(/\/$/, '');
	}

	const oldUrlString = urlString;

	// Take advantage of many of the Node `url` normalizations
	urlString = urlObj.toString();

	if (!options.removeSingleSlash && urlObj.pathname === '/' && !oldUrlString.endsWith('/') && urlObj.hash === '') {
		urlString = urlString.replace(/\/$/, '');
	}

	// Remove ending `/` unless removeSingleSlash is false
	if ((options.removeTrailingSlash || urlObj.pathname === '/') && urlObj.hash === '' && options.removeSingleSlash) {
		urlString = urlString.replace(/\/$/, '');
	}

	// Restore relative protocol, if applicable
	if (hasRelativeProtocol && !options.normalizeProtocol) {
		urlString = urlString.replace(/^http:\/\//, '//');
	}

	// Remove http/https
	if (options.stripProtocol) {
		urlString = urlString.replace(/^(?:https?:)?\/\//, '');
	}

	return urlString;
};

module.exports = normalizeUrl;


/***/ }),

/***/ 65:
/***/ (function(module) {

"use strict";

var token = '%[a-f0-9]{2}';
var singleMatcher = new RegExp(token, 'gi');
var multiMatcher = new RegExp('(' + token + ')+', 'gi');

function decodeComponents(components, split) {
	try {
		// Try to decode the entire string first
		return decodeURIComponent(components.join(''));
	} catch (err) {
		// Do nothing
	}

	if (components.length === 1) {
		return components;
	}

	split = split || 1;

	// Split the array in 2 parts
	var left = components.slice(0, split);
	var right = components.slice(split);

	return Array.prototype.concat.call([], decodeComponents(left), decodeComponents(right));
}

function decode(input) {
	try {
		return decodeURIComponent(input);
	} catch (err) {
		var tokens = input.match(singleMatcher);

		for (var i = 1; i < tokens.length; i++) {
			input = decodeComponents(tokens, i).join('');

			tokens = input.match(singleMatcher);
		}

		return input;
	}
}

function customDecodeURIComponent(input) {
	// Keep track of all the replacements and prefill the map with the `BOM`
	var replaceMap = {
		'%FE%FF': '\uFFFD\uFFFD',
		'%FF%FE': '\uFFFD\uFFFD'
	};

	var match = multiMatcher.exec(input);
	while (match) {
		try {
			// Decode as big chunks as possible
			replaceMap[match[0]] = decodeURIComponent(match[0]);
		} catch (err) {
			var result = decode(match[0]);

			if (result !== match[0]) {
				replaceMap[match[0]] = result;
			}
		}

		match = multiMatcher.exec(input);
	}

	// Add `%C2` at the end of the map to make sure it does not replace the combinator before everything else
	replaceMap['%C2'] = '\uFFFD';

	var entries = Object.keys(replaceMap);

	for (var i = 0; i < entries.length; i++) {
		// Replace all decoded components
		var key = entries[i];
		input = input.replace(new RegExp(key, 'g'), replaceMap[key]);
	}

	return input;
}

module.exports = function (encodedURI) {
	if (typeof encodedURI !== 'string') {
		throw new TypeError('Expected `encodedURI` to be of type `string`, got `' + typeof encodedURI + '`');
	}

	try {
		encodedURI = encodedURI.replace(/\+/g, ' ');

		// Try the built in decoder first
		return decodeURIComponent(encodedURI);
	} catch (err) {
		// Fallback to a more advanced decoder
		return customDecodeURIComponent(encodedURI);
	}
};


/***/ }),

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

/***/ 183:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

const strictUriEncode = __webpack_require__(690);
const decodeComponent = __webpack_require__(65);
const splitOnFirst = __webpack_require__(534);
const filterObject = __webpack_require__(303);

const isNullOrUndefined = value => value === null || value === undefined;

function encoderForArrayFormat(options) {
	switch (options.arrayFormat) {
		case 'index':
			return key => (result, value) => {
				const index = result.length;

				if (
					value === undefined ||
					(options.skipNull && value === null) ||
					(options.skipEmptyString && value === '')
				) {
					return result;
				}

				if (value === null) {
					return [...result, [encode(key, options), '[', index, ']'].join('')];
				}

				return [
					...result,
					[encode(key, options), '[', encode(index, options), ']=', encode(value, options)].join('')
				];
			};

		case 'bracket':
			return key => (result, value) => {
				if (
					value === undefined ||
					(options.skipNull && value === null) ||
					(options.skipEmptyString && value === '')
				) {
					return result;
				}

				if (value === null) {
					return [...result, [encode(key, options), '[]'].join('')];
				}

				return [...result, [encode(key, options), '[]=', encode(value, options)].join('')];
			};

		case 'comma':
		case 'separator':
			return key => (result, value) => {
				if (value === null || value === undefined || value.length === 0) {
					return result;
				}

				if (result.length === 0) {
					return [[encode(key, options), '=', encode(value, options)].join('')];
				}

				return [[result, encode(value, options)].join(options.arrayFormatSeparator)];
			};

		default:
			return key => (result, value) => {
				if (
					value === undefined ||
					(options.skipNull && value === null) ||
					(options.skipEmptyString && value === '')
				) {
					return result;
				}

				if (value === null) {
					return [...result, encode(key, options)];
				}

				return [...result, [encode(key, options), '=', encode(value, options)].join('')];
			};
	}
}

function parserForArrayFormat(options) {
	let result;

	switch (options.arrayFormat) {
		case 'index':
			return (key, value, accumulator) => {
				result = /\[(\d*)\]$/.exec(key);

				key = key.replace(/\[\d*\]$/, '');

				if (!result) {
					accumulator[key] = value;
					return;
				}

				if (accumulator[key] === undefined) {
					accumulator[key] = {};
				}

				accumulator[key][result[1]] = value;
			};

		case 'bracket':
			return (key, value, accumulator) => {
				result = /(\[\])$/.exec(key);
				key = key.replace(/\[\]$/, '');

				if (!result) {
					accumulator[key] = value;
					return;
				}

				if (accumulator[key] === undefined) {
					accumulator[key] = [value];
					return;
				}

				accumulator[key] = [].concat(accumulator[key], value);
			};

		case 'comma':
		case 'separator':
			return (key, value, accumulator) => {
				const isArray = typeof value === 'string' && value.includes(options.arrayFormatSeparator);
				const isEncodedArray = (typeof value === 'string' && !isArray && decode(value, options).includes(options.arrayFormatSeparator));
				value = isEncodedArray ? decode(value, options) : value;
				const newValue = isArray || isEncodedArray ? value.split(options.arrayFormatSeparator).map(item => decode(item, options)) : value === null ? value : decode(value, options);
				accumulator[key] = newValue;
			};

		default:
			return (key, value, accumulator) => {
				if (accumulator[key] === undefined) {
					accumulator[key] = value;
					return;
				}

				accumulator[key] = [].concat(accumulator[key], value);
			};
	}
}

function validateArrayFormatSeparator(value) {
	if (typeof value !== 'string' || value.length !== 1) {
		throw new TypeError('arrayFormatSeparator must be single character string');
	}
}

function encode(value, options) {
	if (options.encode) {
		return options.strict ? strictUriEncode(value) : encodeURIComponent(value);
	}

	return value;
}

function decode(value, options) {
	if (options.decode) {
		return decodeComponent(value);
	}

	return value;
}

function keysSorter(input) {
	if (Array.isArray(input)) {
		return input.sort();
	}

	if (typeof input === 'object') {
		return keysSorter(Object.keys(input))
			.sort((a, b) => Number(a) - Number(b))
			.map(key => input[key]);
	}

	return input;
}

function removeHash(input) {
	const hashStart = input.indexOf('#');
	if (hashStart !== -1) {
		input = input.slice(0, hashStart);
	}

	return input;
}

function getHash(url) {
	let hash = '';
	const hashStart = url.indexOf('#');
	if (hashStart !== -1) {
		hash = url.slice(hashStart);
	}

	return hash;
}

function extract(input) {
	input = removeHash(input);
	const queryStart = input.indexOf('?');
	if (queryStart === -1) {
		return '';
	}

	return input.slice(queryStart + 1);
}

function parseValue(value, options) {
	if (options.parseNumbers && !Number.isNaN(Number(value)) && (typeof value === 'string' && value.trim() !== '')) {
		value = Number(value);
	} else if (options.parseBooleans && value !== null && (value.toLowerCase() === 'true' || value.toLowerCase() === 'false')) {
		value = value.toLowerCase() === 'true';
	}

	return value;
}

function parse(query, options) {
	options = Object.assign({
		decode: true,
		sort: true,
		arrayFormat: 'none',
		arrayFormatSeparator: ',',
		parseNumbers: false,
		parseBooleans: false
	}, options);

	validateArrayFormatSeparator(options.arrayFormatSeparator);

	const formatter = parserForArrayFormat(options);

	// Create an object with no prototype
	const ret = Object.create(null);

	if (typeof query !== 'string') {
		return ret;
	}

	query = query.trim().replace(/^[?#&]/, '');

	if (!query) {
		return ret;
	}

	for (const param of query.split('&')) {
		if (param === '') {
			continue;
		}

		let [key, value] = splitOnFirst(options.decode ? param.replace(/\+/g, ' ') : param, '=');

		// Missing `=` should be `null`:
		// http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
		value = value === undefined ? null : ['comma', 'separator'].includes(options.arrayFormat) ? value : decode(value, options);
		formatter(decode(key, options), value, ret);
	}

	for (const key of Object.keys(ret)) {
		const value = ret[key];
		if (typeof value === 'object' && value !== null) {
			for (const k of Object.keys(value)) {
				value[k] = parseValue(value[k], options);
			}
		} else {
			ret[key] = parseValue(value, options);
		}
	}

	if (options.sort === false) {
		return ret;
	}

	return (options.sort === true ? Object.keys(ret).sort() : Object.keys(ret).sort(options.sort)).reduce((result, key) => {
		const value = ret[key];
		if (Boolean(value) && typeof value === 'object' && !Array.isArray(value)) {
			// Sort object keys, not values
			result[key] = keysSorter(value);
		} else {
			result[key] = value;
		}

		return result;
	}, Object.create(null));
}

exports.extract = extract;
exports.parse = parse;

exports.stringify = (object, options) => {
	if (!object) {
		return '';
	}

	options = Object.assign({
		encode: true,
		strict: true,
		arrayFormat: 'none',
		arrayFormatSeparator: ','
	}, options);

	validateArrayFormatSeparator(options.arrayFormatSeparator);

	const shouldFilter = key => (
		(options.skipNull && isNullOrUndefined(object[key])) ||
		(options.skipEmptyString && object[key] === '')
	);

	const formatter = encoderForArrayFormat(options);

	const objectCopy = {};

	for (const key of Object.keys(object)) {
		if (!shouldFilter(key)) {
			objectCopy[key] = object[key];
		}
	}

	const keys = Object.keys(objectCopy);

	if (options.sort !== false) {
		keys.sort(options.sort);
	}

	return keys.map(key => {
		const value = object[key];

		if (value === undefined) {
			return '';
		}

		if (value === null) {
			return encode(key, options);
		}

		if (Array.isArray(value)) {
			return value
				.reduce(formatter(key), [])
				.join('&');
		}

		return encode(key, options) + '=' + encode(value, options);
	}).filter(x => x.length > 0).join('&');
};

exports.parseUrl = (url, options) => {
	options = Object.assign({
		decode: true
	}, options);

	const [url_, hash] = splitOnFirst(url, '#');

	return Object.assign(
		{
			url: url_.split('?')[0] || '',
			query: parse(extract(url), options)
		},
		options && options.parseFragmentIdentifier && hash ? {fragmentIdentifier: decode(hash, options)} : {}
	);
};

exports.stringifyUrl = (object, options) => {
	options = Object.assign({
		encode: true,
		strict: true
	}, options);

	const url = removeHash(object.url).split('?')[0] || '';
	const queryFromUrl = exports.extract(object.url);
	const parsedQueryFromUrl = exports.parse(queryFromUrl, {sort: false});

	const query = Object.assign(parsedQueryFromUrl, object.query);
	let queryString = exports.stringify(query, options);
	if (queryString) {
		queryString = `?${queryString}`;
	}

	let hash = getHash(object.url);
	if (object.fragmentIdentifier) {
		hash = `#${encode(object.fragmentIdentifier, options)}`;
	}

	return `${url}${queryString}${hash}`;
};

exports.pick = (input, filter, options) => {
	options = Object.assign({
		parseFragmentIdentifier: true
	}, options);

	const {url, query, fragmentIdentifier} = exports.parseUrl(input, options);
	return exports.stringifyUrl({
		url,
		query: filterObject(query, filter),
		fragmentIdentifier
	}, options);
};

exports.exclude = (input, filter, options) => {
	const exclusionFilter = Array.isArray(filter) ? key => !filter.includes(key) : (key, value) => !filter(key, value);

	return exports.pick(input, exclusionFilter, options);
};


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

/***/ 253:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


var gitUp = __webpack_require__(45);

/**
 * gitUrlParse
 * Parses a Git url.
 *
 * @name gitUrlParse
 * @function
 * @param {String} url The Git url to parse.
 * @return {GitUrl} The `GitUrl` object containing:
 *
 *  - `protocols` (Array): An array with the url protocols (usually it has one element).
 *  - `port` (null|Number): The domain port.
 *  - `resource` (String): The url domain (including subdomains).
 *  - `user` (String): The authentication user (usually for ssh urls).
 *  - `pathname` (String): The url pathname.
 *  - `hash` (String): The url hash.
 *  - `search` (String): The url querystring value.
 *  - `href` (String): The input url.
 *  - `protocol` (String): The git url protocol.
 *  - `token` (String): The oauth token (could appear in the https urls).
 *  - `source` (String): The Git provider (e.g. `"github.com"`).
 *  - `owner` (String): The repository owner.
 *  - `name` (String): The repository name.
 *  - `ref` (String): The repository ref (e.g., "master" or "dev").
 *  - `filepath` (String): A filepath relative to the repository root.
 *  - `filepathtype` (String): The type of filepath in the url ("blob" or "tree").
 *  - `full_name` (String): The owner and name values in the `owner/name` format.
 *  - `toString` (Function): A function to stringify the parsed url into another url type.
 *  - `organization` (String): The organization the owner belongs to. This is CloudForge specific.
 *  - `git_suffix` (Boolean): Whether to add the `.git` suffix or not.
 *
 */
function gitUrlParse(url) {

    if (typeof url !== "string") {
        throw new Error("The url must be a string.");
    }

    var urlInfo = gitUp(url),
        sourceParts = urlInfo.resource.split("."),
        splits = null;

    urlInfo.toString = function (type) {
        return gitUrlParse.stringify(this, type);
    };

    urlInfo.source = sourceParts.length > 2 ? sourceParts.slice(1 - sourceParts.length).join(".") : urlInfo.source = urlInfo.resource;

    // Note: Some hosting services (e.g. Visual Studio Team Services) allow whitespace characters
    // in the repository and owner names so we decode the URL pieces to get the correct result
    urlInfo.git_suffix = /\.git$/.test(urlInfo.pathname);
    urlInfo.name = decodeURIComponent(urlInfo.pathname.replace(/^\//, '').replace(/\.git$/, ""));
    urlInfo.owner = decodeURIComponent(urlInfo.user);

    switch (urlInfo.source) {
        case "git.cloudforge.com":
            urlInfo.owner = urlInfo.user;
            urlInfo.organization = sourceParts[0];
            urlInfo.source = "cloudforge.com";
            break;
        case "visualstudio.com":
            // Handle VSTS SSH URLs
            if (urlInfo.resource === 'vs-ssh.visualstudio.com') {
                splits = urlInfo.name.split("/");
                if (splits.length === 4) {
                    urlInfo.organization = splits[1];
                    urlInfo.owner = splits[2];
                    urlInfo.name = splits[3];
                    urlInfo.full_name = splits[2] + '/' + splits[3];
                }
                break;
            } else {
                splits = urlInfo.name.split("/");
                if (splits.length === 2) {
                    urlInfo.owner = splits[1];
                    urlInfo.name = splits[1];
                    urlInfo.full_name = '_git/' + urlInfo.name;
                } else if (splits.length === 3) {
                    urlInfo.name = splits[2];
                    if (splits[0] === 'DefaultCollection') {
                        urlInfo.owner = splits[2];
                        urlInfo.organization = splits[0];
                        urlInfo.full_name = urlInfo.organization + '/_git/' + urlInfo.name;
                    } else {
                        urlInfo.owner = splits[0];
                        urlInfo.full_name = urlInfo.owner + '/_git/' + urlInfo.name;
                    }
                } else if (splits.length === 4) {
                    urlInfo.organization = splits[0];
                    urlInfo.owner = splits[1];
                    urlInfo.name = splits[3];
                    urlInfo.full_name = urlInfo.organization + '/' + urlInfo.owner + '/_git/' + urlInfo.name;
                }
                break;
            }

        // Azure DevOps (formerly Visual Studio Team Services)
        case "dev.azure.com":
        case "azure.com":
            if (urlInfo.resource === 'ssh.dev.azure.com') {
                splits = urlInfo.name.split("/");
                if (splits.length === 4) {
                    urlInfo.organization = splits[1];
                    urlInfo.owner = splits[2];
                    urlInfo.name = splits[3];
                }
                break;
            } else {
                splits = urlInfo.name.split("/");
                if (splits.length === 5) {
                    urlInfo.organization = splits[0];
                    urlInfo.owner = splits[1];
                    urlInfo.name = splits[4];
                    urlInfo.full_name = '_git/' + urlInfo.name;
                } else if (splits.length === 3) {
                    urlInfo.name = splits[2];
                    if (splits[0] === 'DefaultCollection') {
                        urlInfo.owner = splits[2];
                        urlInfo.organization = splits[0];
                        urlInfo.full_name = urlInfo.organization + '/_git/' + urlInfo.name;
                    } else {
                        urlInfo.owner = splits[0];
                        urlInfo.full_name = urlInfo.owner + '/_git/' + urlInfo.name;
                    }
                } else if (splits.length === 4) {
                    urlInfo.organization = splits[0];
                    urlInfo.owner = splits[1];
                    urlInfo.name = splits[3];
                    urlInfo.full_name = urlInfo.organization + '/' + urlInfo.owner + '/_git/' + urlInfo.name;
                }
                if (urlInfo.query && urlInfo.query['path']) {
                    urlInfo.filepath = urlInfo.query['path'].replace(/^\/+/g, ''); // Strip leading slash (/)
                }
                if (urlInfo.query && urlInfo.query['version']) {
                    // version=GB<branch>
                    urlInfo.ref = urlInfo.query['version'].replace(/^GB/, ''); // remove GB
                }
                break;
            }
        default:
            splits = urlInfo.name.split("/");
            var nameIndex = splits.length - 1;
            if (splits.length >= 2) {
                var dashIndex = splits.indexOf("-", 2);
                var blobIndex = splits.indexOf("blob", 2);
                var treeIndex = splits.indexOf("tree", 2);
                var commitIndex = splits.indexOf("commit", 2);
                var srcIndex = splits.indexOf("src", 2);
                var rawIndex = splits.indexOf("raw", 2);
                nameIndex = dashIndex > 0 ? dashIndex - 1 : blobIndex > 0 ? blobIndex - 1 : treeIndex > 0 ? treeIndex - 1 : commitIndex > 0 ? commitIndex - 1 : srcIndex > 0 ? srcIndex - 1 : rawIndex > 0 ? rawIndex - 1 : nameIndex;

                urlInfo.owner = splits.slice(0, nameIndex).join('/');
                urlInfo.name = splits[nameIndex];
                if (commitIndex) {
                    urlInfo.commit = splits[nameIndex + 2];
                }
            }

            urlInfo.ref = "";
            urlInfo.filepathtype = "";
            urlInfo.filepath = "";
            var offsetNameIndex = splits.length > nameIndex && splits[nameIndex + 1] === "-" ? nameIndex + 1 : nameIndex;
            if (splits.length > offsetNameIndex + 2 && ["raw", "src", "blob", "tree"].indexOf(splits[offsetNameIndex + 1]) >= 0) {
                urlInfo.filepathtype = splits[offsetNameIndex + 1];
                urlInfo.ref = splits[offsetNameIndex + 2];
                if (splits.length > offsetNameIndex + 3) {
                    urlInfo.filepath = splits.slice(offsetNameIndex + 3).join('/');
                }
            }
            urlInfo.organization = urlInfo.owner;
            break;
    }

    if (!urlInfo.full_name) {
        urlInfo.full_name = urlInfo.owner;
        if (urlInfo.name) {
            urlInfo.full_name && (urlInfo.full_name += "/");
            urlInfo.full_name += urlInfo.name;
        }
    }
    // Bitbucket Server
    if (urlInfo.owner.startsWith("scm/")) {
        urlInfo.source = "bitbucket-server";
        urlInfo.owner = urlInfo.owner.replace("scm/", "");
        urlInfo.organization = urlInfo.owner;
        urlInfo.full_name = urlInfo.owner + "/" + urlInfo.name;
    }

    var bitbucket = /(projects|users)\/(.*?)\/repos\/(.*?)((\/.*$)|$)/;
    var matches = bitbucket.exec(urlInfo.pathname);
    if (matches != null) {
        urlInfo.source = "bitbucket-server";
        if (matches[1] === "users") {
            urlInfo.owner = "~" + matches[2];
        } else {
            urlInfo.owner = matches[2];
        }

        urlInfo.organization = urlInfo.owner;
        urlInfo.name = matches[3];

        splits = matches[4].split("/");
        if (splits.length > 1) {
            if (["raw", "browse"].indexOf(splits[1]) >= 0) {
                urlInfo.filepathtype = splits[1];
                if (splits.length > 2) {
                    urlInfo.filepath = splits.slice(2).join('/');
                }
            } else if (splits[1] === "commits" && splits.length > 2) {
                urlInfo.commit = splits[2];
            }
        }
        urlInfo.full_name = urlInfo.owner + "/" + urlInfo.name;

        if (urlInfo.query.at) {
            urlInfo.ref = urlInfo.query.at;
        } else {
            urlInfo.ref = "";
        }
    }
    return urlInfo;
}

/**
 * stringify
 * Stringifies a `GitUrl` object.
 *
 * @name stringify
 * @function
 * @param {GitUrl} obj The parsed Git url object.
 * @param {String} type The type of the stringified url (default `obj.protocol`).
 * @return {String} The stringified url.
 */
gitUrlParse.stringify = function (obj, type) {
    type = type || (obj.protocols && obj.protocols.length ? obj.protocols.join('+') : obj.protocol);
    var port = obj.port ? ":" + obj.port : '';
    var user = obj.user || 'git';
    var maybeGitSuffix = obj.git_suffix ? ".git" : "";
    switch (type) {
        case "ssh":
            if (port) return "ssh://" + user + "@" + obj.resource + port + "/" + obj.full_name + maybeGitSuffix;else return user + "@" + obj.resource + ":" + obj.full_name + maybeGitSuffix;
        case "git+ssh":
        case "ssh+git":
        case "ftp":
        case "ftps":
            return type + "://" + user + "@" + obj.resource + port + "/" + obj.full_name + maybeGitSuffix;
        case "http":
        case "https":
            var auth = obj.token ? buildToken(obj) : obj.user && (obj.protocols.includes('http') || obj.protocols.includes('https')) ? obj.user + "@" : "";
            return type + "://" + auth + obj.resource + port + "/" + buildPath(obj) + maybeGitSuffix;
        default:
            return obj.href;
    }
};

/*!
 * buildToken
 * Builds OAuth token prefix (helper function)
 *
 * @name buildToken
 * @function
 * @param {GitUrl} obj The parsed Git url object.
 * @return {String} token prefix
 */
function buildToken(obj) {
    switch (obj.source) {
        case "bitbucket.org":
            return "x-token-auth:" + obj.token + "@";
        default:
            return obj.token + "@";
    }
}

function buildPath(obj) {
    switch (obj.source) {
        case "bitbucket-server":
            return "scm/" + obj.full_name;
        default:
            return "" + obj.full_name;

    }
}

module.exports = gitUrlParse;

/***/ }),

/***/ 303:
/***/ (function(module) {

"use strict";

module.exports = function (obj, predicate) {
	var ret = {};
	var keys = Object.keys(obj);
	var isArr = Array.isArray(predicate);

	for (var i = 0; i < keys.length; i++) {
		var key = keys[i];
		var val = obj[key];

		if (isArr ? predicate.indexOf(key) !== -1 : predicate(key, val, obj)) {
			ret[key] = val;
		}
	}

	return ret;
};


/***/ }),

/***/ 444:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkoutTarget = exports.checkoutSrc = void 0;
const git_url_parse_1 = __importDefault(__webpack_require__(253));
const processUtils_1 = __webpack_require__(961);
const errorMessages_1 = __webpack_require__(788);
class NoSuchBranchError extends Error {
    constructor(branch, repo) {
        super(`Failed to checkout branch "${branch}" from repository "${repo}"`);
    }
}
const clone = async ({ context, repoData, tmpFolder, execOpts }) => {
    const { log } = context;
    const repo = (repoData === null || repoData === void 0 ? void 0 : repoData.sshPrivateKey)
        ? (repoData === null || repoData === void 0 ? void 0 : repoData.sshRepo) || ''
        : `https://x-access-token:${repoData === null || repoData === void 0 ? void 0 : repoData.githubToken}@github.com/${repoData === null || repoData === void 0 ? void 0 : repoData.githubRepo}.git`;
    log.log(`##[info] Cloning the repo: git clone "${repo}" "${tmpFolder}"`);
    try {
        await (0, processUtils_1.exec)(`git clone "${repo}" "${tmpFolder}"`, {
            log,
            env: execOpts === null || execOpts === void 0 ? void 0 : execOpts.env,
        });
    }
    catch (err) {
        const s = err.toString();
        if (repoData === null || repoData === void 0 ? void 0 : repoData.sshPrivateKey) {
            if (s.indexOf('Host key verification failed') !== -1) {
                const parsedUrl = (0, git_url_parse_1.default)(repo);
                log.error((0, errorMessages_1.KNOWN_HOSTS_ERROR)((parsedUrl === null || parsedUrl === void 0 ? void 0 : parsedUrl.resource) || ''));
            }
            else if (s.indexOf('Permission denied (publickey') !== -1) {
                log.error(errorMessages_1.SSH_KEY_ERROR);
            }
        }
        throw err;
    }
};
const switchToBranch = async ({ context, branch, folder, execOpts }) => {
    const { log } = context;
    log.log(`##[info] Checkout branch "${branch}"`);
    // Fetch branch if it exists
    try {
        await (0, processUtils_1.exec)(`git fetch -u origin ${branch}:${branch}`, {
            ...execOpts,
            cwd: folder,
        });
    }
    catch (err) {
        if (err instanceof NoSuchBranchError) {
            log.error("##[warning] Failed to fetch target branch, probably doesn't exist");
            log.error(err);
        }
    }
    // Checkout branch
    await (0, processUtils_1.exec)(`git checkout "${branch}"`, {
        ...execOpts,
        cwd: folder,
    });
};
const switchOrCreateBranch = async ({ context, branch, baseBranch, folder, execOpts, }) => {
    const { log } = context;
    log.log(`##[info] Checkout branch "${branch}"`);
    // Fetch branch if it exists
    try {
        await (0, processUtils_1.exec)(`git fetch -u origin ${branch}:${branch}`, {
            ...execOpts,
            cwd: folder,
        });
    }
    catch (err) {
        if (err instanceof NoSuchBranchError) {
            log.error("##[warning] Failed to fetch target branch, probably doesn't exist");
            log.error(err);
        }
    }
    log.log(await (0, processUtils_1.exec)(`git branch -a`, {
        ...execOpts,
        cwd: folder,
    }));
    // Check if branch already exists
    log.log(`##[info] Checking if branch ${branch} exists already`);
    const branchCheck = await (0, processUtils_1.exec)(`git branch --list "${branch}"`, {
        ...execOpts,
        cwd: folder,
    });
    if (branchCheck.stdout.trim() === '') {
        // Branch does not exist yet, let's check it out from base branch
        log.log(`##[info] ${branch} does not exist, creating from ${baseBranch}`);
        await (0, processUtils_1.exec)(`git checkout -b "${branch}" "${baseBranch}"`, {
            ...execOpts,
            cwd: folder,
        });
    }
    else {
        await (0, processUtils_1.exec)(`git checkout "${branch}"`, {
            ...execOpts,
            cwd: folder,
        });
    }
    log.log(await (0, processUtils_1.exec)(`git branch -a`, {
        ...execOpts,
        cwd: folder,
    }));
};
const checkoutSrc = async (context) => {
    var _a, _b, _c;
    // Clone source repo
    await clone({
        context,
        repoData: (_a = context.config) === null || _a === void 0 ? void 0 : _a.src,
        tmpFolder: context.temp.srcTempRepo,
        execOpts: context.exec.srcExecOpt,
    });
    // Switch to source branch or create new one if such doesn't exist
    await switchToBranch({
        context,
        branch: (_c = (_b = context.config) === null || _b === void 0 ? void 0 : _b.src) === null || _c === void 0 ? void 0 : _c.branch,
        folder: context.temp.srcTempRepo,
        execOpts: context.exec.srcExecOpt,
    });
};
exports.checkoutSrc = checkoutSrc;
const checkoutTarget = async (context) => {
    var _a, _b, _c, _d, _e, _f, _g;
    // Clone target repo
    await clone({
        context,
        repoData: (_a = context.config) === null || _a === void 0 ? void 0 : _a.target,
        tmpFolder: context.temp.targetTempRepo,
        execOpts: context.exec.targetExecOpt,
    });
    // Switch to target base branch
    await switchToBranch({
        context,
        branch: (_c = (_b = context.config) === null || _b === void 0 ? void 0 : _b.target) === null || _c === void 0 ? void 0 : _c.baseBranch,
        folder: context.temp.targetTempRepo,
        execOpts: context.exec.targetExecOpt,
    });
    // Switch to target branch or create new one if such doesn't exist
    await switchOrCreateBranch({
        context,
        branch: (_e = (_d = context.config) === null || _d === void 0 ? void 0 : _d.target) === null || _e === void 0 ? void 0 : _e.branch,
        baseBranch: (_g = (_f = context.config) === null || _f === void 0 ? void 0 : _f.target) === null || _g === void 0 ? void 0 : _g.baseBranch,
        folder: context.temp.targetTempRepo,
        execOpts: context.exec.targetExecOpt,
    });
};
exports.checkoutTarget = checkoutTarget;
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
    await (0, checkout_1.checkoutSrc)(context);
    await (0, checkout_1.checkoutTarget)(context);
    // Kill ssh processes if private keys were installed
    await (0, ssh_1.killSshProcesses)(context);
};
exports.main = main;
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 534:
/***/ (function(module) {

"use strict";


module.exports = (string, separator) => {
	if (!(typeof string === 'string' && typeof separator === 'string')) {
		throw new TypeError('Expected the arguments to be of type `string`');
	}

	if (separator === '') {
		return [string];
	}

	const separatorIndex = string.indexOf(separator);

	if (separatorIndex === -1) {
		return [string];
	}

	return [
		string.slice(0, separatorIndex),
		string.slice(separatorIndex + separator.length)
	];
};


/***/ }),

/***/ 622:
/***/ (function(module) {

module.exports = require("path");

/***/ }),

/***/ 666:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


// Dependencies
var protocols = __webpack_require__(737),
    isSsh = __webpack_require__(720),
    qs = __webpack_require__(183);

/**
 * parsePath
 * Parses the input url.
 *
 * @name parsePath
 * @function
 * @param {String} url The input url.
 * @return {Object} An object containing the following fields:
 *
 *  - `protocols` (Array): An array with the url protocols (usually it has one element).
 *  - `protocol` (String): The first protocol, `"ssh"` (if the url is a ssh url) or `"file"`.
 *  - `port` (null|Number): The domain port.
 *  - `resource` (String): The url domain (including subdomains).
 *  - `user` (String): The authentication user (usually for ssh urls).
 *  - `pathname` (String): The url pathname.
 *  - `hash` (String): The url hash.
 *  - `search` (String): The url querystring value.
 *  - `href` (String): The input url.
 *  - `query` (Object): The url querystring, parsed as object.
 */
function parsePath(url) {
    url = (url || "").trim();
    var output = {
        protocols: protocols(url),
        protocol: null,
        port: null,
        resource: "",
        user: "",
        pathname: "",
        hash: "",
        search: "",
        href: url,
        query: Object.create(null)
    },
        protocolIndex = url.indexOf("://"),
        resourceIndex = -1,
        splits = null,
        parts = null;

    if (url.startsWith(".")) {
        if (url.startsWith("./")) {
            url = url.substring(2);
        }
        output.pathname = url;
        output.protocol = "file";
    }

    var firstChar = url.charAt(1);
    if (!output.protocol) {
        output.protocol = output.protocols[0];
        if (!output.protocol) {
            if (isSsh(url)) {
                output.protocol = "ssh";
            } else if (firstChar === "/" || firstChar === "~") {
                url = url.substring(2);
                output.protocol = "file";
            } else {
                output.protocol = "file";
            }
        }
    }

    if (protocolIndex !== -1) {
        url = url.substring(protocolIndex + 3);
    }

    parts = url.split(/\/|\\/);
    if (output.protocol !== "file") {
        output.resource = parts.shift();
    } else {
        output.resource = "";
    }

    // user@domain
    splits = output.resource.split("@");
    if (splits.length === 2) {
        output.user = splits[0];
        output.resource = splits[1];
    }

    // domain.com:port
    splits = output.resource.split(":");
    if (splits.length === 2) {
        output.resource = splits[0];
        if (splits[1]) {
            output.port = Number(splits[1]);
            if (isNaN(output.port)) {
                output.port = null;
                parts.unshift(splits[1]);
            }
        } else {
            output.port = null;
        }
    }

    // Remove empty elements
    parts = parts.filter(Boolean);

    // Stringify the pathname
    if (output.protocol === "file") {
        output.pathname = output.href;
    } else {
        output.pathname = output.pathname || (output.protocol !== "file" || output.href[0] === "/" ? "/" : "") + parts.join("/");
    }

    // #some-hash
    splits = output.pathname.split("#");
    if (splits.length === 2) {
        output.pathname = splits[0];
        output.hash = splits[1];
    }

    // ?foo=bar
    splits = output.pathname.split("?");
    if (splits.length === 2) {
        output.pathname = splits[0];
        output.search = splits[1];
    }

    output.query = qs.parse(output.search);
    output.href = output.href.replace(/\/$/, "");
    output.pathname = output.pathname.replace(/\/$/, "");
    return output;
}

module.exports = parsePath;

/***/ }),

/***/ 690:
/***/ (function(module) {

"use strict";

module.exports = str => encodeURIComponent(str).replace(/[!'()*]/g, x => `%${x.charCodeAt(0).toString(16).toUpperCase()}`);


/***/ }),

/***/ 720:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


// Dependencies
var protocols = __webpack_require__(737);

/**
 * isSsh
 * Checks if an input value is a ssh url or not.
 *
 * @name isSsh
 * @function
 * @param {String|Array} input The input url or an array of protocols.
 * @return {Boolean} `true` if the input is a ssh url, `false` otherwise.
 */
function isSsh(input) {

    if (Array.isArray(input)) {
        return input.indexOf("ssh") !== -1 || input.indexOf("rsync") !== -1;
    }

    if (typeof input !== "string") {
        return false;
    }

    var prots = protocols(input);
    input = input.substring(input.indexOf("://") + 3);
    if (isSsh(prots)) {
        return true;
    }

    // TODO This probably could be improved :)
    var urlPortPattern = new RegExp('\.([a-zA-Z\\d]+):(\\d+)\/');
    return !input.match(urlPortPattern) && input.indexOf("@") < input.indexOf(":");
}

module.exports = isSsh;

/***/ }),

/***/ 737:
/***/ (function(module) {

"use strict";


/**
 * protocols
 * Returns the protocols of an input url.
 *
 * @name protocols
 * @function
 * @param {String} input The input url.
 * @param {Boolean|Number} first If `true`, the first protocol will be returned. If number, it will represent the zero-based index of the protocols array.
 * @return {Array|String} The array of protocols or the specified protocol.
 */
module.exports = function protocols(input, first) {

    if (first === true) {
        first = 0;
    }

    var index = input.indexOf("://"),
        splits = input.substring(0, index).split("+").filter(Boolean);

    if (typeof first === "number") {
        return splits[first];
    }

    return splits;
};

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
const KNOWN_HOSTS_ERROR = (host) => `
##[error] Host key verification failed!
This is probably because you forgot to supply a value for KNOWN_HOSTS_FILE
or the file is invalid or doesn't correctly verify the host ${host}
`;
exports.KNOWN_HOSTS_ERROR = KNOWN_HOSTS_ERROR;
exports.SSH_KEY_ERROR = `
##[error] Permission denied (publickey)
Make sure that the ssh private key is set correctly, and
that the public key has been added to the target repo
`;
//# sourceMappingURL=errorMessages.js.map

/***/ }),

/***/ 823:
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var parsePath = __webpack_require__(666),
    normalizeUrl = __webpack_require__(53);

/**
 * parseUrl
 * Parses the input url.
 *
 * **Note**: This *throws* if invalid urls are provided.
 *
 * @name parseUrl
 * @function
 * @param {String} url The input url.
 * @param {Boolean|Object} normalize Wheter to normalize the url or not.
 *                         Default is `false`. If `true`, the url will
 *                         be normalized. If an object, it will be the
 *                         options object sent to [`normalize-url`](https://github.com/sindresorhus/normalize-url).
 *
 *                         For SSH urls, normalize won't work.
 *
 * @return {Object} An object containing the following fields:
 *
 *  - `protocols` (Array): An array with the url protocols (usually it has one element).
 *  - `protocol` (String): The first protocol, `"ssh"` (if the url is a ssh url) or `"file"`.
 *  - `port` (null|Number): The domain port.
 *  - `resource` (String): The url domain (including subdomains).
 *  - `user` (String): The authentication user (usually for ssh urls).
 *  - `pathname` (String): The url pathname.
 *  - `hash` (String): The url hash.
 *  - `search` (String): The url querystring value.
 *  - `href` (String): The input url.
 *  - `query` (Object): The url querystring, parsed as object.
 */
function parseUrl(url) {
    var normalize = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    if (typeof url !== "string" || !url.trim()) {
        throw new Error("Invalid url.");
    }
    if (normalize) {
        if ((typeof normalize === "undefined" ? "undefined" : _typeof(normalize)) !== "object") {
            normalize = {
                stripHash: false
            };
        }
        url = normalizeUrl(url, normalize);
    }
    var parsed = parsePath(url);
    return parsed;
}

module.exports = parseUrl;

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