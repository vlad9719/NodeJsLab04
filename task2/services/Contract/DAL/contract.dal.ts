import {IContract, IContractDal} from "../contract.interfaces";

const Sequelize = require("sequelize");
const config = require('../../../config.json');

export class ContractDal implements IContractDal {
    private dbOptions: object = {
        host: config.db.host,
        dialect: 'mysql',
        define: {timestamps: false}
    };

    private sequelize;
    private Contract;
    private Renter;
    private Stock;

    constructor() {
        this.sequelize = new Sequelize(config.db.name, config.db.user, config.db.password, this.dbOptions);
        this.Contract = this.sequelize.define('contracts', {
                renter_id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    references: {
                        model: this.Renter,
                        key: 'id'
                    },
                    primaryKey: true
                },
                stock_id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    references: {
                        model: this.Stock,
                        key: 'id'
                    },
                    primaryKey: true
                },
                rental_cost: {
                    type: Sequelize.FLOAT,
                    allowNull: false
                },
                created_at: {
                    type: Sequelize.DATE,
                    allowNull: false
                }
            },
            {
                indexes: [
                    {
                        fields: ['renter_id', 'stock_id']
                    }
                ]
            });

        this.Renter = this.sequelize.define('renters', {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: Sequelize.STRING(255)
            }
        },
            {
                indexes: [
                    {
                        fields: ['id']
                    }
                ]
            });

        this.Stock = this.sequelize.define('stocks', {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: Sequelize.STRING(255)
            },
            number_of_cells: {
                type: Sequelize.INTEGER
            }
        },
            {
                indexes: [
                    {
                        fields: ['id']
                    }
                ]
            });

        this.Renter.hasMany(this.Contract, {foreignKey: 'renter_id'});
        this.Contract.belongsTo(this.Renter, {foreignKey: 'renter_id'});

        this.Stock.hasMany(this.Contract, {foreignKey: 'stock_id'});
        this.Contract.belongsTo(this.Stock, {foreignKey: 'stock_id'});

        this.sequelize.sync();
    }

    public async add(newContract: IContract): Promise<object> {

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
                    console.log('before stock');
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

        const promise = new Promise<object>((resolve, reject) => {
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

    public async getStocksByRenterId(renterId: number): Promise<object> {

        const promise = new Promise<object>((resolve, reject) => {
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

        const promise: Promise<object> = new Promise((resolve, reject) => {
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

        const promise: Promise<object> = new Promise((resolve, reject) => {
            return this.getNRecordsFromDatabase(n)
                .then(result => {
                    resolve(result);
                })
        });

        return await promise;
    }

    private writeNewContractToDatabase(newContract: IContract): Promise<object> {
        return this.Contract.create({
            renter_id: newContract.renterId,
            stock_id: newContract.stockId,
            rental_cost: newContract.rentalCost,
            created_at: new Date()
        });
    }

    private getAllStocksByRenterIdFromDatabase(renterId: number): Promise<object> {
        return this.Contract.findAll({
            where: {
                renter_id: renterId
            },
            include: [this.Stock]
        }).then(result => {
            return {
                contracts: result.map(contract => {
                    return {
                        createdAt: contract.created_at,
                        stockName: contract.stock.name,
                        rentalCost: contract.rental_cost
                    }
                })
            }
        })
    }

    private getAllRentersByStockIdFromDatabase(stockId: number): Promise<object> {
        return this.Contract.findAll({
            where: {
                stock_id: stockId
            },
            include: [this.Renter]
        }).then(result => {
            return {
                contracts: result.map(contract => {
                    return {
                        renterName: contract.renter.name,
                        createdAt: contract.created_at,
                        rentalCost: contract.rental_cost
                    }
                })
            }
        })
    }

    private getTotalRentalCostByRenterIdFromDatabase(renterId: number): Promise<object> {
        return this.Contract.sum('rental_cost', {
            where: {
                renter_id: renterId
            }
        }).then(result => {
            return {
                total: +result.toFixed(2)
            }
        });
    }

    private removeContractFromDatabase(renterId: number, stockId: number): Promise<object> {
        return this.Contract.findOne({
            where: {
                renter_id: renterId,
                stock_id: stockId
            }
        }).then(contract => {
            contract.destroy();
            return {
                deletedContract: contract
            }
        });
    }

    private getNRecordsFromDatabase(n: number): Promise<object> {
        return this.Contract.findAll({
            limit: n
        });
    }

    private renterExists(renterId: number): Promise<boolean> {
        return this.Renter.findOne({
            where: {id: renterId}
        }).then(renter => {
            if (renter) return true;

            return false;
        });
    }

    private stockExists(stockId: number): Promise<boolean> {
        return this.Stock.findOne({
            where: {id: stockId}
        }).then(stock => {
            if (stock) return true;

            return false;
        });
    }

    private contractExists(renterId: number, stockId: number): Promise<boolean> {
        return this.Contract.findOne({
            where: {renter_id: renterId, stock_id: stockId}
        }).then(contract => {
            if (contract) return true;

            return false;
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
                    resolve(busyCells < totalCells);
                });
        });
    }

    private getNumberOfCellsByStockId(stockId: number): Promise<number> {
        return this.Stock.findOne({
            where: {id: stockId}
        })
            .then(stock => {
                return stock.number_of_cells;
            });
    }

    private getNumberOfRentersByStockId(stockId: number): Promise<number> {
        return this.Renter.findAll({
            where: {id: stockId}
        }).then(result => {
            return result.length;
        })
    }
}
