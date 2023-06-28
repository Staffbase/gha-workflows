import * as github from "@actions/github";
import {Octokit} from "@octokit/rest";
import {Util} from "./Util";
import fs from "fs";

async function reportSuccess() {
    const submitCommentID: number = Number(process.env.TESTIO_SUBMIT_COMMENT_ID);
    const testioCreatedTestId = `${process.env.TESTIO_CREATED_TEST_ID}`;
    const testioSlug = `${process.env.TESTIO_SLUG}`;
    const testioProductId = `${process.env.TESTIO_PRODUCT_ID}`;
    const testURL = "https://" + testioSlug + ".test.io/products/" + testioProductId + "/test_cycles/" + testioCreatedTestId;
    const createCommentUrl = `${process.env.TESTIO_CREATE_COMMENT_URL}`;

    const payloadFile = `${process.env.TESTIO_SCRIPTS_DIR}/testio_payload.json`;
    const payload = JSON.parse(fs.readFileSync(payloadFile, 'utf8'));

    const commentBody = "🎊✨ [Test Created Successfully](" + testURL + ") ✔️ ✨🎊"
        + "\n<details>"
        + "\n<summary>Details 👇</summary>"
        + "\nThe following payload has been sent to trigger the test on TestIO:"
        + "\n\n```json\n"
        + JSON.stringify(payload, null, 2)
        + "\n```"
        + "\n</details>"
        + (createCommentUrl != "" ? `\nAs response to [test creation trigger](${createCommentUrl}).` : "")
    ;

    const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN
    });

    await octokit.rest.issues.deleteComment({
        repo: github.context.repo.repo,
        owner: github.context.repo.owner,
        comment_id: submitCommentID
    });

    await octokit.rest.issues.createComment({
        repo: github.context.repo.repo,
        owner: github.context.repo.owner,
        issue_number: github.context.issue.number,
        body: commentBody,
    });

    // TODO use comments to pass on comment URLs so that the success/failure comment can link to the first initiating comment
    // TODO delete test environment?
}

reportSuccess().then();