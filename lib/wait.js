"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const github = __importStar(require("@actions/github"));
const _ = __importStar(require("lodash"));
const context = github.context;
function wait(ghToken, namePattern, includeQueued, waitMs) {
    return __awaiter(this, void 0, void 0, function* () {
        const octokit = new github.GitHub(ghToken);
        while (true) {
            yield new Promise(resolve => setTimeout(resolve, waitMs));
            console.log('Count jobs with name', namePattern);
            const awaiting = yield exports.getRunningChecksCount(octokit, namePattern, includeQueued ? ['completed', 'queued'] : ['completed']);
            console.log('Found', awaiting, 'jobs');
            if (awaiting <= 0)
                break;
            console.log(`Awaiting ${awaiting} jobs to complete...`);
        }
    });
}
exports.wait = wait;
exports.getRunningChecksCount = (octo, namePattern, status) => __awaiter(this, void 0, void 0, function* () {
    const checks = yield octo.checks.listSuitesForRef(Object.assign({}, context.repo, { ref: context.ref }));
    console.log('Checks found:', JSON.stringify(checks, null, 2));
    if (!checks.data)
        return 0;
    return exports.countMatchingChecks(checks.data.check_suites, namePattern, status);
});
exports.countMatchingChecks = (checks, pattern, status) => _.filter(checks, c => c.node_id !== context.workflow &&
    pattern.test(c.node_id) &&
    _.includes(status, c.status)).length;
