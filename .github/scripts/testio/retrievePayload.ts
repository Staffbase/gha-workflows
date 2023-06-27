import * as github from "@actions/github";
import {Octokit} from "@octokit/rest";
import {Util} from "./Util";
import betterAjvErrors from "better-ajv-errors";
import * as fs from "fs";

async function createPayload() {
    const commentID: number = Number(process.env.TESTIO_SUBMIT_COMMENT_ID);
    const commentUrl = `${process.env.TESTIO_SUBMIT_COMMENT_URL}`;
    const errorFileName = `${process.env.TESTIO_ERROR_MSG_FILE}`;
    console.log("error message file: " + errorFileName);

    const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN
    });

    const retrievedComment = await octokit.rest.issues.getComment({
        repo: github.context.repo.repo,
        owner: github.context.repo.owner,
        comment_id: commentID
    });

    console.log("retrieved comment:");
    console.log(retrievedComment);

    const commentContents: string = retrievedComment.data.body;
    if (!commentContents) Util.throwErrorAndPrepareErrorMessage(`Comment ${commentUrl} seems to be empty`, errorFileName);

    const jsonRegex = /```json\s(.+)\s```/sm;       // everything between ```json and ``` so that we can parse it
    let preparation;
    try {
        preparation = Util.getJsonObjectFromComment(jsonRegex, commentContents, 1);
    } catch (error) {
        Util.throwErrorAndPrepareErrorMessage(error, errorFileName);
    }

    const prepareTestSchemaFile = `${process.env.TESTIO_SCRIPTS_DIR}/exploratory_test_comment_prepare_schema.json`;
    const {valid, validation} = Util.validateObjectAgainstSchema(preparation, prepareTestSchemaFile);
    if (!valid) {
        if (validation.errors) {
            const output = betterAjvErrors(prepareTestSchemaFile, preparation, validation.errors);
            console.log(output);
            Util.throwErrorAndPrepareErrorMessage(`Provided json is not conform to schema: ${output}`, errorFileName);
        }
        Util.throwErrorAndPrepareErrorMessage("Provided json is not conform to schema", errorFileName);
    }

    const testIOPayload = Util.convertPrepareObjectToTestIOPayload(preparation, github.context.repo.repo, github.context.repo.owner, github.context.issue.number);
    console.log("Converted payload:");
    console.log(testIOPayload);
    const payloadFile = `${process.env.TESTIO_SCRIPTS_DIR}/testio_payload.json`;
    await fs.writeFile(payloadFile, JSON.stringify(testIOPayload), (err) => {
        if (err) Util.throwErrorAndPrepareErrorMessage(err.message, errorFileName);
        console.log(`The payload file ${payloadFile} has been saved successfully`);
    });
}

createPayload().then();