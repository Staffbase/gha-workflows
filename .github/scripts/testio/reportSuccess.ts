import * as github from "@actions/github";
import {Octokit} from "@octokit/rest";
import {Util} from "./Util";
import fs from "fs";

async function reportSuccess() {
    const testioCreatedTestId = `${process.env.TESTIO_CREATED_TEST_ID}`;
    const testioSlug = `${process.env.TESTIO_SLUG}`;
    const testioProductId = `${process.env.TESTIO_PRODUCT_ID}`;
    const testURL = "https://" + testioSlug + ".test.io/products/" + testioProductId + "/test_cycles/" + testioCreatedTestId;

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
    ;

    const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN
    });

    await octokit.rest.issues.createComment({
        repo: github.context.repo.repo,
        owner: github.context.repo.owner,
        issue_number: github.context.issue.number,
        body: commentBody,
    });

    // TODO delete prepare/submit comment and add summary of payload
    // TODO delete test environment?
}

reportSuccess().then();