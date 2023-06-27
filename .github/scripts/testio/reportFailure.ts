import * as github from "@actions/github";
import * as fs from "fs";
import {Octokit} from "@octokit/rest";

async function reportFailure() {
    const errorFileName = `${process.env.TESTIO_ERROR_MSG_FILE}`;
    const errorMessageFilePath = `${process.env.TESTIO_SCRIPTS_DIR}/${errorFileName}`;

    let commentBody = "";
    if (fs.existsSync(errorMessageFilePath)) {
        const errorMessageToReport = fs.readFileSync(errorMessageFilePath, 'utf8');
        commentBody = "🚨 Failure 🚨 :bangbang: ⛔️ Please check the following error  ⛔️ :bangbang: \n```" + errorMessageToReport + "```";
    } else {
        commentBody = "🚨 Failed to trigger a test on TestIO 🚨 Please revise your steps";
    }

    const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN
    });

    await octokit.rest.issues.createComment({
        repo: github.context.repo.repo,
        owner: github.context.repo.owner,
        issue_number: github.context.issue.number,
        body: commentBody
    });

}

reportFailure().then();