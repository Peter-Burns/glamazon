CREATE DATABASE glamazon;
USE glamazon;
CREATE TABLE products(
	id INT NOT NULL auto_increment,
    product VARCHAR(100) NOT NULL,
    department VARCHAR(50) NOT NULL,
    price INT NOT NULL,
    stock INT NOT NULL,
    PRIMARY KEY(id)
);
ALTER TABLE products
ADD sales INT NOT NULL DEFAULT 0;