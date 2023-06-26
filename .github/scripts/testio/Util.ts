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
}