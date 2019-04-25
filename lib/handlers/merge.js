"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
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
var buildkite_1 = require("../buildkite/buildkite");
// TODO: extract into function that can handle approvals, closes, and other things related to pull requests
function handleMergeRequest(context) {
    return __awaiter(this, void 0, void 0, function () {
        var failedTriggerPrComment, failedMergePrComment, res, body, _a, _b, prComment, status, err_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    failedTriggerPrComment = context.issue({ body: ':sob: I failed to trigger a build for this PR.' });
                    failedMergePrComment = context.issue({ body: ':sob: Looks like the tests failed for master.\n ![](https://media1.giphy.com/media/l49JWMZfuyqbikTDi/200w.gif)' });
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 9, , 11]);
                    return [4 /*yield*/, buildkite_1.startBuild(context.repo().repo, context.repo().owner, context.payload.issue.number, context.payload.issue.title)];
                case 2:
                    res = _c.sent();
                    _b = (_a = JSON).parse;
                    return [4 /*yield*/, res.readBody()];
                case 3:
                    body = _b.apply(_a, [_c.sent()]);
                    prComment = context.issue({
                        body: ":metal: I am testing your branch against " + context.payload.repository.name + " before merging it. We do this to ensure that the master branch is never failing tests. \n\nFollow along in [buildkite](" + body.web_url + ") and I'll merge this PR when everything passes."
                    });
                    return [4 /*yield*/, context.github.issues.createComment(prComment)];
                case 4:
                    _c.sent();
                    return [4 /*yield*/, buildkite_1.pollForMasterStatus(body.url, context)];
                case 5:
                    status = _c.sent();
                    console.log(status);
                    if (!(status === "passed")) return [3 /*break*/, 6];
                    console.log("passed :yey:");
                    mergePR(context);
                    return [3 /*break*/, 8];
                case 6: return [4 /*yield*/, context.github.issues.createComment(failedMergePrComment)];
                case 7:
                    _c.sent();
                    _c.label = 8;
                case 8: return [3 /*break*/, 11];
                case 9:
                    err_1 = _c.sent();
                    return [4 /*yield*/, context.github.issues.createComment(failedTriggerPrComment)];
                case 10:
                    _c.sent();
                    console.error(err_1);
                    return [3 /*break*/, 11];
                case 11: return [2 /*return*/];
            }
        });
    });
}
exports.handleMergeRequest = handleMergeRequest;
function mergePR(context) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (context.payload.comment.body.includes("dry run")) {
                console.log("This is where I'd merge your PR");
            }
            else {
                context.github.pullRequests.merge(context.repo({
                    number: context.payload.issue.number,
                    commit_title: context.payload.issue.title,
                    commit_message: context.payload.issue.html_url,
                    merge_method: "squash",
                }));
            }
            return [2 /*return*/];
        });
    });
}
//# sourceMappingURL=merge.js.map