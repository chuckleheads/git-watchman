import { Application } from 'probot' // eslint-disable-line no-unused-vars
import { Clone, Cred } from 'nodegit'
import { dirSync, DirResult } from 'tmp'

export = (app: Application) => {
  app.on('pull_request.opened', async (context) => {
    const prComment = context.issue({ body: 'Thanks for the pull request! Here is what will happen next:\n 1. Your PR will be reviewed by the maintainers\n 2. If everything looks good, one of them will `approve` it, and your PR will be merged.\n\nThank you for contributing!' })
    await context.github.issues.createComment(prComment)
  })
  app.on(['issue_comment.created', 'issue_comment.edited'], async (context) => {
    if ('comment' in context.payload && 'issue' in context.payload) {
      if (context.payload.comment.body.match(/@git-watchman approve/gi)) {
        const prComment = context.issue({ body: `:metal: I am testing your branch against ${context.payload.repository.name} before merging it. We do this to ensure that the master branch is never failing tests.` });
        await context.github.issues.createComment(prComment);
        let tmpDir: DirResult = dirSync();
        if (context.payload.repository.private) {
          // TODO: support private repos https://github.com/nodegit/nodegit/blob/master/examples/cloneFromGithubWith2Factor.js#L20
        }
        console.log(tmpDir.name)
        const localBranchName = `git-watchman/${context.payload.sender.login}/${context.payload.repository.name}/${context.payload.issue.number}`;
        let repo = await Clone.clone(context.payload.repository.clone_url, tmpDir.name);
        const targetCommit = await repo.getHeadCommit()
        let remote = await repo.getRemote("origin")
        // For some reason this generates a branch name like "pull/3/mergerefs/heads/git-watchman/elliott/demo/56"
        const mangledBranchName = `pull/${context.payload.issue.number}/mergerefs/heads/${localBranchName}`
        await remote.fetch([`pull/${context.payload.issue.number}/merge:${localBranchName}`], {}, "help?")
        // remote.push([mangledBranchName], {
        //   callbacks: {
        //     credentials: function (url, userName) {
        //       // TED figure out how to get the token out of probot and into this cred to push as a basic oauth token
        //       return Cred.usernameNew()
        //     }
        //   })
        // console.log("my object: %o", context.payload)
        // tmpDir.removeCallback();
      }
    }
  })
}
