import * as fs from "fs";
import * as github from "@actions/github";

async function request(requestMethod: string, endpoint: string, authToken: string, bodyObject?: any): Promise<any> {
    const authTokenString = `Token ${authToken}`;
    let request = {
        method: requestMethod,
        headers: {
            'Authorization': `${authTokenString}`
        }
    };
    if (bodyObject) {
        request.headers = {...request.headers, ...{
                'Content-Type': 'application/json',
            }};
        request = {...request, ...{
                body: JSON.stringify(bodyObject)
            }};
    }
    const response = await fetch(endpoint, request);
    if (response.ok) {
        const result = await response.json();
        if (result) {
            console.log("Successfully received response from request");
            return result;
        }
        return Promise.reject("Deserializing the data from the response wasn't successful");
    } else {
        const error = new Error(response.statusText + " at endpoint: " + endpoint);
        return Promise.reject(error)
    }
}

async function triggerTest() {
    const payloadFile = `${process.env.TESTIO_SCRIPTS_DIR}/testio_payload.json`;
    const testioProductId = `${process.env.TESTIO_PRODUCT_ID}`;
    const testioToken = `${process.env.TESTIO_TOKEN}`;

    const payload = JSON.parse(fs.readFileSync(payloadFile, 'utf8'));
    console.log("Payload:");
    console.log(payload);

    const endpoint = `https://api.test.io/customer/v2/products/${testioProductId}/exploratory_tests`;
    const createdTest = await request("POST", endpoint, testioToken, payload);
    console.log("Created test with id: " + createdTest.exploratory_test.id);

    // TODO write id to output or env
}

triggerTest().then();