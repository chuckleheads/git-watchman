import { Application } from 'probot' // eslint-disable-line no-unused-vars

export = (app: Application) => {
  app.on('pull_request.opened', async (context) => {
    const prComment = context.issue({ body: 'Thanks for the pull request! Here is what will happen next:\n 1. Your PR will be reviewed by the maintainers\n 2. If everything looks good, one of them will `approve` it, and your PR will be merged.\n\nThank you for contributing!' })
    await context.github.issues.createComment(prComment)
  })
  app.on(['issue_comment.created', 'issue_comment.edited'], async (context) => {
    if ('comment' in context.payload && 'issue' in context.payload) {
      if (context.payload.comment.body.match(/@git-watchman approve/gi)) {
        const prComment = context.issue({ body: `:metal: I am testing your branch against ${context.repo} before merging it. We do this to ensure that the master branch is never failing tests.` })
        await context.github.issues.createComment(prComment)
      }
    }
  })
}
