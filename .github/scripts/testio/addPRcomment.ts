import {Octokit} from "@octokit/rest";
import * as github from "@actions/github";
import * as fs from "fs";
import * as path from "path";

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
})

console.log("List of all env vars:");
console.log(process.env);

console.log("List Github context:");
console.log(github.context);

console.log("List Github issue number:");
console.log(github.context.issue.number);

console.log("List Github repo owner:");
console.log(github.context.repo.owner);

console.log("List Github repo:");
console.log(github.context.repo.repo);

// const template = fs.readFileSync(path.join(process.env.GITHUB_WORKSPACE, '.github/exploratory_test_template.md'), 'utf8');
// console.log("Template file contents:");
// console.log(template);

// await octokit.rest.issues.createComment({
//     repo: process.env.GITHUB_REPOSITORY,
//     owner: process.env.GITHUB_REPOSITORY_OWNER,
//     issue_number: parseInt(process.env.GITHUB_ISSUE_NUMBER),
//     body: template,
// });

