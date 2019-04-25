"use strict";
var handlers_1 = require("./handlers");
require('dotenv').config();
module.exports = function (app) {
    // TODO conditioanlly enable this from github.config
    app.on('pull_request.opened', handlers_1.handlePullRequestChange.bind(null, app));
    app.on(['issue_comment.created', 'issue_comment.edited'], handlers_1.handleIssueChange.bind(null, app));
};
//# sourceMappingURL=index.js.map