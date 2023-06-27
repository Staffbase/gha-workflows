import * as github from "@actions/github";
import {Octokit} from "@octokit/rest";

async function reportSuccess() {
    const testioCreatedTestId = `${process.env.TESTIO_CREATED_TEST_ID}`;
    const testioSlug = `${process.env.TESTIO_SLUG}`;
    const testioProductId = `${process.env.TESTIO_PRODUCT_ID}`;
    const testURL = "https://" + testioSlug + ".test.io/products/" + testioProductId + "/test_cycles/" + testioCreatedTestId;
    const commentBody = `🎊✨ [Test Created Successfully](${testURL}) ✔️ ✨🎊
    If you want to observe progress you need a TestIO account (👉 ask the QAs), otherwise you can wait for notification in [#auto-qa-testio](https://staffbasehq.slack.com/archives/C03QSRQQJTG).`;

    console.log("test url:");
    console.log(testURL);
    console.log("comment:");
    console.log(commentBody);


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