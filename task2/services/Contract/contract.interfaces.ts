export interface IContract {
    renterId: number,
    stockId: number,
    rentalCost: number,
}

export interface IContractService {
    add(newContract : IContract) : Promise<object>,
    remove(renterId: number, stockId: number) : Promise<object>,
    getStocksByRenterId(renterId: number) : Promise<object>,
    getRentersByStockId(stockId: number) : Promise<object>,
    getNRecords(n: number) : Promise<object>
}

export interface IContractDal {
    add(newContract : IContract) : Promise<object>
    remove(renterId: number, stockId: number) : Promise<object>,
    getStocksByRenterId(renterId: number) : Promise<object>,
    getRentersByStockId(stockId: number) : Promise<object>,
    getNRecords(n: number) : Promise<object>
}
