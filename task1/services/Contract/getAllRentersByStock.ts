import * as _ from 'lodash';
import { ContractService } from './contract.service';
import { validateRequestParameters } from "../validateRequestParameters";

//needed for validation
const requiredFields = {
    stockId: 'number',
};

//function for getting all renters by stock ID
export default function getAllRentersByStock (requestParameters: object) : Promise<object> {
    const errors: object = validateRequestParameters(requestParameters, requiredFields);
    if (!_.isEmpty(errors)) {

        return Promise.resolve({
            errors
        });
    }

    const contractService : ContractService = new ContractService();

    return contractService.getRentersByStockId(requestParameters['stockId']);
};
