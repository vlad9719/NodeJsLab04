import { ContractService } from './contract.service';

export default function getNContracts (n: number) : Promise<object> {

    const contractService : ContractService = new ContractService();

    return contractService.getNRecords(n);
};