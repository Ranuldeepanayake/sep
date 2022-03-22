-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: mysql-1
-- Generation Time: Feb 26, 2022 at 07:59 PM
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
(1, 'Medicine', 'Panadol', 'Panadol for general issues. 1 Card.', 'false', 35, 60, 'images/items/panadoljhxudshnxhnbhbvgioazuidmi.jpg', 3),
(4, 'Grocery', 'Ambewela fresh milk', 'Ambewela fresh milk 1 liter', 'false', 13, 320, 'images/items/ambewelajnhbdhjnxhbndjcbhhbswyts.jpg', 3),
(5, 'Medicine', 'Piriton', 'Piriton for allergies. 1 card.', 'true', 30, 45, 'images/items/piritonazschlorphenaminzsmjbjgbjhnfr.jpg', 3),
(10, 'Misc', 'Panasonic AA battery', 'Panasonic Alkaline AA battery', 'false', 10, 75, 'images/items/batteriesjnxhjbbjcjfnbvnjnnjnj.jpg', 3);

-- --------------------------------------------------------

--
-- Table structure for table `order_item`
--

CREATE TABLE `order_item` (
  `order_id` int NOT NULL COMMENT 'Foreign key with the order table',
  `item_code` int NOT NULL COMMENT 'Foreign key with the item table. ',
  `quantity` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
(3, 'AB1956PQR78', '', 'Lahiru\'s store.', 'images/pharmacies/8da365245bf851d5d91923a552837446.jpg'),
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
  `password` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`user_id`, `type`, `email`, `first_name`, `last_name`, `street`, `city`, `password`) VALUES
(1, 'customer', 'gehan@gmail.com', 'Gehan', 'Hettiarachchi', 'Fife road', 'Kottawa', 'gehan@123'),
(2, 'admin', 'damith@gmail.com', 'Damith', 'De Silva', '4th Lane', 'Rajagiriya', 'damith@123'),
(3, 'supplier', 'lahiru@gmail.com', 'Lahiruni', 'Ranasinghe', 'Sand Mine Road', 'Kottawa', 'lahiru@123'),
(15, 'customer', 'john@gmail.com', 'John', 'Bob', 'Main street', 'Kottawa', 'john@123'),
(16, 'customer', 'ben@gmail.com', 'Ben', 'Tennyson', 'Regiment road', 'Rajagiriya', 'ben@123'),
(17, 'supplier', 'shamal@gmail.com', 'Shamal', 'Manawadu', 'Main road', 'Rajagiriya', 'shamal@123'),
(61, 'supplier', 'krishnihw@gmail.com', 'Krishni', 'Hewa', '49/7A', 'Kottawa', '1'),
(81, 'customer', 'san@123.com', 'Sanfara', 'Imam', 'Main Street', 'Nugegoda', 'san@321'),
(83, 'customer', 'adam@gmail.com', 'John', 'Adam', 'High Level Road', 'Nugegoda', 'adam@123'),
(84, 'customer', 'kamala@gmail.com', 'Kamala', 'Kamal', 'Nawala Road', 'Rajagiriya', 'kamala@123'),
(85, 'customer', 'kamal@gmailcom', 'kamal', 'kamal', 'High Level Road', 'Kottawa', '12345'),
(86, 'customer', 'test@gmail.com', 'test', 'customer', 'Galle Road', 'Nugegoda', 'test@123'),
(87, 'supplier', 'testsup@gmail.com', 'Super ', 'Health', 'Pannipitiya', 'Kottawa', 'testsup@123'),
(88, 'supplier', 'testsup2@gmail.com', 'test', 'supplier2', 'Delkanda', 'Nugegoda', 'testsup2@123'),
(89, 'customer', 'test2@gmail.com', 'test', 'customer2', 'Galle Road', 'Nugegoda', 'test2@123'),
(94, 'customer', 'harry@gmail.com', 'harry', 'potter', 'Nawala Road', 'Nugegoda', 'harry@123'),
(96, 'customer', 'shathee@gmail.com', 'Shatheela', 'Sanfara', 'Temple Road', 'Nugegoda', 'shathee@123'),
(97, 'supplier', 'supplier1@gmail.com', 'supplier1', 'supplier1', 'High Level Road', 'Nugegoda', 'supplier@123'),
(99, 'supplier', 'supplier4@gmail.com', 'supplier4', 'supplier4', 'Malwatta Road', 'Nugegoda', 'supplier4@123'),
(100, 'customer', 'sirisena@gmail.com', 'Siri', 'Sena', 'Madiwela', 'Rajagiriya', 'sirisena@123');

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
  MODIFY `item_code` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `order_table`
--
ALTER TABLE `order_table`
  MODIFY `order_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `user_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=101;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `item`
--
ALTER TABLE `item`
  ADD CONSTRAINT `foreign_key_supplier_id` FOREIGN KEY (`supplier_id`) REFERENCES `supplier` (`supplier_id`) ON DELETE CASCADE ON UPDATE RESTRICT;

--
-- Constraints for table `order_item`
--
ALTER TABLE `order_item`
  ADD CONSTRAINT `foreign_key_item` FOREIGN KEY (`item_code`) REFERENCES `item` (`item_code`) ON UPDATE RESTRICT,
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
