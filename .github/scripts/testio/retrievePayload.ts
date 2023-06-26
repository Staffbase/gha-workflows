import * as github from "@actions/github";
import * as fs from "fs";
import {Octokit} from "@octokit/rest";
import * as core from "@actions/core";
import Ajv from "ajv";

async function createPayload() {
    const commentID: number = Number(process.env.TESTIO_SUBMIT_COMMENT_ID);
    const commentUrl = `${process.env.TESTIO_SUBMIT_COMMENT_URL}`;

    const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN
    });

    const retrievedComment = await octokit.rest.issues.getComment({
        repo: github.context.repo.repo,
        owner: github.context.repo.owner,
        comment_id: commentID
    });

    const commentContents = retrievedComment.data.body;
    if (!commentContents) throw new Error(`Comment ${commentUrl} seems to be empty`);

    const jsonRegex = /```json\s(.+)\s```/sm;       // everything between ```json and ``` so that we can parse it
    const matches = jsonRegex.exec(commentContents);
    const jsonContents = matches[1];                // 0 index = full match, 1 index = 1st capture group
    if (!jsonContents) throw new Error("Provided input seems to be empty between ```json and ```");
    const preparation = JSON.parse(jsonContents);

    const prepareTestSchemaFile = `${process.env.TESTIO_SCRIPTS_DIR}/exploratory_test_comment_prepare_schema.json`;
    const prepareTestSchema = JSON.parse(fs.readFileSync(prepareTestSchemaFile, 'utf8'));
    const ajv = new Ajv();
    const validation = ajv.compile(prepareTestSchema);
    const valid = validation(preparation);
    if (!valid) throw new Error(`Provided json is not conform to schema: ${validation.errors}`);
}

createPayload().then();