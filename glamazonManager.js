var inquirer = require('inquirer');
var mysql = require('mysql');
var cTable = require('console.table');
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    // Your username
    user: "root",
    // Your password
    password: "root",
    database: "glamazon"
});

function managerPrompt() {
    inquirer.prompt([{
        type: 'list',
        name: 'choice',
        message: 'Select an action',
        choices: ['View inventory', 'View low stock', 'Refill stock', 'Add new product', 'Exit']
    }]).then(function (answers) {
        switch (answers.choice) {
            case 'View inventory':
                return stockDisplay();
            case 'View low stock':
                return stockDisplay(5);
            case 'Refill stock':
                return stockDisplay(false, true);
            case 'Add new product':
                return addProduct();
            case 'Exit':
                return connection.end();
        }
    });
}

function stockDisplay(min, callback) {
    var condition = min ? ' WHERE stock < 5' : '';
    var idArr = [];
    var stockArr = [];
    connection.query('SELECT * FROM products' + condition, function (err, products) {
        for (var i in products) {
            idArr.push(products[i].id);
            stockArr.push(products[i].stock);
        }
        console.table(products);
        if (callback) {
            return refillStock(idArr, stockArr);
        }
        else return managerPrompt();
    });
}

function refillStock(idArr, stockArr) {
    inquirer.prompt([{
        type: 'input',
        name: 'id',
        message: 'What product id would you like to refill?',
        validate: function (value) {
            if (idArr.indexOf(parseInt(value)) > -1) {
                return true;
            }
            return 'Enter a valid ID';
        }
    }, {
        type: 'input',
        name: 'num',
        message: 'How many would you like to add?',
        validate: function (value) {
            if (parseInt(value) > 0) {
                return true;
            }
            return 'Quantity must be > 0';
        }
    }]).then(function (answers) {
        processRefill(parseInt(answers.id), parseInt(answers.num), stockArr[idArr.indexOf(parseInt(answers.id))]);
    });
}

function processRefill(id, num, stock) {
    connection.query('UPDATE products SET stock = ' + (num + stock) + ' WHERE id = ' + id, function (err, results) {
        if (err) throw err;
        stockDisplay();
    });
}

function addProduct() {
    inquirer.prompt([{
        type: 'Input',
        name: 'product',
        message: 'Product name:'
    }, {
        type: 'input',
        name: 'department',
        message: 'Department:'
    }, {
        type: 'input',
        name: 'price',
        message: 'Price:'
    }, {
        type: 'input',
        name: 'stock',
        message: 'Stock level:'
    }]).then(function (answers) {
        connection.query('INSERT INTO products SET ?', {
            product: answers.product,
            department: answers.department,
            price: answers.price,
            stock: answers.stock
        }, function (err, results) {
            if (err) throw err;
            stockDisplay();
        });
    });
}

managerPrompt();