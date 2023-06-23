import * as github from "@actions/github";
import * as fs from "fs";

const template = fs.readFileSync(`${process.env.TESTIO_SCRIPTS_DIR}/exploratory_test_comment_template.md`, 'utf8');
console.log("Template file contents:");
console.log(template);
console.log(`Issue number: ${github.context.issue.number}`);

const octokit = github.getOctokit(`${process.env.GITHUB_TOKEN}`);

// octokit.rest.issues.createComment();
// await octokit.rest.issues.createComment({
//     repo: process.env.GITHUB_REPOSITORY,
//     owner: process.env.GITHUB_REPOSITORY_OWNER,
//     issue_number: parseInt(process.env.GITHUB_ISSUE_NUMBER),
//     body: template,
// });

