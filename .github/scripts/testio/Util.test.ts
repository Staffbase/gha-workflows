import {Util} from "./Util";
import fs from "fs";
import betterAjvErrors from 'better-ajv-errors';

describe("TestIO Trigger-from-PR logic", () => {

    let commentBody: string;

    beforeEach(() => {
        const commentPrepareTemplateFile = "exploratory_test_comment_prepare_template.md";
        const commentTemplate = fs.readFileSync(commentPrepareTemplateFile, 'utf8');

        const commentPrepareJsonFile = "exploratory_test_comment_prepare.json";
        const jsonString = fs.readFileSync(commentPrepareJsonFile, 'utf8');

        const requiredInformationPlaceholder = "$$REQUIRED_INFORMATION_TEMPLATE$$";
        commentBody = commentTemplate.replace(requiredInformationPlaceholder, jsonString);
    });

    it('should parse an object from the Github preparation comment', () => {
        const parsedObject = Util.getJsonObjectFromComment( /```json\s(.+)\s```/sm, commentBody, 1);
        expect(parsedObject).not.toBeNull();
    });

    it('should validate parsed object against schema', () => {
        const prepareTestSchemaFile = "exploratory_test_comment_prepare_schema.json";
        const parsedObject = Util.getJsonObjectFromComment( /```json\s(.+)\s```/sm, commentBody, 1);
        const {valid, validation} = Util.validateObjectAgainstSchema(parsedObject, prepareTestSchemaFile);
        if (!valid) {
            if (validation.errors) {
                const output = betterAjvErrors(prepareTestSchemaFile, parsedObject, validation.errors);
                console.log(output);
                throw new Error(output);
            }
        }
        expect(valid).toBe(true);
    });
});