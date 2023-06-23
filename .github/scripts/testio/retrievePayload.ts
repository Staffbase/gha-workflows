import * as github from "@actions/github";
import * as fs from "fs";
import {Octokit} from "@octokit/rest";
import * as core from "@actions/core";

async function createPayload() {
    const commentID: number = Number(process.env.TESTIO_COMMENT_ID);

    const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN
    });

    const retrievedComment = await octokit.rest.issues.getComment({
        repo: github.context.repo.repo,
        owner: github.context.repo.owner,
        comment_id: commentID
    });

    console.log("This comment has been received:");
    console.log(retrievedComment);

}

createPayload().then();