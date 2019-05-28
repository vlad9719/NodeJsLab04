import mysql = require("mysql");

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root'
});

connection.connect((error) => {
    if (error) throw error;

    connection.query(`CREATE DATABASE contracts`, error => {
        if (error) throw error;
    });

    connection.query(`USE contracts`, error => {
        if (error) throw error;
    });

    connection.query('CREATE TABLE renters (' +
        'id INT NOT NULL AUTO_INCREMENT,' +
        'name VARCHAR(255),' +
        'PRIMARY KEY (id))',
        (error, result) => {
            if (error) throw error;
            console.log('Table renters created');

            connection.query('CREATE TABLE stocks (' +
                'id INT NOT NULL AUTO_INCREMENT,' +
                'name VARCHAR(255),' +
                'number_of_cells int,' +
                'PRIMARY KEY (id))',
                (error, result) => {
                    if (error) throw error;
                    console.log('Table stocks created');

                    connection.query('CREATE TABLE contracts (' +
                        'renter_id INT NOT NULL,' +
                        'stock_id INT NOT NULL,' +
                        'created_at DATE NOT NULL,' +
                        'rental_cost FLOAT NOT NULL,' +
                        'FOREIGN KEY (renter_id) REFERENCES renters(id),' +
                        'FOREIGN KEY (stock_id) REFERENCES stocks(id))',
                        (error, result) => {
                            if (error) throw error;
                            console.log('Table contracts created');
                            process.exit();
                        });
                });
        });
});