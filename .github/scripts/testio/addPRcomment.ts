import * as github from "@actions/github";
import * as fs from "fs";
import {Octokit} from "@octokit/rest";

async function addComment() {
    const commentPrepareTemplateFile = `${process.env.TESTIO_SCRIPTS_DIR}/exploratory_test_comment_prepare_template.md`;
    const commentTemplate = fs.readFileSync(commentPrepareTemplateFile, 'utf8');

    const commentPrepareJsonFile = `${process.env.TESTIO_SCRIPTS_DIR}/exploratory_test_comment_prepare.json`;
    const jsonString = fs.readFileSync(commentPrepareJsonFile, 'utf8');

    const createCommentUrl = `${process.env.TESTIO_CREATE_COMMENT_URL}`;
    const requiredInformationPlaceholder = "$$REQUIRED_INFORMATION_TEMPLATE$$";
    const createCommentPlaceholder = "$$CREATE_COMMENT_URL$$";
    const commentBody = commentTemplate.replace(requiredInformationPlaceholder, jsonString).replace(createCommentPlaceholder, createCommentUrl);

    const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN
    });

    const prepareComment = await octokit.rest.issues.createComment({
        repo: github.context.repo.repo,
        owner: github.context.repo.owner,
        issue_number: github.context.issue.number,
        body: commentBody,
    });

    const prepareCommentUrl = prepareComment.data.html_url;
    const tempFilePath = `${process.env.TESTIO_SCRIPTS_DIR}/exploratory_test_comment_prepare_url`;
    await fs.writeFile(tempFilePath, prepareCommentUrl, (err) => {
        if (err) throw err;
        console.log(`The temporary file ${tempFilePath} has been saved successfully`);
    });

}

addComment().then();