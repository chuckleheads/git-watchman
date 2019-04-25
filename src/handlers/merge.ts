import { Application, Context } from "probot";
import { startBuild, pollForMasterStatus } from '../buildkite/buildkite'

// TODO: extract into function that can handle approvals, closes, and other things related to pull requests
export async function handleMergeRequest(context: Context) {
    const failedTriggerPrComment = context.issue({ body: ':sob: I failed to trigger a build for this PR.' });
    const failedMergePrComment = context.issue({ body: ':sob: Looks like the tests failed for master.\n ![](https://media1.giphy.com/media/l49JWMZfuyqbikTDi/200w.gif)' });
    try {
        const res = await startBuild(context.repo().repo, context.repo().owner, context.payload.issue.number, context.payload.issue.title);
        const body = JSON.parse(await res.readBody());
        const prComment = context.issue({
            body: `:metal: I am testing your branch against ${context.payload.repository.name} before merging it. We do this to ensure that the master branch is never failing tests. \n\nFollow along in [buildkite](${body.web_url}) and I'll merge this PR when everything passes.`
        });
        await context.github.issues.createComment(prComment);
        const status = await pollForMasterStatus(body.url, context)
        console.log(status)
        if (status === "passed") {
            console.log("passed :yey:");
            mergePR(context)
        } else {
            await context.github.issues.createComment(failedMergePrComment);
        }
    } catch (err) {
        await context.github.issues.createComment(failedTriggerPrComment);
        console.error(err)
    }
}

async function mergePR(context: any) {
    if (context.payload.comment.body.includes("dry run")) {
        console.log("This is where I'd merge your PR")
    } else {
        context.github.pullRequests.merge(context.repo({
            number: context.payload.issue.number,
            commit_title: context.payload.issue.title,
            commit_message: context.payload.issue.html_url,
            merge_method: "squash",
        }))
    }
}
