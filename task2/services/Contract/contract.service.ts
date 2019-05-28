import { ContractDal } from './DAL/contract.dal';
import { IContract, IContractService } from "./contract.interfaces";

export class ContractService implements IContractService {
    private contractDal: ContractDal;

    constructor() {
        this.contractDal = new ContractDal();
    }

    add(newContract: IContract): Promise<object> {
        return this.contractDal.add(newContract);
    }

    remove(renterId: number, stockId: number): Promise<object> {
        return this.contractDal.remove(renterId, stockId);
    }

    getStocksByRenterId(renterId: number): Promise<object> {
        return this.contractDal.getStocksByRenterId(renterId);
    }

    getRentersByStockId(stockId: number): Promise<object> {
        return this.contractDal.getRentersByStockId(stockId);
    }

    getNRecords(n: number) : Promise<object> {
        return this.contractDal.getNRecords(n);
    }
};
