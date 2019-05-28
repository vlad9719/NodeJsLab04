import mysql = require("mysql");

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'contracts'
});

connection.connect((error) => {
    if (error) throw error;

    const sql = `CREATE INDEX contract_ids
    ON contracts (renter_id, stock_id)`;

    connection.query(sql, err => {
        if (err) throw err;

        const sql = `CREATE INDEX renter_id
        ON renters (id)`;

        connection.query(sql, err => {
            if (err) throw err;

            const sql = `CREATE INDEX stock_id
            ON stocks (id)`;

            connection.query(sql, err => {
                if (err) throw err;

                console.log('Indices were added');
                process.exit();
            })
        });
    });
});
