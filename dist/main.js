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
Object.defineProperty(exports, "__esModule", { value: true });
const rest_1 = require("@octokit/rest");
const githubToken = process.env.GITHUB_TOKEN;
const octokit = new rest_1.Octokit({ auth: githubToken });
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const context = process.env.GITHUB_EVENT_NAME;
        if (context === 'pull_request' || context === 'issue_comment') {
            const pullRequest = JSON.parse((_a = process.env.GITHUB_EVENT_BODY) !== null && _a !== void 0 ? _a : '');
            yield commentOnPullRequest(pullRequest);
        }
    });
}
function commentOnPullRequest(pullRequest) {
    return __awaiter(this, void 0, void 0, function* () {
        const { owner, repo, number } = pullRequest;
        yield octokit.issues.createComment({
            owner,
            repo,
            issue_number: number,
            body: "Testing a bot",
        });
    });
}
run().catch((error) => {
    console.error(error);
    process.exit(1);
});
