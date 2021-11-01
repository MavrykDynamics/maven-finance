"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOriginatedContractAddress = exports.findOperation = exports.confirmOperation = exports.CONFIRM_TIMEOUT = exports.SYNC_INTERVAL = void 0;
// require("dotenv").config();
var taquito_1 = require("@taquito/taquito");
exports.SYNC_INTERVAL = +process.env.SYNC_INTERVAL;
exports.CONFIRM_TIMEOUT = +process.env.CONFIRM_TIMEOUT;
function confirmOperation(tezos, opHash, _a) {
    var _b = _a === void 0 ? {} : _a, initializedAt = _b.initializedAt, fromBlockLevel = _b.fromBlockLevel, signal = _b.signal;
    return __awaiter(this, void 0, Promise, function () {
        var startedAt, currentBlockLevel, currentBlock, i, block, _c, opEntry, err_1, timeToWait;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!initializedAt)
                        initializedAt = Date.now();
                    if (initializedAt && initializedAt + exports.CONFIRM_TIMEOUT < Date.now()) {
                        throw new Error("Confirmation polling timed out");
                    }
                    startedAt = Date.now();
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 10, , 11]);
                    return [4 /*yield*/, tezos.rpc.getBlock()];
                case 2:
                    currentBlock = _d.sent();
                    currentBlockLevel = currentBlock.header.level;
                    i = fromBlockLevel !== null && fromBlockLevel !== void 0 ? fromBlockLevel : currentBlockLevel;
                    _d.label = 3;
                case 3:
                    if (!(i <= currentBlockLevel)) return [3 /*break*/, 9];
                    if (!(i === currentBlockLevel)) return [3 /*break*/, 4];
                    _c = currentBlock;
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, tezos.rpc.getBlock({ block: i })];
                case 5:
                    _c = _d.sent();
                    _d.label = 6;
                case 6:
                    block = _c;
                    return [4 /*yield*/, findOperation(block, opHash)];
                case 7:
                    opEntry = _d.sent();
                    if (opEntry) {
                        return [2 /*return*/, opEntry];
                    }
                    _d.label = 8;
                case 8:
                    i++;
                    return [3 /*break*/, 3];
                case 9: return [3 /*break*/, 11];
                case 10:
                    err_1 = _d.sent();
                    if (process.env.NODE_ENV === "development") {
                        console.error(err_1);
                    }
                    return [3 /*break*/, 11];
                case 11:
                    if (signal === null || signal === void 0 ? void 0 : signal.aborted) {
                        throw new Error("Cancelled");
                    }
                    timeToWait = Math.max(startedAt + exports.SYNC_INTERVAL - Date.now(), 0);
                    return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, timeToWait); })];
                case 12:
                    _d.sent();
                    return [2 /*return*/, confirmOperation(tezos, opHash, {
                            initializedAt: initializedAt,
                            fromBlockLevel: currentBlockLevel ? currentBlockLevel + 1 : fromBlockLevel,
                            signal: signal,
                        })];
            }
        });
    });
}
exports.confirmOperation = confirmOperation;
function findOperation(block, opHash) {
    return __awaiter(this, void 0, void 0, function () {
        var i, _i, _a, op;
        return __generator(this, function (_b) {
            for (i = 3; i >= 0; i--) {
                for (_i = 0, _a = block.operations[i]; _i < _a.length; _i++) {
                    op = _a[_i];
                    if (op.hash === opHash) {
                        return [2 /*return*/, op];
                    }
                }
            }
            return [2 /*return*/, null];
        });
    });
}
exports.findOperation = findOperation;
function getOriginatedContractAddress(opEntry) {
    var _a, _b, _c, _d;
    var results = Array.isArray(opEntry.contents)
        ? opEntry.contents
        : [opEntry.contents];
    var originationOp = results.find(function (op) { return op.kind === taquito_1.OpKind.ORIGINATION; });
    return ((_d = (_c = (_b = (_a = originationOp === null || originationOp === void 0 ? void 0 : originationOp.metadata) === null || _a === void 0 ? void 0 : _a.operation_result) === null || _b === void 0 ? void 0 : _b.originated_contracts) === null || _c === void 0 ? void 0 : _c[0]) !== null && _d !== void 0 ? _d : null);
}
exports.getOriginatedContractAddress = getOriginatedContractAddress;
