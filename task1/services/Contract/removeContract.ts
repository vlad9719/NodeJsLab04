import * as _ from 'lodash';
import { ContractService } from './contract.service';
import { validateRequestParameters } from "../validateRequestParameters";

//fields and their types for validation
const requiredFields = {
    renterId: 'number',
    stockId: 'number',
};

//function for deleting a contract by renter ID and stock ID
export default function removeContract (contractParameters: object) : Promise<object> {
    const errors: object = validateRequestParameters(contractParameters, requiredFields);
    if (!_.isEmpty(errors)) {

        return Promise.resolve({
            errors
        });
    }

    const contractService : ContractService = new ContractService();

    return contractService.remove(contractParameters['renterId'], contractParameters['stockId']);
};
