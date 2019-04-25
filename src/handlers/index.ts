import { Application, Context } from 'probot';
import { handleMergeRequest } from './merge';
import { handleCloseRequest } from './close'
export async function handlePullRequestChange(app: Application, context: Context) {
    const prComment = context.issue({ body: 'Thanks for the pull request! Here is what will happen next:\n 1. Your PR will be reviewed by the maintainers\n 2. If everything looks good, one of them will `approve` it, and your PR will be merged.\n\nThank you for contributing!' })
    await context.github.issues.createComment(prComment)
}

export async function handleIssueChange(app: Application, context: Context) {
    if ('comment' in context.payload && 'issue' in context.payload) {
        if (context.payload.comment.body.match(/@git-watchman approve/gi)) {
            handleMergeRequest(context)
        } else if (context.payload.comment.body.match(/@git-watchman close/gi)) {
            handleCloseRequest(context)
        }
    }
}
