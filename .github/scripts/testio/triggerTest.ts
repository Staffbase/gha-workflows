import * as fs from "fs";
import {Util} from "./Util";

async function triggerTest() {
    const payloadFile = `${process.env.TESTIO_SCRIPTS_DIR}/testio_payload.json`;
    const testioProductId = `${process.env.TESTIO_PRODUCT_ID}`;
    const testioToken = `${process.env.TESTIO_TOKEN}`;

    const payload = JSON.parse(fs.readFileSync(payloadFile, 'utf8'));
    console.log("Payload:");
    console.log(payload);

    const endpoint = `https://api.test.io/customer/v2/products/${testioProductId}/exploratory_tests`;
    const createdTest = await Util.request("POST", endpoint, testioToken, payload);
    console.log("Created test with id: " + createdTest.exploratory_test.id);

    // TODO write id to output or env
}

triggerTest().then();