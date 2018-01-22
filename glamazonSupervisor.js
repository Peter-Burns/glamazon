var inquirer = require('inquirer');
var mysql = require('mysql');
var cTable = require('console.table');
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    // Your username
    user: process.env.user,
    // Your password
    password: process.env.password,
    database: "glamazon"
});

function supMenu() {
    inquirer.prompt([{
        type: 'list',
        name: 'choice',
        choices: ['View sales by department', 'Create new department', 'Exit'],
        message: 'Select a command'
    }]).then(function (answers) {
        if (answers.choice == 'View sales by department') {
            viewSales();
        }
        else if (answers.choice == 'Exit') {
            return connection.end();
        }
        else {
            createDept();
        }
    });
}

function viewSales() {
    connection.query('SELECT departments.id as department_id,departments.name as department_name, SUM(sales) as sales, departments.overhead,SUM(sales) - departments.overhead AS profit FROM departments LEFT JOIN products ON departments.name = products.department GROUP BY department ORDER BY (profit) DESC;', function (err, results) {
        if (err) throw err;
        console.table(results);
        supMenu();
    });
}

function createDept() {
    inquirer.prompt([{
        type: 'input',
        name: 'name',
        message: 'Department name: '
    }, {
        type: 'input',
        name: 'overhead',
        message: 'Overhead costs: '
    }]).then(function (answers) {
        connection.query('INSERT INTO departments SET?', {
            name: answers.name,
            overhead: parseInt(answers.overhead)
        }, function (err, results) {
            if (err) throw err;
            supMenu();
        });
    });
}

supMenu();