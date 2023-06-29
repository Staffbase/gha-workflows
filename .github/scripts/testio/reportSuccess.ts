import * as github from "@actions/github";
import {Octokit} from "@octokit/rest";
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

    const commentSuccessTemplateFile = `${process.env.TESTIO_SCRIPTS_DIR}/exploratory_test_comment_success_template.md`;
    const commentSuccessTemplate = fs.readFileSync(commentSuccessTemplateFile, 'utf8');
    const testioTestUrlPlaceholder = "$$TESTIO_TEST_URL$$";
    const sentPayloadPlaceholder = "$$SENT_PAYLOAD$$";
    const createCommentUrlPlaceholder = "$$CREATE_COMMENT_URL$$";
    const successCommentBody = commentSuccessTemplate.replace(testioTestUrlPlaceholder, testURL).replace(sentPayloadPlaceholder, payload).replace(createCommentUrlPlaceholder, createCommentUrl);

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
        body: successCommentBody,
    });

    // TODO delete test environment - options:
    //  1) if test environment sent via payload is copied to test itself 👉 environment can be deleted immediately after creation
    //  2) if test environment sent via payload is referenced in test 👉 weekly cleanup of all temporary test environments via scheduled gha
}

reportSuccess().then();