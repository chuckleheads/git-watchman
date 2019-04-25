import { IHttpClientResponse } from 'typed-rest-client/Interfaces';
import interval from 'interval-promise'
import { HttpClient } from 'typed-rest-client/HttpClient';

let httpc: HttpClient = new HttpClient('vsts-node-api');

export async function startBuild(repo: string, owner: string, issue: string, branch: string): Promise<IHttpClientResponse> {
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

export async function pollForMasterStatus(url: string, context: any): Promise<string> {
    return new Promise((resolve, reject) => {
        interval(async (iteration, stop) => {
            try {
                const res = await httpc.get(url, { Authorization: `Bearer ${process.env.BUILDKITE_TOKEN}` })
                const statusBody = JSON.parse(await res.readBody())
                if (statusBody.state !== "passed" && statusBody !== "failed") {
                    console.log("waiting on build to complete");
                } else {
                    resolve(statusBody.state);
                    stop();
                }
            } catch (err) {
                resolve("failed")
                stop();
            }
        }, 5000);
    })

}
