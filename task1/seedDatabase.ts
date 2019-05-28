import mysql = require("mysql");

const NUMBER_OF_RECORDS: number = 500000;

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'contracts'
});


connection.connect(error => {
    if (error) throw error;

    let sql = `
      CREATE PROCEDURE generate_data()
      BEGIN
        DECLARE i INT DEFAULT 0;
        WHILE i < ${NUMBER_OF_RECORDS} DO
        
          SET @numberOfCells := FLOOR(RAND() * 1000);
          SET @rentalCost := TRUNCATE(RAND() * 10000, 2); 
          
          INSERT INTO renters (name) VALUES ( 
            CONCAT('Renter ', i + 1)
          );
          
          INSERT INTO stocks (name, number_of_cells) VALUES ( 
            CONCAT('Stock ', i + 1),
            @numberOfCells
          );
          
          INSERT INTO contracts (renter_id, stock_id, created_at, rental_cost) VALUES ( 
            i + 1,
            i + 1, 
            CURDATE(), 
            @rentalCost
          );
          SET i = i + 1;
        END WHILE;
      END
      `;

    connection.query(sql, error => {
        if (error) throw error;

        connection.query('CALL generate_data()', error => {
            if (error) throw error;
            console.log('Filled database with data');
            process.exit();
        });
    });
});
