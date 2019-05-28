import * as _ from 'lodash';
import { ContractService } from './contract.service';
import { validateRequestParameters } from "../validateRequestParameters";

//needed for validation
const requiredFields = {
    renterId: 'number',
};

//function for getting all stocks by renter ID
export default function getAllStocksByRenter (requestParameters: object) : Promise<object> {
    const errors: object = validateRequestParameters(requestParameters, requiredFields);
    if (!_.isEmpty(errors)) {

        return Promise.resolve({
            errors
        });
    }

    const contractService : ContractService = new ContractService();

    return contractService.getStocksByRenterId(requestParameters['renterId']);
};
