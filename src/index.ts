import { Application } from 'probot' // eslint-disable-line no-unused-vars

export = (app: Application) => {
  app.on('pull_request', async (context) => {
    const prComment = context.issue({ body: 'Thanks for the pull request! Here is what will happen next:\n 1. Your PR will be reviewed by the maintainers\n 2. If everything looks good, one of them will `approve` it, and your PR will be merged.\n\nThank you for contributing!' })
    await context.github.issues.createComment(prComment)
  })
}
