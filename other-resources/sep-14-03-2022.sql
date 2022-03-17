-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: mysql-1
-- Generation Time: Mar 14, 2022 at 10:21 AM
-- Server version: 8.0.27
-- PHP Version: 7.4.20

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sep`
--
CREATE DATABASE IF NOT EXISTS `sep` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `sep`;

-- --------------------------------------------------------

--
-- Table structure for table `item`
--

CREATE TABLE `item` (
  `item_code` int NOT NULL,
  `category` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'The item category.',
  `name` varchar(30) NOT NULL,
  `description` varchar(50) DEFAULT NULL,
  `prescribed` varchar(10) NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` int NOT NULL,
  `image` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT 'Path of the image file.',
  `supplier_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `item`
--

INSERT INTO `item` (`item_code`, `category`, `name`, `description`, `prescribed`, `quantity`, `unit_price`, `image`, `supplier_id`) VALUES
(1, 'Medicine', 'Panadol', 'Panadol for general issues. 1 Card.', 'false', 102, 60, 'images/items/panadoljhxudshnxhnbhbvgioazuidmi.jpg', 3),
(2, 'Medicine', 'Ibuprofen', 'For inflammation and pain', 'true', 19, 275, 'images/items/8f5fef0583c01da95a44816c132f13e3.jpg', 3),
(4, 'Grocery', 'Ambewela fresh milk', 'Ambewela fresh milk 1 liter', 'false', 100, 320, 'images/items/ambewelajnhbdhjnxhbndjcbhhbswyts.jpg', 3),
(5, 'Medicine', 'Piriton', 'Piriton for allergies. 1 card.', 'true', 89, 45, 'images/items/piritonazschlorphenaminzsmjbjgbjhnfr.jpg', 3),
(10, 'Misc', 'Panasonic AA battery', 'Panasonic Alkaline AA battery', 'false', 22, 75, 'images/items/batteriesjnxhjbbjcjfnbvnjnnjnj.jpg', 3),
(13, 'Medicine', 'Ventolin', 'For respiratory problems', 'true', 9, 400, 'images/items/6b9a40b769cee39ec5b9209bf7c24ab1.jpg', 3);

-- --------------------------------------------------------

--
-- Table structure for table `order_item`
--

CREATE TABLE `order_item` (
  `order_id` int NOT NULL COMMENT 'Foreign key with the order table',
  `item_code` int NOT NULL COMMENT 'Foreign key with the item table. ',
  `quantity` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `order_item`
--

INSERT INTO `order_item` (`order_id`, `item_code`, `quantity`) VALUES
(94, 5, 1),
(95, 5, 1),
(96, 5, 1),
(97, 5, 1),
(98, 5, 1),
(99, 5, 1),
(100, 5, 1),
(101, 1, 2),
(101, 5, 1),
(102, 1, 1),
(102, 4, 1),
(102, 10, 1),
(103, 1, 1),
(103, 10, 1),
(103, 13, 1),
(104, 1, 2),
(104, 4, 2),
(104, 5, 2),
(105, 1, 2),
(105, 4, 1),
(106, 1, 2),
(106, 2, 1),
(106, 4, 1),
(106, 13, 2),
(107, 1, 3),
(108, 1, 3),
(108, 4, 5),
(109, 1, 1),
(109, 13, 2),
(110, 5, 1),
(110, 10, 1),
(111, 1, 2),
(111, 4, 2),
(111, 13, 1);

-- --------------------------------------------------------

--
-- Table structure for table `order_table`
--

CREATE TABLE `order_table` (
  `order_id` int NOT NULL,
  `customer_id` int NOT NULL COMMENT 'Foreign key with the customer table.',
  `supplier_id` int NOT NULL,
  `date` date NOT NULL,
  `prescription_needed` varchar(20) NOT NULL DEFAULT 'false',
  `prescription_image` varchar(150) NOT NULL DEFAULT 'null',
  `approval_status` varchar(20) NOT NULL DEFAULT 'pending',
  `total_price` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `order_table`
--

INSERT INTO `order_table` (`order_id`, `customer_id`, `supplier_id`, `date`, `prescription_needed`, `prescription_image`, `approval_status`, `total_price`) VALUES
(94, 1, 3, '2022-03-10', 'true', 'images/prescriptions/1815e518f56146ff65477bf5310a94f5.jpg', 'pending', 45),
(95, 1, 3, '2022-03-10', 'true', 'images/prescriptions/9d022e9dc608030e7a41921cf85f7625.jpg', 'pending', 45),
(96, 1, 3, '2022-03-10', 'true', 'images/prescriptions/7d67a590f8d94feba92e7341a0892c61.jpg', 'pending', 45),
(97, 1, 3, '2022-03-10', 'true', 'images/prescriptions/a9bb5c1946d22d12577be4fed4a777c5.jpg', 'pending', 45),
(98, 1, 3, '2022-03-10', 'true', 'images/prescriptions/115d10c80c553be16b397b3f25c928b0.jpg', 'pending', 45),
(99, 1, 3, '2022-03-10', 'true', 'images/prescriptions/8aa9a213946ed39df0fb8245740cc751.jpg', 'pending', 45),
(100, 1, 3, '2022-03-10', 'true', 'images/prescriptions/bfff6803ce29a5a0523c110f08f09acc.jpg', 'pending', 45),
(101, 15, 3, '2022-03-10', 'true', 'images/prescriptions/2bbe044aff19a05ad002b0487e836b4f.jpg', 'pending', 165),
(102, 15, 3, '2022-03-12', 'false', 'null', 'pending', 455),
(103, 15, 3, '2022-03-12', 'true', 'images/prescriptions/1b975b49ea4501ab218fc1b93268031f.jpg', 'pending', 535),
(104, 15, 3, '2022-03-12', 'true', 'images/prescriptions/f0514a33674a578cb678517459bf89f5.jpg', 'pending', 850),
(105, 15, 3, '2022-03-12', 'false', 'null', 'rejected', 440),
(106, 15, 3, '2022-03-12', 'true', 'images/prescriptions/02bb81a25c9390bb24805158568c7cf8.jpg', 'pending', 1515),
(107, 1, 3, '2022-03-13', 'false', 'null', 'pending', 180),
(108, 1, 3, '2022-03-13', 'false', 'null', 'pending', 1780),
(109, 1, 3, '2022-03-13', 'true', 'images/prescriptions/79b70bcdfa6c83fbf344b61b0882fb04.jpg', 'pending', 860),
(110, 1, 3, '2022-03-13', 'true', 'images/prescriptions/e09fc547b1f2936576d2dd7e3c5852e2.jpg', 'pending', 120),
(111, 15, 3, '2022-03-13', 'true', 'images/prescriptions/848b0d74a6a0e8c9ef9a7eadbbb47e84.jpg', 'pending', 1160);

-- --------------------------------------------------------

--
-- Table structure for table `supplier`
--

CREATE TABLE `supplier` (
  `supplier_id` int NOT NULL,
  `nmra_registration` varchar(20) NOT NULL,
  `pharmacist_registration` varchar(20) NOT NULL,
  `store_description` varchar(250) NOT NULL,
  `store_image` varchar(250) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `supplier`
--

INSERT INTO `supplier` (`supplier_id`, `nmra_registration`, `pharmacist_registration`, `store_description`, `store_image`) VALUES
(3, 'AB1956PQR789', '45896312CV11', 'Lahiru\'s store.', 'images/pharmacies/4899fa704c7362e5e45cf43cc5ebae47.jpg'),
(17, 'GQ1286PSR98', '91137845TXRX', 'This is store 2.', 'images/pharmacies/5435a193dc72ffa0c1ec6854a36b2e5f.jpg'),
(87, 'SDFER335433', 'ASDE2345', '', 'null'),
(88, 'XDFGE3456', 'SDFG2342', 'Test Supplier 2 ', 'null'),
(97, 'AB1956PQR88', '12237945HXHY', '', 'null'),
(99, 'AB1956PQR76', '12237945YUDF', 'Testing sample supplier', 'null');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `user_id` int NOT NULL,
  `type` varchar(20) NOT NULL,
  `email` varchar(30) NOT NULL,
  `first_name` varchar(20) NOT NULL,
  `last_name` varchar(20) DEFAULT NULL,
  `street` varchar(30) DEFAULT NULL,
  `city` varchar(20) NOT NULL,
  `password` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`user_id`, `type`, `email`, `first_name`, `last_name`, `street`, `city`, `password`) VALUES
(1, 'customer', 'gehan@gmail.com', 'Gehan', 'Hettiarachchi', 'Fife road', 'Kottawa', '$2b$04$4bV3DDSxr9.Ei8U3QI7KiODhgBe39HB7pmtX1SC3VylOl0QH/HrSm'),
(2, 'admin', 'damith@gmail.com', 'Damith', 'De Silva', '4th Lane', 'Rajagiriya', '$2b$04$4bV3DDSxr9.Ei8U3QI7KiODhgBe39HB7pmtX1SC3VylOl0QH/HrSm'),
(3, 'supplier', 'lahiru@gmail.com', 'Lahiru', 'Ranasinghe', 'Sand Mine Road', 'Kottawa', '$2b$04$a00jb.m0wsXPYPYLnN2n4uIDmkMYHHBI7rW/tcZvBc3uGBcjC7yFq'),
(15, 'customer', 'john@gmail.com', 'John', 'Bob', 'Main street', 'Kottawa', '$2b$04$4bV3DDSxr9.Ei8U3QI7KiODhgBe39HB7pmtX1SC3VylOl0QH/HrSm'),
(16, 'customer', 'ben@gmail.com', 'Ben', 'Tennyson', 'Regiment road', 'Rajagiriya', '$2b$04$4bV3DDSxr9.Ei8U3QI7KiODhgBe39HB7pmtX1SC3VylOl0QH/HrSm'),
(17, 'supplier', 'shamal@gmail.com', 'Shamal', 'Manawadu', 'Main road', 'kottawa', '$2b$04$4bV3DDSxr9.Ei8U3QI7KiODhgBe39HB7pmtX1SC3VylOl0QH/HrSm'),
(61, 'supplier', 'krishni@gmail.com', 'Krishni', 'Hewa', '49/7A', 'Kottawa', '$2b$04$4bV3DDSxr9.Ei8U3QI7KiODhgBe39HB7pmtX1SC3VylOl0QH/HrSm'),
(81, 'customer', 'sanfara@123', 'Sanfara', 'Imam', 'Main Street', 'Rajagiriya', '$2b$04$4bV3DDSxr9.Ei8U3QI7KiODhgBe39HB7pmtX1SC3VylOl0QH/HrSm'),
(87, 'supplier', 'testsup@gmail.com', 'Super ', 'Health', 'Pannipitiya', 'Rajagiriya', '$2b$04$4bV3DDSxr9.Ei8U3QI7KiODhgBe39HB7pmtX1SC3VylOl0QH/HrSm'),
(88, 'supplier', 'testsup2@gmail.com', 'test', 'supplier2', 'Delkanda', 'Nugegoda', '$2b$04$4bV3DDSxr9.Ei8U3QI7KiODhgBe39HB7pmtX1SC3VylOl0QH/HrSm'),
(97, 'supplier', 'supplier1@gmail.com', 'supplier1', 'supplier1', 'High Level Road', 'Nugegoda', '$2b$04$4bV3DDSxr9.Ei8U3QI7KiODhgBe39HB7pmtX1SC3VylOl0QH/HrSm'),
(99, 'supplier', 'supplier4@gmail.com', 'supplier4', 'supplier4', 'Malwatta Road', 'Rajagiriya', '$2b$04$4bV3DDSxr9.Ei8U3QI7KiODhgBe39HB7pmtX1SC3VylOl0QH/HrSm'),
(100, 'customer', 'sirisena@gmail.com', 'Siri', 'Sena', 'Madiwela', 'Rajagiriya', '$2b$04$4bV3DDSxr9.Ei8U3QI7KiODhgBe39HB7pmtX1SC3VylOl0QH/HrSm');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `item`
--
ALTER TABLE `item`
  ADD PRIMARY KEY (`item_code`),
  ADD KEY `Foreign_key_supplier_id` (`supplier_id`);

--
-- Indexes for table `order_item`
--
ALTER TABLE `order_item`
  ADD PRIMARY KEY (`order_id`,`item_code`),
  ADD KEY `foreign_key_item` (`item_code`);

--
-- Indexes for table `order_table`
--
ALTER TABLE `order_table`
  ADD PRIMARY KEY (`order_id`),
  ADD KEY `foreign_key_customer_table` (`customer_id`),
  ADD KEY `foreign_key_supplier` (`supplier_id`);

--
-- Indexes for table `supplier`
--
ALTER TABLE `supplier`
  ADD PRIMARY KEY (`supplier_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `item`
