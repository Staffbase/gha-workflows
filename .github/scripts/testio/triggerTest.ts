import * as fs from "fs";
import {Util} from "./Util";
import * as core from "@actions/core";

async function triggerTest() {
    const payloadFile = `${process.env.TESTIO_SCRIPTS_DIR}/testio_payload.json`;
    const errorFileName = `${process.env.TESTIO_ERROR_MSG_FILE}`;
    const testioProductId = `${process.env.TESTIO_PRODUCT_ID}`;
    const testioToken = `${process.env.TESTIO_TOKEN}`;

    const payload = JSON.parse(fs.readFileSync(payloadFile, 'utf8'));
    console.log("Payload:");
    console.log(payload);

    const endpoint = `https://api.test.io/customer/v2/products/${testioProductId}/exploratory_tests`;
    Util.request("POST", endpoint, testioToken, payload)
        .then((createdTest) => {
            console.log("Created test with id: " + createdTest.exploratory_test.id)
            core.setOutput("testio-created-test-id", createdTest.exploratory_test.id);
        })
        .catch((error) => {
            Util.throwErrorAndPrepareErrorMessage(error, errorFileName);
        });

}

triggerTest().then();