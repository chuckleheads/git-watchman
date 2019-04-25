import { Application } from 'probot' // eslint-disable-line no-unused-vars
import { handlePullRequestChange, handleIssueChange } from './handlers'
require('dotenv').config()

export = (app: Application) => {
  // TODO conditioanlly enable this from github.config
  app.on('pull_request.opened', handlePullRequestChange.bind(null, app))
  app.on(['issue_comment.created', 'issue_comment.edited'], handleIssueChange.bind(null, app))
}

