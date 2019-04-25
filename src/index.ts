import { Application } from 'probot' // eslint-disable-line no-unused-vars
import { HttpClient } from 'typed-rest-client/HttpClient';
import { IHttpClientResponse } from 'typed-rest-client/Interfaces';
import interval from 'interval-promise'

require('dotenv').config()

let httpc: HttpClient = new HttpClient('vsts-node-api');

export = (app: Application) => {
  app.on('pull_request.opened', async (context) => {
    const prComment = context.issue({ body: 'Thanks for the pull request! Here is what will happen next:\n 1. Your PR will be reviewed by the maintainers\n 2. If everything looks good, one of them will `approve` it, and your PR will be merged.\n\nThank you for contributing!' })
    await context.github.issues.createComment(prComment)
  })
  app.on(['issue_comment.created', 'issue_comment.edited'], async (context) => {
    if ('comment' in context.payload && 'issue' in context.payload) {
      if (context.payload.comment.body.match(/@git-watchman approve/gi)) {
        const failedTriggerPrComment = context.issue({ body: ':sob: I failed to trigger a build for this PR.' });
        try {
          const res = await startBuild(context.repo().repo, context.repo().owner, context.payload.issue.number, context.payload.issue.title);
          const body = JSON.parse(await res.readBody());
          const prComment = context.issue({
            body: `:metal: I am testing your branch against ${context.payload.repository.name} before merging it. We do this to ensure that the master branch is never failing tests. \n\nFollow along in [buildkite](${body.web_url}) and I'll merge this PR when everything passes.`
          });
          await context.github.issues.createComment(prComment);
          const status = await pollForMasterStatus(body.url, context)
        } catch (err) {
          await context.github.issues.createComment(failedTriggerPrComment);
          console.error(err)
        }
      }
    }
  })
}

async function startBuild(repo: string, owner: string, issue: string, branch: string): Promise<IHttpClientResponse> {
  return httpc.post(`https://api.buildkite.com/v2/organizations/${owner.toLowerCase()}/pipelines/${repo.toLowerCase()}/builds`, JSON.stringify({
    commit: "HEAD",
    branch: `pull/${issue}/merge`,
    message: `Testing master merge for branch: ${branch}`,
    author: {
      name: "The Watchman",
      email: "watchman@salesforce.com"
    }
  }), { Authorization: `Bearer ${process.env.BUILDKITE_TOKEN}` })
}

async function pollForMasterStatus(url: string, context: any): Promise<string> {
  const failedMergePrComment = context.issue({ body: ':sob: Looks like the tests failed for master.\n ![](https://media1.giphy.com/media/l49JWMZfuyqbikTDi/200w.gif)' });
  return interval(async (iteration, stop): string => {
    try {
      const res = await httpc.get(url, { Authorization: `Bearer ${process.env.BUILDKITE_TOKEN}` })
      const statusBody = JSON.parse(await res.readBody())
      if (statusBody.state != "passed" && statusBody != "failed") {
        console.log("waiting on build to complete");
      } else {
        return statusBody.state
      }
      // switch (statusBody.state) {
      //   case "failed":
      //     await context.github.issues.createComment(failedMergePrComment);
      //     stop();
      //     return "failed";
      //   case "passed":
      //     console.log("passed :yey:");
      //     if (context.payload.comment.body.includes("dry run")) {
      //       console.log("This is where I'd merge your PR")
      //     } else {
      //       mergePR(context)
      //     }
      //     stop();
      //     return "passed";
      //   default:
      //     console.log("waiting on build to complete");
      //     break;
      // }
    } catch (err) {
      stop();
      return "failed"
      // await context.github.issues.createComment(failedMergePrComment);
    }
  }, 5000);
}

async function mergePR(context: any) {
  context.github.pullRequests.merge(context.repo({
    number: context.payload.issue.number,
    commit_title: context.payload.issue.title,
    commit_message: context.payload.issue.html_url,
    merge_method: "squash",
  }))
}
