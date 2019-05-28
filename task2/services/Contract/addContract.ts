import * as _ from 'lodash';
import { ContractService } from './contract.service';
import { IContract } from './contract.interfaces';
import { validateRequestParameters } from "../validateRequestParameters";

//needed for validation
const requiredFields = {
    renterId: 'number',
    stockId: 'number',
    rentalCost: 'number'
};

//function for creating new contract out of request's JSON body
export default function addContract (contractParameters: object) : Promise<object> {
    const errors: object = validateRequestParameters(contractParameters, requiredFields);
    if (!_.isEmpty(errors)) {

        return Promise.resolve({
            errors
        });
    }

    const newContract: IContract = {
        renterId: contractParameters['renterId'],
        stockId: contractParameters['stockId'],
        rentalCost: contractParameters['rentalCost'],
    };

    const contractService : ContractService = new ContractService();

    return contractService.add(newContract);
};
