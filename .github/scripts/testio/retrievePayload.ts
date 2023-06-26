import * as github from "@actions/github";
import {Octokit} from "@octokit/rest";
import {Util} from "./Util";
import betterAjvErrors from "better-ajv-errors";

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
    const preparation = Util.getJsonObjectFromComment(jsonRegex, commentContents, 1);

    const prepareTestSchemaFile = `${process.env.TESTIO_SCRIPTS_DIR}/exploratory_test_comment_prepare_schema.json`;
    const {valid, validation} = Util.validateObjectAgainstSchema(preparation, prepareTestSchemaFile);
    if (!valid) {
        if (validation.errors) {
            const output = betterAjvErrors(prepareTestSchemaFile, preparation, validation.errors);
            console.log(output);
        }
        throw new Error(`Provided json is not conform to schema: ${validation.errors}`);
    }
}

createPayload().then();