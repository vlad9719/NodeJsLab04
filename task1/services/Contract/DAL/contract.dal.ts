import {IContract, IContractDal} from "../contract.interfaces";
import mysql = require("mysql");

export class ContractDal implements IContractDal {
    private connection: mysql.Connection;


    private createConnection(): void {
        this.connection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'root',
            database: 'contracts'
        });
    }

    public async add(newContract: IContract): Promise<object> {
        this.createConnection();

        const promise = new Promise((resolve, reject) => {
            return this.renterExists(newContract.renterId)
                .then(renterExists => {
                    if (!renterExists) {
                        reject('No renter with such id');
                        throw new Error('No renter with such id');
                    }
                })
                .then(() => {
                    return this.stockExists(newContract.stockId);
                })
                .then(stockExists => {
                    if (!stockExists) {
                        reject('No stock with such id');
                        throw new Error('No stock with such id');
                    }
                })
                .then(() => {
                    return this.stockHasExtraSpace(newContract.stockId);
                })
                .then(stockHasExtraSpace => {
                    if (!stockHasExtraSpace) {
                        reject('This stock has no available cells');
                        throw new Error('This stock has no available cells');
                    }
                })
                .then(() => {
                    resolve(this.writeNewContractToDatabase(newContract));
                })
                .catch(reason => {
                    return {
                        error: reason
                    }
                })
        })
            .catch(reason => {
                return {
                    error: reason
                }
            });

        return await promise;
    }

    public async getRentersByStockId(stockId: number): Promise<object> {
        this.createConnection();

        const promise = new Promise<object>( (resolve, reject) => {
            return this.stockExists(stockId)
                .then(stockExists => {
                    if (!stockExists) {
                        reject('No stock with such id');
                        throw new Error('No stock with such id');
                    }
                })
                .then(() => {
                    resolve(this.getAllRentersByStockIdFromDatabase(stockId));
                })
                .catch(reason => {
                    return {
                        error: reason
                    };
                })

        })
            .catch(reason => {
                return {
                    error: reason
                };
            });

        return await promise
    }

    public async getStocksByRenterId(renterId: number): Promise<object>{
        this.createConnection();

        const promise = new Promise<object>( (resolve, reject) => {
            return this.renterExists(renterId)
                .then(renterExists => {
                    if (!renterExists) {
                        reject('No renter with such id');
                        throw new Error('No renter with such id');
                    }
                })
                .then(() => {
                    return Promise.all([this.getAllStocksByRenterIdFromDatabase(renterId),
                    this.getTotalRentalCostByRenterIdFromDatabase(renterId)]);
                })
                .then(stocks => {
                    resolve(stocks);
                })
                .catch(reason => {
                    return {
                        error: reason
                    };
                })

        })
            .catch(reason => {
                return {
                    error: reason
                };
            });

        return await promise;
    }

    public async remove(renterId: number, stockId: number): Promise<object> {
        this.createConnection();

        const promise : Promise<object> = new Promise((resolve, reject) => {
            return this.contractExists(renterId, stockId)
                .then(contractExists => {
                    if (!contractExists) {
                        reject('No such contract');
                        throw new Error('No such contract');
                    }
                })
                .then(() => {
                    resolve(this.removeContractFromDatabase(renterId, stockId));
                })
                .catch(reason => {
                    return {
                        error: reason
                    };
                })
        })
            .catch(reason => {
                return {
                    error: reason
                };
            });

        return await promise;
    }

    public async getNRecords(n: number): Promise<object> {
        this.createConnection();

        const promise : Promise<object> = new Promise((resolve, reject) => {
            return this.getNRecordsFromDatabase(n)
                .then(result => {
                    this.connection.end();
                    resolve(result);
                })
        });

        return await promise;
    }

    private writeNewContractToDatabase(newContract: IContract): Promise<object> {
        return new Promise<object>(resolve => {
            const sql = `INSERT INTO contracts (renter_id, stock_id, rental_cost, created_at)
            VALUES (${newContract.renterId}, ${newContract.stockId}, ${newContract.rentalCost}, CURDATE())`;

            this.connection.query(sql, (error, result) => {
                if (error) throw error;

                resolve({
                    addedContract: newContract
                });
            });
        })
    }

    private getAllStocksByRenterIdFromDatabase(renterId: number) : Promise<object> {
        return new Promise<object>(resolve => {
            const sql = `SELECT contracts.created_at as createdAt,
            stocks.name as stockName,
            contracts.rental_cost as rentalCost
            FROM contracts
            JOIN stocks ON contracts.stock_id = stocks.id
            WHERE contracts.renter_id = ${renterId}`;

            this.connection.query(sql, (error, result) => {
                if (error) throw error;

                resolve({
                    contracts: result
                });
            });
        });
    }

    private getAllRentersByStockIdFromDatabase(stockId: number) : Promise<object> {
        return new Promise<object>(resolve => {
            const sql = `SELECT contracts.created_at as createdAt,
            renters.name as renterName,
            contracts.rental_cost as rentalCost
            FROM contracts
            JOIN renters ON contracts.renter_id = renters.id
            WHERE contracts.stock_id = ${stockId}`;

            this.connection.query(sql, (error, result) => {
                if (error) throw error;

                resolve({
                    contracts: result
                });
            });
        })
    }

    private getTotalRentalCostByRenterIdFromDatabase(renterId: number) : Promise<object> {
        return new Promise<object>(resolve => {
            const sql = `SELECT SUM(rental_cost) as totalRentalCost
            FROM contracts
            WHERE renter_id = ${renterId}`;

            this.connection.query(sql, (error, result) => {
                if (error) throw error;
                resolve({
                    totalRentalCost: result[0]['totalRentalCost'].toFixed(2)
                });
            });
        })
    }

    private removeContractFromDatabase(renterId: number, stockId: number): Promise<object> {
        return new Promise<object>(resolve => {
            const sql = `DELETE FROM contracts 
            WHERE renter_id = ${renterId} 
            AND stock_id = ${stockId}`;

            this.connection.query(sql, error => {
                if (error) throw error;

                resolve({
                    removedContract: {
                        renterId,
                        stockId
                    }
                });
            })
        })
    }

    private getNRecordsFromDatabase(n: number) : Promise<object> {
        return new Promise<object>(resolve => {
            const sql = `SELECT * FROM contracts 
            LIMIT ${n}`;

            this.connection.query(sql, (error, result) => {
                if (error) throw error;

                resolve({
                    result
                });
            })
        });
    }

    private renterExists(renterId: number): Promise<boolean> {
        return new Promise<boolean>(resolve => {

            const sql = `SELECT * from renters WHERE id = ${renterId}`;

            this.connection.query(sql, (error, result) => {
                if (error) throw error;
                resolve(result.length ? true : false);
            })
        });
    }

    private stockExists(stockId: number):Promise<boolean> {
        return new Promise<boolean>(resolve => {

            const sql = `SELECT * FROM stocks WHERE id = ${stockId}`;

            this.connection.query(sql, (error, result) => {
                if (error) throw error;

                resolve(result.length ? true : false);
            });
        });
    }

    private contractExists(renterId: number, stockId: number) : Promise<boolean> {
        return new Promise<boolean>(resolve => {
            const sql = `SELECT * FROM contracts 
            WHERE renter_id = ${renterId} 
            AND stock_id = ${stockId}`;

            this.connection.query(sql, (error, result) => {
                if (error) throw error;

                resolve(result.length ? true : false);
            });
        })
    }

    private stockHasExtraSpace(stockId: number): Promise<boolean> {
        let totalCells: number;
        let busyCells: number;
        return new Promise<boolean>(resolve => {
            this.getNumberOfCellsByStockId(stockId)
                .then(numberOfCells => {
                    totalCells = numberOfCells;
                    return this.getNumberOfRentersByStockId(stockId)
                })
                .then(numberOfRenters => {
                    busyCells = numberOfRenters;
                })
                .then(() => {
                    resolve(busyCells[0]['COUNT(*)'] < totalCells);
                });
        });
    }


    private getNumberOfCellsByStockId(stockId: number): Promise<number> {
        return new Promise<number>(resolve => {
            const sql = `SELECT number_of_cells from stocks WHERE id = ${stockId}`;

            this.connection.query(sql, (error, result) => {
                if (error) throw error;
                resolve(result[0].number_of_cells);
            });
        });
    }

    private getNumberOfRentersByStockId(stockId: number): Promise<number> {
        return new Promise<number>(resolve => {
            const sql = `SELECT COUNT(*) from contracts WHERE stock_id = ${stockId}`;

            this.connection.query(sql, (error, result) => {
                if (error) throw error;
                resolve(result);
            })
        })
    }
}
