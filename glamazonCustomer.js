var inquirer = require('inquirer');
var mysql = require('mysql');
require('dotenv').config();

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    // Your username
    user: process.env.user,
    // Your password
    password: process.env.password,
    database: "glamazon"
});

function newOrder() {
    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;
        customerPrompt(stockDisplay(results));
    });
}

function stockDisplay(products) {
    console.log('ID | Product | Price | Stock');
    console.log('-----------------------');
    var idArr = [];
    for (var i in products) {
        idArr.push(products[i].id);
        console.log(products[i].id + ' ' + products[i].product + ' $' + products[i].price + ' ' + products[i].stock);
    }
    return idArr;
}

function customerPrompt(idArr) {
    inquirer.prompt([{
        type: 'input',
        name: 'id',
        message: 'What product id would you like to buy?',
        validate: function (value) {
            if (idArr.indexOf(parseInt(value)) > -1) {
                return true;
            }
            return 'Enter a valid ID';
        }
    }, {
        type: 'input',
        name: 'num',
        message: 'How many would you like?',
        validate: function (value) {
            if (parseInt(value) > 0) {
                return true;
            }
            return 'Quantity must be > 0';
        }
    }]).then(function (answers) {
        processOrder(answers.id, answers.num);
    });
}

function processOrder(id, num) {
    connection.query('SELECT stock FROM products WHERE id =' + id, function (err, results) {
        if (err) throw err;
        var stock = results[0].stock;
        if (num <= stock) {
            updateStock(num, stock, id);
        }
        else {
            console.log('Insufficient stock to fulfill order');
            orderAgain();
        }
    });
}

function updateStock(num, stock, id) {
    connection.query('UPDATE products SET stock = ' + (stock - num) + ' WHERE id =' + id, function (err, results) {
        if (err) throw err;
        console.log('Order Submitted!');
        invoiceDisplay(num, id);
    });
}

function invoiceDisplay(num, id) {
    connection.query('SELECT price FROM products WHERE id = ' + id, function (err, results) {
        if (err) throw err;
        var invoiceTotal = num * parseInt(results[0].price);
        updateSales(id, invoiceTotal);
        console.log('Invoice total: $' + invoiceTotal);
        orderAgain();
    });
}

function updateSales(id, invoice) {
    connection.query('UPDATE products SET sales = ? WHERE id=?',[invoice, id],function(err, results){
        if(err)throw err;
    });
}

function orderAgain() {
    inquirer.prompt([{
        type: 'confirm',
        name: 'continue',
        message: 'Make a new order?'
    }]).then(function (answer) {
        if (answer.continue) {
            newOrder();
        }
        else {
            return connection.end();
        }
    });
}

newOrder();