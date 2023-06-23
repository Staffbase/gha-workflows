import * as github from "@actions/github";
import * as fs from "fs";
import {Octokit} from "@octokit/rest";

async function addComment() {
    const template = fs.readFileSync(`${process.env.TESTIO_SCRIPTS_DIR}/exploratory_test_comment_template.md`, 'utf8');
    console.log("Template file contents:");
    console.log(template);
    console.log(`Issue number: ${github.context.issue.number}`);

// const octokit = github.getOctokit(`${process.env.GITHUB_TOKEN}`);

    const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN
    });

    await octokit.rest.issues.createComment({
        repo: github.context.repo.repo,
        owner: github.context.repo.owner,
        issue_number: github.context.issue.number,
        body: template,
    });

}

addComment().then();