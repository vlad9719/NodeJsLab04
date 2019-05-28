//function to validate request body
export function validateRequestParameters(requestParameters : object, requiredFields: object) : object {
    let errors = {};

    for (let field in requiredFields) {
        if (!requestParameters[field]) {
            errors[field] = 'This field is required';
            continue;
        }

        if (typeof requestParameters[field] !== requiredFields[field]) {
            errors[field] = `This field must be of type ${requiredFields[field]}`;
        }
    }

    return errors;
}