import fs from "fs";
import Ajv, {ValidateFunction} from "ajv";

export class Util {

    public static getJsonObjectFromComment(regex: RegExp, comment: string, expectedIndexOfObject: number): object {
        const matches = regex.exec(comment);
        if (!matches) {
            throw new Error("Provided comment didn't match");
        }
        const jsonContents = matches[expectedIndexOfObject];
        if (!jsonContents) throw new Error("Provided input seems to be empty between ```json and ```");
        const parsedObject = JSON.parse(jsonContents);
        return parsedObject;
    }

    static validateObjectAgainstSchema(parsedObject: object, schemaFile: string): { valid: boolean; validation: ValidateFunction<unknown> } {
        const prepareTestSchema = JSON.parse(fs.readFileSync(schemaFile, 'utf8'));
        const ajv = new Ajv({
            strictTuples: false
        });
        const validation = ajv.compile(prepareTestSchema);
        const valid = validation(parsedObject);
        return {valid, validation};
    }

    static convertPrepareObjectToTestIOPayload(prepareObject: any, repo: string, owner: string, pr: string): any {
        const testioPayload = {
            exploratory_test: {
                test_title: `${owner}/${repo}/${pr}`,
                test_environment: {
                    title: `${owner}/${repo}/${pr} test environment`,
                    url: "https://testio.staffbase.rocks"
                },
                features: [
                    {
                        id: 0,
                        title: "Employee Directory",
                        description: "Employee directory is the place where we can find all employees registered to our web app ",
                        howtofind: "On the header, right side of the search there is an icon, and by clicking on the employee directory icon, we can access employee directory",
                        user_stories: [
                            " As a user, I want to check all the employees registered to our web app"
                        ]
                    }
                ],
                duration: "2",
                testing_type: "rapid"
            }
        };
        return testioPayload;
    }
}