--
ALTER TABLE `item`
  MODIFY `item_code` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `order_table`
--
ALTER TABLE `order_table`
  MODIFY `order_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=112;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `user_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=102;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `item`
--
ALTER TABLE `item`
  ADD CONSTRAINT `foreign_key_supplier_id` FOREIGN KEY (`supplier_id`) REFERENCES `supplier` (`supplier_id`) ON DELETE CASCADE;

--
-- Constraints for table `order_item`
--
ALTER TABLE `order_item`
  ADD CONSTRAINT `foreign_key_item` FOREIGN KEY (`item_code`) REFERENCES `item` (`item_code`) ON DELETE CASCADE ON UPDATE RESTRICT,
  ADD CONSTRAINT `foreign_key_order` FOREIGN KEY (`order_id`) REFERENCES `order_table` (`order_id`) ON DELETE CASCADE ON UPDATE RESTRICT;

--
-- Constraints for table `order_table`
--
ALTER TABLE `order_table`
  ADD CONSTRAINT `foreign_key_customer` FOREIGN KEY (`customer_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  ADD CONSTRAINT `foreign_key_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE RESTRICT;

--
-- Constraints for table `supplier`
--
ALTER TABLE `supplier`
  ADD CONSTRAINT `foreign_key_user_id` FOREIGN KEY (`supplier_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE RESTRICT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
