import * as github from "@actions/github";
import * as fs from "fs";
import {Octokit} from "@octokit/rest";

async function reportFailure() {
    const errorFileName = `${process.env.TESTIO_ERROR_MSG_FILE}`;
    const errorMessageFilePath = `${process.env.TESTIO_SCRIPTS_DIR}/${errorFileName}`;
    const createCommentUrl = `${process.env.TESTIO_CREATE_COMMENT_URL}`;

    let commentFailureBody = "";
    if (fs.existsSync(errorMessageFilePath)) {
        const errorMessageToReport = fs.readFileSync(errorMessageFilePath, 'utf8');
        commentFailureBody = "🚨 Failure 🚨 :bangbang: ⛔️ Please check the following error  ⛔️ :bangbang: \n```" + errorMessageToReport + "```";
    } else {
        commentFailureBody = "🚨 Failed to trigger a test on TestIO 🚨 Please revise your steps";
    }
    commentFailureBody += ```\n\nAs response to [test creation trigger](${createCommentUrl}).```;

    const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN
    });

    await octokit.rest.issues.createComment({
        repo: github.context.repo.repo,
        owner: github.context.repo.owner,
        issue_number: github.context.issue.number,
        body: commentFailureBody
    });

}

reportFailure().then();