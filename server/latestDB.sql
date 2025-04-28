CREATE DATABASE  IF NOT EXISTS `social` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `social`;
-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: localhost    Database: social
-- ------------------------------------------------------
-- Server version	8.0.30

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `activity`
--

DROP TABLE IF EXISTS `activity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity` (
  `activity_id` int NOT NULL AUTO_INCREMENT,
  `create_on` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id` int DEFAULT NULL,
  `type_id` int DEFAULT NULL,
  PRIMARY KEY (`activity_id`),
  KEY `fk_activity_type` (`type_id`),
  KEY `idx_activity_user_type` (`user_id`,`type_id`),
  CONSTRAINT `fk_activity_type` FOREIGN KEY (`type_id`) REFERENCES `activitytype` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_activity_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=192 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity`
--

LOCK TABLES `activity` WRITE;
/*!40000 ALTER TABLE `activity` DISABLE KEYS */;
INSERT INTO `activity` VALUES (1,'2024-11-03 13:34:36',4,1),(2,'2024-11-05 07:53:12',4,3),(3,'2024-11-05 08:20:16',4,3),(4,'2024-11-05 12:08:05',11,3),(5,'2024-11-05 12:08:09',11,3),(6,'2024-11-06 10:57:02',4,5),(7,'2024-11-09 20:34:15',4,3),(8,'2024-11-09 20:36:47',4,3),(9,'2024-11-09 20:37:02',4,4),(10,'2024-11-09 20:40:03',4,3),(11,'2024-11-09 20:44:02',4,2),(12,'2024-11-10 05:53:47',4,3),(13,'2024-11-10 05:54:50',4,4),(14,'2024-11-10 06:09:49',11,3),(15,'2024-11-10 06:35:37',11,3),(16,'2024-11-10 06:36:10',11,3),(17,'2024-11-10 07:10:05',11,3),(18,'2024-11-10 07:13:14',4,3),(19,'2024-11-10 07:14:18',11,3),(20,'2024-11-10 08:00:06',11,4),(21,'2024-11-10 08:00:20',11,3),(22,'2024-11-10 08:00:24',11,4),(23,'2024-11-10 08:01:01',11,3),(24,'2024-11-10 08:01:40',11,4),(25,'2024-11-10 08:03:26',11,4),(26,'2024-11-10 08:03:30',11,4),(27,'2024-11-10 08:07:17',11,4),(28,'2024-11-10 08:07:22',11,4),(29,'2024-11-10 08:07:25',11,3),(30,'2024-11-10 08:07:27',11,4),(31,'2024-11-10 08:08:22',11,4),(32,'2024-11-10 08:11:37',11,4),(33,'2024-11-10 08:11:42',11,4),(34,'2024-11-10 08:12:25',11,4),(35,'2024-11-10 08:12:29',11,4),(36,'2024-11-10 08:12:38',11,4),(37,'2024-11-10 08:13:04',11,4),(38,'2024-11-10 08:14:06',11,4),(39,'2024-11-10 08:14:34',11,4),(40,'2024-11-10 08:14:52',11,4),(41,'2024-11-10 08:14:58',11,3),(42,'2024-11-10 08:15:00',11,3),(43,'2024-11-10 08:15:03',11,3),(44,'2024-11-10 08:23:58',11,4),(45,'2024-11-10 08:24:34',14,3),(46,'2024-11-10 08:40:10',11,4),(47,'2024-11-10 08:40:13',11,4),(48,'2024-11-10 08:45:47',11,4),(49,'2024-11-10 08:45:50',11,4),(50,'2024-11-10 09:17:21',4,3),(51,'2024-11-10 09:17:33',4,4),(52,'2024-11-10 09:18:20',11,3),(53,'2024-11-10 09:18:29',11,3),(54,'2024-11-10 09:20:05',11,3),(55,'2024-11-10 09:29:32',11,4),(56,'2024-11-10 09:32:13',11,3),(57,'2024-11-10 09:37:45',11,3),(58,'2024-11-10 09:39:29',11,3),(59,'2024-11-10 09:39:39',11,3),(60,'2024-11-10 09:39:56',11,3),(61,'2024-11-10 09:46:21',11,3),(62,'2024-11-10 09:46:24',11,3),(63,'2024-11-10 09:46:47',11,3),(64,'2024-11-10 09:47:21',11,3),(65,'2024-11-10 09:47:47',11,3),(66,'2024-11-10 09:47:49',11,3),(67,'2024-11-10 09:48:09',11,3),(68,'2024-11-10 09:48:39',11,3),(69,'2024-11-10 09:49:07',11,3),(70,'2024-11-10 09:49:14',11,3),(71,'2024-11-10 09:53:15',11,3),(72,'2024-11-10 09:53:35',11,3),(73,'2024-11-10 09:53:39',11,3),(74,'2024-11-10 09:54:17',11,3),(75,'2024-11-10 09:57:04',11,3),(76,'2024-11-10 09:57:12',11,3),(77,'2024-11-10 10:03:12',11,3),(78,'2024-11-10 12:07:58',11,3),(79,'2024-11-10 13:39:27',4,3),(80,'2024-11-10 13:41:30',4,1),(81,'2024-11-10 13:43:28',4,5),(82,'2024-11-10 13:44:19',14,7),(83,'2024-11-10 13:46:26',14,3),(84,'2024-11-10 13:46:34',14,3),(85,'2024-11-10 13:46:56',11,3),(86,'2024-11-10 13:47:01',11,3),(87,'2024-11-10 14:12:02',4,3),(88,'2024-11-10 14:12:17',4,1),(89,'2024-11-10 14:18:18',4,5),(90,'2024-11-10 14:36:38',4,5),(91,'2024-11-10 14:43:16',4,3),(92,'2024-11-10 14:43:57',11,3),(95,'2024-11-10 14:54:47',4,1),(96,'2024-11-10 15:02:04',4,1),(97,'2024-11-10 15:07:54',4,1),(98,'2024-11-10 15:25:08',4,1),(99,'2024-11-10 15:25:46',4,1),(100,'2024-11-10 15:27:26',4,1),(101,'2024-11-10 15:27:33',4,1),(102,'2024-11-10 15:48:37',14,7),(103,'2024-11-10 15:52:01',14,7),(104,'2024-11-10 15:52:12',14,7),(105,'2024-11-10 15:57:01',14,7),(106,'2024-11-10 16:06:34',14,5),(107,'2024-11-10 16:07:31',4,5),(108,'2024-11-10 16:09:38',4,5),(109,'2024-11-10 16:14:29',4,5),(110,'2024-11-10 16:15:13',14,7),(111,'2024-11-10 16:21:51',14,5),(112,'2024-11-10 16:38:27',14,5),(113,'2024-11-10 16:42:46',14,5),(114,'2024-11-10 16:47:38',14,5),(115,'2024-11-10 16:47:48',14,6),(116,'2024-11-10 16:48:03',4,7),(117,'2024-11-10 16:48:05',4,7),(118,'2024-11-10 16:48:12',4,7),(119,'2024-11-10 16:48:51',14,5),(120,'2024-11-10 16:52:40',4,6),(121,'2024-11-10 16:59:27',4,5),(122,'2024-11-10 16:59:41',4,6),(123,'2024-11-10 16:59:45',4,6),(124,'2024-11-10 17:02:57',14,6),(125,'2024-11-10 17:04:18',14,5),(126,'2024-11-10 17:04:23',14,6),(127,'2024-11-10 17:04:27',14,6),(128,'2024-11-10 17:05:35',14,6),(129,'2024-11-10 17:06:53',14,5),(130,'2024-11-10 17:06:58',14,6),(131,'2024-11-10 17:07:08',14,3),(132,'2024-11-10 17:08:49',14,7),(133,'2024-11-10 17:09:22',14,6),(134,'2024-11-10 17:11:03',14,7),(135,'2024-11-10 17:13:17',14,6),(136,'2024-11-10 17:15:28',4,7),(137,'2024-11-10 17:19:38',14,5),(138,'2024-11-10 17:20:58',14,5),(139,'2024-11-10 17:25:16',14,5),(140,'2024-11-10 17:25:24',14,6),(141,'2024-11-10 17:27:26',4,7),(142,'2024-11-10 17:34:32',4,7),(143,'2024-11-10 17:35:23',14,6),(144,'2024-11-10 17:36:27',4,7),(145,'2024-11-10 17:36:37',14,6),(146,'2024-11-10 17:39:46',4,5),(147,'2024-11-10 17:40:03',14,7),(148,'2024-11-10 17:40:11',14,6),(149,'2024-11-10 17:40:22',4,6),(150,'2024-11-10 17:41:32',4,6),(151,'2024-11-10 17:41:42',4,6),(152,'2024-11-10 17:41:48',14,6),(153,'2024-11-10 17:42:28',14,5),(154,'2024-11-10 17:42:35',4,7),(155,'2024-11-10 17:42:58',14,6),(156,'2024-11-10 17:43:22',14,6),(157,'2024-11-10 17:44:10',14,6),(158,'2024-11-10 18:29:29',4,5),(159,'2024-11-11 03:15:18',4,5),(160,'2024-11-11 03:15:47',14,7),(161,'2024-11-11 03:15:48',14,7),(162,'2024-11-11 03:27:16',4,5),(163,'2024-11-11 03:30:13',14,7),(164,'2024-11-11 04:24:13',4,3),(165,'2024-11-11 04:24:29',4,1),(166,'2024-11-11 04:25:46',4,5),(167,'2024-11-11 04:26:24',14,7),(168,'2024-11-11 05:59:48',4,5),(169,'2024-11-11 06:50:22',4,1),(170,'2024-11-11 07:58:10',4,5),(171,'2024-11-11 08:00:11',14,5),(172,'2024-11-11 08:00:35',14,5),(173,'2024-11-11 09:16:28',4,5),(174,'2024-11-11 09:19:14',14,7),(175,'2024-11-11 09:30:06',14,7),(176,'2024-11-11 09:44:48',14,7),(177,'2024-11-11 09:44:52',14,7),(178,'2024-11-11 09:48:54',4,5),(179,'2024-11-11 09:49:16',14,7),(180,'2024-11-11 11:04:39',4,5),(181,'2024-11-11 11:05:07',4,6),(182,'2024-11-11 11:05:28',14,7),(183,'2024-11-11 11:05:29',14,7),(184,'2024-11-11 11:06:32',4,5),(185,'2024-11-11 11:07:00',4,5),(186,'2024-11-11 11:07:37',4,5),(187,'2024-11-11 11:13:35',4,5),(188,'2024-11-11 11:14:33',4,5),(189,'2024-11-11 11:16:51',4,5),(190,'2024-11-11 14:49:10',4,3),(191,'2024-11-11 14:59:09',4,3);
/*!40000 ALTER TABLE `activity` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `activitytype`
--

DROP TABLE IF EXISTS `activitytype`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activitytype` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type_name` varchar(100) NOT NULL,
  `message` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `type_name` (`type_name`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activitytype`
--

LOCK TABLES `activitytype` WRITE;
/*!40000 ALTER TABLE `activitytype` DISABLE KEYS */;
INSERT INTO `activitytype` VALUES (1,'review creation','posted new rating and review'),(2,'review update','updated a review'),(3,'post creation','created a new post'),(4,'post update','updated a post'),(5,'meetup creation','created a new meetup'),(6,'meetup update','updated a Meetup'),(7,'meetup invitation accepted','accepted a meetup request');
/*!40000 ALTER TABLE `activitytype` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `allergies`
--

DROP TABLE IF EXISTS `allergies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `allergies` (
  `allergy_id` int NOT NULL AUTO_INCREMENT,
  `allergy_name` varchar(255) NOT NULL,
  PRIMARY KEY (`allergy_id`),
  UNIQUE KEY `allergy_name` (`allergy_name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `allergies`
--

LOCK TABLES `allergies` WRITE;
/*!40000 ALTER TABLE `allergies` DISABLE KEYS */;
INSERT INTO `allergies` VALUES (2,'Gluten Sensitivity'),(1,'Lactose Intolerance'),(3,'Peanut Allergy'),(4,'Soy Allergy'),(5,'Tree Nut Allergy');
/*!40000 ALTER TABLE `allergies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `allnotification`
--

DROP TABLE IF EXISTS `allnotification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `allnotification` (
  `id` int NOT NULL AUTO_INCREMENT,
  `receiver` int DEFAULT NULL,
  `from_id` int DEFAULT NULL,
  `type` varchar(45) DEFAULT NULL,
  `post_id` int DEFAULT NULL,
  `shop_id` int DEFAULT NULL,
  `article_id` int DEFAULT NULL,
  `meetup_name` varchar(100) DEFAULT NULL,
  `event_name` varchar(100) DEFAULT NULL,
  `created_on` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `refund` decimal(10,2) DEFAULT '0.00',
  `isread` varchar(10) DEFAULT 'unread',
  PRIMARY KEY (`id`),
  KEY `noti-article_idx` (`article_id`),
  KEY `noti-shop_idx` (`shop_id`),
  KEY `noti-from_idx` (`from_id`),
  KEY `noti-to_idx` (`receiver`),
  KEY `noti-post_idx` (`post_id`),
  CONSTRAINT `noti-article` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `noti-from` FOREIGN KEY (`from_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `noti-post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `noti-shop` FOREIGN KEY (`shop_id`) REFERENCES `shoplistings` (`shop_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `noti-to` FOREIGN KEY (`receiver`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=238 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `allnotification`
--

LOCK TABLES `allnotification` WRITE;
/*!40000 ALTER TABLE `allnotification` DISABLE KEYS */;
INSERT INTO `allnotification` VALUES (217,14,4,'meetup request',NULL,NULL,NULL,'21',NULL,'2024-11-11 11:02:07',0.00,'unread'),(218,14,4,'meetup request',NULL,NULL,NULL,'123',NULL,'2024-11-11 11:04:46',0.00,'unread'),(219,4,14,'meetup accepted',NULL,NULL,NULL,'21',NULL,'2024-11-11 11:05:28',0.00,'read'),(220,4,14,'meetup accepted',NULL,NULL,NULL,'123',NULL,'2024-11-11 11:05:29',0.00,'read'),(221,14,11,'suspend account meetup receiver',NULL,NULL,NULL,NULL,NULL,'2024-11-11 11:09:15',0.00,'unread'),(222,4,11,'suspend account meetup creator',NULL,NULL,NULL,NULL,NULL,'2024-11-11 11:09:15',0.00,'read'),(223,4,11,'suspend shop event',NULL,3,NULL,NULL,NULL,'2024-11-11 11:10:25',10.00,'read'),(224,14,4,'meetup request',NULL,NULL,NULL,'213',NULL,'2024-11-11 11:14:38',0.00,'unread'),(225,4,11,'suspend account meetup creator',NULL,NULL,NULL,NULL,NULL,'2024-11-11 11:14:50',0.00,'read'),(226,11,4,'like post',76,NULL,NULL,NULL,NULL,'2024-11-11 11:15:34',0.00,'read'),(227,4,4,'save post',78,NULL,NULL,NULL,NULL,'2024-11-11 11:15:37',0.00,'read'),(228,11,4,'save post',76,NULL,NULL,NULL,NULL,'2024-11-11 11:15:38',0.00,'read'),(229,4,14,'share post',77,NULL,NULL,NULL,NULL,'2024-11-11 11:27:19',0.00,'read'),(230,17,16,'friend request',NULL,NULL,NULL,NULL,NULL,'2024-11-11 12:32:15',0.00,'read'),(231,16,17,'friend request accepted',NULL,NULL,NULL,NULL,NULL,'2024-11-11 12:32:46',0.00,'read'),(232,17,16,'save article',NULL,NULL,12,NULL,NULL,'2024-11-11 14:45:53',0.00,'unread'),(233,16,4,'add post',79,NULL,NULL,NULL,NULL,'2024-11-11 14:49:10',0.00,'read'),(234,14,4,'add post',79,NULL,NULL,NULL,NULL,'2024-11-11 14:49:10',0.00,'unread'),(235,16,4,'add post',80,NULL,NULL,NULL,NULL,'2024-11-11 14:59:09',0.00,'unread'),(236,14,4,'add post',80,NULL,NULL,NULL,NULL,'2024-11-11 14:59:09',0.00,'unread'),(237,14,4,'friend request',NULL,NULL,NULL,NULL,NULL,'2024-11-11 14:59:17',0.00,'unread');
/*!40000 ALTER TABLE `allnotification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `article_topics`
--

DROP TABLE IF EXISTS `article_topics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `article_topics` (
  `article_id` int NOT NULL,
  `topic_id` int NOT NULL,
  PRIMARY KEY (`article_id`,`topic_id`),
  KEY `topic_id` (`topic_id`),
  CONSTRAINT `article_topics_ibfk_1` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `article_topics_ibfk_2` FOREIGN KEY (`topic_id`) REFERENCES `articletopic` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `article_topics`
--

LOCK TABLES `article_topics` WRITE;
/*!40000 ALTER TABLE `article_topics` DISABLE KEYS */;
INSERT INTO `article_topics` VALUES (1,1),(5,1),(7,1),(8,1),(5,2),(6,2),(10,2),(12,2),(3,3),(5,3),(4,4),(5,4),(7,4),(8,4),(5,5),(6,5),(10,5),(12,5),(9,6),(2,8),(7,8),(12,8);
/*!40000 ALTER TABLE `article_topics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `articlecollabs`
--

DROP TABLE IF EXISTS `articlecollabs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `articlecollabs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `article_id` int NOT NULL,
  `author_id` int NOT NULL,
  `collaborator_id` int NOT NULL,
  `added_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `article_id` (`article_id`),
  KEY `author_id` (`author_id`),
  KEY `collaborator_id` (`collaborator_id`),
  CONSTRAINT `articlecollabs_ibfk_1` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `articlecollabs_ibfk_2` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `articlecollabs_ibfk_3` FOREIGN KEY (`collaborator_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `articlecollabs`
--

LOCK TABLES `articlecollabs` WRITE;
/*!40000 ALTER TABLE `articlecollabs` DISABLE KEYS */;
INSERT INTO `articlecollabs` VALUES (6,9,16,17,'2024-11-11 14:46:30'),(7,9,16,17,'2024-11-11 14:46:32'),(8,9,16,17,'2024-11-11 14:46:34'),(9,7,16,17,'2024-11-11 14:46:43');
/*!40000 ALTER TABLE `articlecollabs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `articleimages`
--

DROP TABLE IF EXISTS `articleimages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `articleimages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `article_id` int NOT NULL,
  `img` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_article_image_article` (`article_id`),
  CONSTRAINT `fk_article_image_article` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `articleimages`
--

LOCK TABLES `articleimages` WRITE;
/*!40000 ALTER TABLE `articleimages` DISABLE KEYS */;
/*!40000 ALTER TABLE `articleimages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `articles`
--

DROP TABLE IF EXISTS `articles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `articles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `img` varchar(255) DEFAULT NULL,
  `author_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `author_id` (`author_id`),
  CONSTRAINT `articles_ibfk_1` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `articles`
--

LOCK TABLES `articles` WRITE;
/*!40000 ALTER TABLE `articles` DISABLE KEYS */;
INSERT INTO `articles` VALUES (1,'The Ultimate Guide to Coffee Beans','This article explores different types of coffee beans...','',16,'2024-11-02 06:01:16','2024-11-02 06:01:16'),(2,'How to Perfect Your Latte Art','In this guide, we break down the basics of latte art...','',16,'2024-11-02 06:01:16','2024-11-02 06:01:16'),(3,'Coffee Shop Trends in 2024','Discover the hottest coffee shop trends this year...','',16,'2024-11-02 06:01:16','2024-11-02 06:01:16'),(4,'Mastering Pour-Over Brewing','This article explains how to master the pour-over brewing method...','',16,'2024-11-02 06:01:16','2024-11-02 06:01:16'),(5,'Drinking too much coffee might kill... ','What is Lorem Ipsum?\nLorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.\n\nWhy do we use it?\nIt is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using \'Content here, content here\', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for \'lorem ipsum\' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).\n\n\nWhere does it come from?\nContrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of \"de Finibus Bonorum et Malorum\" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, \"Lorem ipsum dolor sit amet..\", comes from a line in section 1.10.32.\n\nThe standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from \"de Finibus Bonorum et Malorum\" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.\n\nWhere can I get some?\nThere are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don\'t look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn\'t anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.','1730716786188empty-profile-picture.jpg',16,'2024-11-04 10:39:46','2024-11-04 10:39:46'),(6,'ewqe','\nWhere does it come from?\nContrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of \"de Finibus Bonorum et Malorum\" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, \"Lorem ipsum dolor sit amet..\", comes from a line in section 1.10.32.\n\n\n\nThe standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from \"de Finibus Bonorum et Malorum\" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.\n\nWhere can I get some?\nThere are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don\'t look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn\'t anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.\n\n5\n	paragraphs\n	words\n	bytes\n	lists\n	Start with \'Lorem\nipsum dolor sit amet...\'\n','1730717036655solution2.docx',16,'2024-11-04 10:43:56','2024-11-04 10:43:56'),(7,'132123','12321312321312321312321 3123213123 213123213123213123213123213123213123213123213123 213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123 213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213',NULL,16,'2024-11-10 19:19:09','2024-11-11 14:48:09'),(8,'1231312','123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213',NULL,16,'2024-11-10 19:19:59','2024-11-10 19:19:59'),(9,'qweqwe','123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213123213',NULL,16,'2024-11-10 19:20:44','2024-11-10 19:20:44'),(10,'123','// Create a new article\nexport const createArticle = async (req, res) => {\n  const token = req.cookies.accessToken;\n  if (!token) return res.status(401).json(\"Not Logged In!\");\n\n  try {\n    const userInfo = await verifyToken(token);\n    const { title, mainContext, topic, img } = req.body; // `img` should now be an array\n\n    console.log(\"Received img:\", img); // Debugging check\n\n    // Step 1: Insert the article into the `Articles` table\n    const [articleResult] = await db.execute(\n      `INSERT INTO Articles (title, content, author_id, created_at, updated_at) \n       VALUES (?, ?, ?, NOW(), NOW())`,\n      [title, mainContext, userInfo.id]\n    );\n\n    const articleId = articleResult.insertId;\n\n    // Step 2: Insert images into the `articleimages` table\n    if (Array.isArray(img) && img.length > 0) {\n      const imageInsertPromises = img.map((imageUrl) =>\n        db.execute(\n          `INSERT INTO articleimages (article_id, img) VALUES (?, ?)`,\n          [articleId, imageUrl]\n        )\n      );\n\n      await Promise.all(imageInsertPromises);\n    }\n\n    // Step 3: Insert topics into the `Article_Topics` table, if provided\n    if (topic && topic.length > 0) {\n      const topicsArray = Array.isArray(topic) ? topic : topic.split(\",\");\n      const [topicIdsResult] = await db.query(\n        `SELECT id FROM ArticleTopic WHERE topic_name IN (?)`,\n        [topicsArray]\n      );\n\n      const topicInsertPromises = topicIdsResult.map((row) =>\n        db.execute(\n          `INSERT INTO Article_Topics (article_id, topic_id) VALUES (?, ?)`,\n          [articleId, row.id]\n        )\n      );\n\n      await Promise.all(topicInsertPromises);\n    }\n\n    // Step 4: Notify followers and friends\n    // Fetch friends (friendrequest table where the expert is either sender or recipient with status_id = 5)\n    const [friends] = await db.query(\n      `SELECT DISTINCT CASE\n          WHEN sender_id = ? THEN recipient_id\n          ELSE sender_id\n        END AS friend_id\n      FROM friendrequest\n      WHERE (sender_id = ? OR recipient_id = ?) AND status_id = 5`,\n      [userInfo.id, userInfo.id, userInfo.id]\n    );\n\n    // Fetch followers (relationship table where followedUserId is the expert)\n    const [followers] = await db.query(\n      `SELECT followerUserId AS user_id FROM relationship WHERE followedUserId = ?`,\n      [userInfo.id]\n    );\n\n    // Combine friends and followers into a single array of user IDs\n    const notificationUserIds = new Set([\n      ...friends.map((friend) => friend.friend_id),\n      ...followers.map((follower) => follower.user_id),\n    ]);\n\n    // Add notifications for all users\n    const notificationQuery = `\n      INSERT INTO allnotification (\\`to\\`, \\`from\\`, \\`type\\`, \\`article_id\\`)\n      VALUES (?, ?, ?, ?)\n    `;\n    const notificationPromises = Array.from(notificationUserIds).map((userId) =>\n      db.query(notificationQuery, [userId, userInfo.id, \"new article\", articleId])\n    );\n    await Promise.all(notificationPromises);\n\n    res.status(201).json({ message: \"Article created successfully!\" });\n  } catch (err) {\n    console.error(\"Error creating article:\", err.message);\n    res.status(500).json({ error: \"Failed to create article\", details: err.message });\n  }\n};\n// Create a new article\nexport const createArticle = async (req, res) => {\n  const token = req.cookies.accessToken;\n  if (!token) return res.status(401).json(\"Not Logged In!\");\n\n  try {\n    const userInfo = await verifyToken(token);\n    const { title, mainContext, topic, img } = req.body; // `img` should now be an array\n\n    console.log(\"Received img:\", img); // Debugging check\n\n    // Step 1: Insert the article into the `Articles` table\n    const [articleResult] = await db.execute(\n      `INSERT INTO Articles (title, content, author_id, created_at, updated_at) \n       VALUES (?, ?, ?, NOW(), NOW())`,\n      [title, mainContext, userInfo.id]\n    );\n\n    const articleId = articleResult.insertId;\n\n    // Step 2: Insert images into the `articleimages` table\n    if (Array.isArray(img) && img.length > 0) {\n      const imageInsertPromises = img.map((imageUrl) =>\n        db.execute(\n          `INSERT INTO articleimages (article_id, img) VALUES (?, ?)`,\n          [articleId, imageUrl]\n        )\n      );\n\n      await Promise.all(imageInsertPromises);\n    }\n\n    // Step 3: Insert topics into the `Article_Topics` table, if provided\n    if (topic && topic.length > 0) {\n      const topicsArray = Array.isArray(topic) ? topic : topic.split(\",\");\n      const [topicIdsResult] = await db.query(\n        `SELECT id FROM ArticleTopic WHERE topic_name IN (?)`,\n        [topicsArray]\n      );\n\n      const topicInsertPromises = topicIdsResult.map((row) =>\n        db.execute(\n          `INSERT INTO Article_Topics (article_id, topic_id) VALUES (?, ?)`,\n          [articleId, row.id]\n        )\n      );\n\n      await Promise.all(topicInsertPromises);\n    }\n\n    // Step 4: Notify followers and friends\n    // Fetch friends (friendrequest table where the expert is either sender or recipient with status_id = 5)\n    const [friends] = await db.query(\n      `SELECT DISTINCT CASE\n          WHEN sender_id = ? THEN recipient_id\n          ELSE sender_id\n        END AS friend_id\n      FROM friendrequest\n      WHERE (sender_id = ? OR recipient_id = ?) AND status_id = 5`,\n      [userInfo.id, userInfo.id, userInfo.id]\n    );\n\n    // Fetch followers (relationship table where followedUserId is the expert)\n    const [followers] = await db.query(\n      `SELECT followerUserId AS user_id FROM relationship WHERE followedUserId = ?`,\n      [userInfo.id]\n    );\n\n    // Combine friends and followers into a single array of user IDs\n    const notificationUserIds = new Set([\n      ...friends.map((friend) => friend.friend_id),\n      ...followers.map((follower) => follower.user_id),\n    ]);\n\n    // Add notifications for all users\n    const notificationQuery = `\n      INSERT INTO allnotification (\\`to\\`, \\`from\\`, \\`type\\`, \\`article_id\\`)\n      VALUES (?, ?, ?, ?)\n    `;\n    const notificationPromises = Array.from(notificationUserIds).map((userId) =>\n      db.query(notificationQuery, [userId, userInfo.id, \"new article\", articleId])\n    );\n    await Promise.all(notificationPromises);\n\n    res.status(201).json({ message: \"Article created successfully!\" });\n  } catch (err) {\n    console.error(\"Error creating article:\", err.message);\n    res.status(500).json({ error: \"Failed to create article\", details: err.message });\n  }\n};\n// Create a new article\nexport const createArticle = async (req, res) => {\n  const token = req.cookies.accessToken;\n  if (!token) return res.status(401).json(\"Not Logged In!\");\n\n  try {\n    const userInfo = await verifyToken(token);\n    const { title, mainContext, topic, img } = req.body; // `img` should now be an array\n\n    console.log(\"Received img:\", img); // Debugging check\n\n    // Step 1: Insert the article into the `Articles` table\n    const [articleResult] = await db.execute(\n      `INSERT INTO Articles (title, content, author_id, created_at, updated_at) \n       VALUES (?, ?, ?, NOW(), NOW())`,\n      [title, mainContext, userInfo.id]\n    );\n\n    const articleId = articleResult.insertId;\n\n    // Step 2: Insert images into the `articleimages` table\n    if (Array.isArray(img) && img.length > 0) {\n      const imageInsertPromises = img.map((imageUrl) =>\n        db.execute(\n          `INSERT INTO articleimages (article_id, img) VALUES (?, ?)`,\n          [articleId, imageUrl]\n        )\n      );\n\n      await Promise.all(imageInsertPromises);\n    }\n\n    // Step 3: Insert topics into the `Article_Topics` table, if provided\n    if (topic && topic.length > 0) {\n      const topicsArray = Array.isArray(topic) ? topic : topic.split(\",\");\n      const [topicIdsResult] = await db.query(\n        `SELECT id FROM ArticleTopic WHERE topic_name IN (?)`,\n        [topicsArray]\n      );\n\n      const topicInsertPromises = topicIdsResult.map((row) =>\n        db.execute(\n          `INSERT INTO Article_Topics (article_id, topic_id) VALUES (?, ?)`,\n          [articleId, row.id]\n        )\n      );\n\n      await Promise.all(topicInsertPromises);\n    }\n\n    // Step 4: Notify followers and friends\n    // Fetch friends (friendrequest table where the expert is either sender or recipient with status_id = 5)\n    const [friends] = await db.query(\n      `SELECT DISTINCT CASE\n          WHEN sender_id = ? THEN recipient_id\n          ELSE sender_id\n        END AS friend_id\n      FROM friendrequest\n      WHERE (sender_id = ? OR recipient_id = ?) AND status_id = 5`,\n      [userInfo.id, userInfo.id, userInfo.id]\n    );\n\n    // Fetch followers (relationship table where followedUserId is the expert)\n    const [followers] = await db.query(\n      `SELECT followerUserId AS user_id FROM relationship WHERE followedUserId = ?`,\n      [userInfo.id]\n    );\n\n    // Combine friends and followers into a single array of user IDs\n    const notificationUserIds = new Set([\n      ...friends.map((friend) => friend.friend_id),\n      ...followers.map((follower) => follower.user_id),\n    ]);\n\n    // Add notifications for all users\n    const notificationQuery = `\n      INSERT INTO allnotification (\\`to\\`, \\`from\\`, \\`type\\`, \\`article_id\\`)\n      VALUES (?, ?, ?, ?)\n    `;\n    const notificationPromises = Array.from(notificationUserIds).map((userId) =>\n      db.query(notificationQuery, [userId, userInfo.id, \"new article\", articleId])\n    );\n    await Promise.all(notificationPromises);\n\n    res.status(201).json({ message: \"Article created successfully!\" });\n  } catch (err) {\n    console.error(\"Error creating article:\", err.message);\n    res.status(500).json({ error: \"Failed to create article\", details: err.message });\n  }\n};\n',NULL,16,'2024-11-10 19:24:59','2024-11-10 19:24:59'),(12,'qwe','  asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd   asdasdasdasd ',NULL,17,'2024-11-11 12:33:25','2024-11-11 12:33:25');
/*!40000 ALTER TABLE `articles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `articletopic`
--

DROP TABLE IF EXISTS `articletopic`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `articletopic` (
  `id` int NOT NULL AUTO_INCREMENT,
  `topic_name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `articletopic`
--

LOCK TABLES `articletopic` WRITE;
/*!40000 ALTER TABLE `articletopic` DISABLE KEYS */;
INSERT INTO `articletopic` VALUES (1,'Coffee Bean'),(2,'Coffee Type'),(3,'Coffee Shop'),(4,'Brewing Method'),(5,'Coffee Equipment'),(6,'Coffee Culture'),(7,'Coffee Recipes'),(8,'Latte Art'),(9,'Others');
/*!40000 ALTER TABLE `articletopic` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `brewingmethods`
--

DROP TABLE IF EXISTS `brewingmethods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `brewingmethods` (
  `method_id` int NOT NULL AUTO_INCREMENT,
  `method_name` varchar(255) NOT NULL,
  PRIMARY KEY (`method_id`),
  UNIQUE KEY `method_name` (`method_name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `brewingmethods`
--

LOCK TABLES `brewingmethods` WRITE;
/*!40000 ALTER TABLE `brewingmethods` DISABLE KEYS */;
INSERT INTO `brewingmethods` VALUES (3,'Aeropress'),(5,'Cold Brew'),(1,'Espresso'),(2,'French Press'),(4,'Pour Over');
/*!40000 ALTER TABLE `brewingmethods` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `city`
--

DROP TABLE IF EXISTS `city`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `city` (
  `id` int NOT NULL AUTO_INCREMENT,
  `city_name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `city_name` (`city_name`)
) ENGINE=InnoDB AUTO_INCREMENT=80 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `city`
--

LOCK TABLES `city` WRITE;
/*!40000 ALTER TABLE `city` DISABLE KEYS */;
INSERT INTO `city` VALUES (61,'Abu Dhabi'),(44,'Amsterdam'),(58,'Auckland'),(14,'Bali'),(15,'Bandung'),(6,'Bangkok'),(43,'Barcelona'),(40,'Berlin'),(71,'Bogotá'),(37,'Boston'),(73,'Bratislava'),(56,'Brisbane'),(22,'Brunei'),(45,'Brussels'),(68,'Buenos Aires'),(64,'Cairo'),(12,'Cebu City'),(8,'Chiang Mai'),(30,'Chicago'),(53,'Copenhagen'),(63,'Doha'),(60,'Dubai'),(48,'Dublin'),(9,'Hanoi'),(52,'Helsinki'),(10,'Ho Chi Minh City'),(26,'Hong Kong'),(34,'Houston'),(13,'Jakarta'),(65,'Johannesburg'),(2,'Johor Bahru'),(25,'Kaohsiung'),(23,'Kota Kinabalu'),(3,'Kuala Lumpur'),(70,'Lima'),(49,'Lisbon'),(74,'Ljubljana'),(38,'London'),(29,'Los Angeles'),(27,'Macau'),(41,'Madrid'),(5,'Malacca'),(18,'Mandalay'),(11,'Manila'),(55,'Melbourne'),(36,'Mexico City'),(35,'Miami'),(66,'Nairobi'),(28,'New York'),(51,'Oslo'),(39,'Paris'),(4,'Penang'),(57,'Perth'),(20,'Phnom Penh'),(7,'Phuket'),(78,'Reykjavik'),(69,'Rio de Janeiro'),(62,'Riyadh'),(42,'Rome'),(33,'San Francisco'),(72,'Santiago'),(67,'São Paulo'),(21,'Siem Reap'),(1,'Singapore'),(50,'Stockholm'),(16,'Surabaya'),(54,'Sydney'),(24,'Taichung'),(75,'Tallinn'),(79,'Tbilisi'),(31,'Toronto'),(77,'Valletta'),(32,'Vancouver'),(46,'Vienna'),(19,'Vientiane'),(76,'Vilnius'),(59,'Wellington'),(17,'Yangon'),(47,'Zurich');
/*!40000 ALTER TABLE `city` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coffeebeans`
--

DROP TABLE IF EXISTS `coffeebeans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coffeebeans` (
  `bean_id` int NOT NULL AUTO_INCREMENT,
  `bean_name` varchar(255) NOT NULL,
  PRIMARY KEY (`bean_id`),
  UNIQUE KEY `bean_name` (`bean_name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coffeebeans`
--

LOCK TABLES `coffeebeans` WRITE;
/*!40000 ALTER TABLE `coffeebeans` DISABLE KEYS */;
INSERT INTO `coffeebeans` VALUES (1,'Arabica'),(4,'Excelsa'),(3,'Liberica'),(2,'Robusta');
/*!40000 ALTER TABLE `coffeebeans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coffeeexperts`
--

DROP TABLE IF EXISTS `coffeeexperts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coffeeexperts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bio` text,
  `highest_education` varchar(100) DEFAULT NULL,
  `subscription_id` int DEFAULT '2',
  PRIMARY KEY (`id`),
  KEY `fk_expert_subscription` (`subscription_id`),
  CONSTRAINT `expertId` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_expert_subscription` FOREIGN KEY (`subscription_id`) REFERENCES `subscription` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coffeeexperts`
--

LOCK TABLES `coffeeexperts` WRITE;
/*!40000 ALTER TABLE `coffeeexperts` DISABLE KEYS */;
INSERT INTO `coffeeexperts` VALUES (16,'Passionate about the science of coffee, I have dedicated my career to perfecting latte art and exploring the chemistry behind brewing the perfect cup. 20 years of experience in the industry, expert. ','PhD in Coffee Science',2),(17,NULL,NULL,2);
/*!40000 ALTER TABLE `coffeeexperts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coffeetypes`
--

DROP TABLE IF EXISTS `coffeetypes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coffeetypes` (
  `type_id` int NOT NULL AUTO_INCREMENT,
  `type_name` varchar(255) NOT NULL,
  PRIMARY KEY (`type_id`),
  UNIQUE KEY `type_name` (`type_name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coffeetypes`
--

LOCK TABLES `coffeetypes` WRITE;
/*!40000 ALTER TABLE `coffeetypes` DISABLE KEYS */;
INSERT INTO `coffeetypes` VALUES (3,'Americano'),(2,'Cappuccino'),(1,'Latte'),(5,'Macchiato'),(4,'Mocha');
/*!40000 ALTER TABLE `coffeetypes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `desc` varchar(45) NOT NULL,
  `createdAt` datetime DEFAULT NULL,
  `userid` int NOT NULL,
  `postid` int DEFAULT NULL,
  `articleid` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `postid` (`postid`),
  KEY `articletid` (`articleid`),
  KEY `idx_comment_user_post` (`userid`,`postid`),
  CONSTRAINT `articleid` FOREIGN KEY (`articleid`) REFERENCES `articles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `commentUserid` FOREIGN KEY (`userid`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `postid` FOREIGN KEY (`postid`) REFERENCES `posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES (1,'Great post! Totally agree!','2024-11-02 13:07:16',7,9,NULL),(2,'Thanks for the tip, very useful!','2024-11-02 13:07:16',7,10,NULL),(3,'Can’t wait to visit your shop!','2024-11-02 13:07:16',9,11,NULL);
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contactus_subjects`
--

DROP TABLE IF EXISTS `contactus_subjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contactus_subjects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `subject_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contactus_subjects`
--

LOCK TABLES `contactus_subjects` WRITE;
/*!40000 ALTER TABLE `contactus_subjects` DISABLE KEYS */;
INSERT INTO `contactus_subjects` VALUES (1,'General Inquiry','2024-11-02 06:01:16','2024-11-02 06:01:16'),(2,'Technical Support','2024-11-02 06:01:16','2024-11-02 06:01:16'),(3,'Feedback','2024-11-02 06:01:16','2024-11-02 06:01:16'),(4,'Partnership','2024-11-02 06:01:16','2024-11-02 06:01:16'),(5,'Billing Issue','2024-11-02 06:01:16','2024-11-02 06:01:16');
/*!40000 ALTER TABLE `contactus_subjects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contactus_subjects_options`
--

DROP TABLE IF EXISTS `contactus_subjects_options`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contactus_subjects_options` (
  `id` int NOT NULL AUTO_INCREMENT,
  `option_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `subject_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_contactus_subjects_options` (`subject_id`),
  CONSTRAINT `fk_contactus_subjects_options` FOREIGN KEY (`subject_id`) REFERENCES `contactus_subjects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contactus_subjects_options`
--

LOCK TABLES `contactus_subjects_options` WRITE;
/*!40000 ALTER TABLE `contactus_subjects_options` DISABLE KEYS */;
INSERT INTO `contactus_subjects_options` VALUES (1,'General Information','2024-11-02 06:01:16','2024-11-02 06:01:16',1),(2,'Product Inquiry','2024-11-02 06:01:16','2024-11-02 06:01:16',1),(3,'Website Issues','2024-11-02 06:01:16','2024-11-02 06:01:16',2),(4,'Mobile App Issues','2024-11-02 06:01:16','2024-11-02 06:01:16',2),(5,'Account Problems','2024-11-02 06:01:16','2024-11-02 06:01:16',2),(6,'Business Partnership','2024-11-02 06:01:16','2024-11-02 06:01:16',4),(7,'Collaborations','2024-11-02 06:01:16','2024-11-02 06:01:16',4);
/*!40000 ALTER TABLE `contactus_subjects_options` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contactus_submission`
--

DROP TABLE IF EXISTS `contactus_submission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contactus_submission` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `subject_id` int NOT NULL,
  `option_id` int DEFAULT NULL,
  `message` text NOT NULL,
  `replied` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_contactus_submission_subject` (`subject_id`),
  KEY `fk_contactus_submission_option` (`option_id`),
  CONSTRAINT `fk_contactus_submission_option` FOREIGN KEY (`option_id`) REFERENCES `contactus_subjects_options` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_contactus_submission_subject` FOREIGN KEY (`subject_id`) REFERENCES `contactus_subjects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contactus_submission`
--

LOCK TABLES `contactus_submission` WRITE;
/*!40000 ALTER TABLE `contactus_submission` DISABLE KEYS */;
INSERT INTO `contactus_submission` VALUES (1,'test','testing12@gmail.com',2,4,'a',0,'2024-11-02 06:01:16','2024-11-02 06:01:16');
/*!40000 ALTER TABLE `contactus_submission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dayofweek`
--

DROP TABLE IF EXISTS `dayofweek`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dayofweek` (
  `id` int NOT NULL AUTO_INCREMENT,
  `day_name` varchar(200) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `day_name` (`day_name`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dayofweek`
--

LOCK TABLES `dayofweek` WRITE;
/*!40000 ALTER TABLE `dayofweek` DISABLE KEYS */;
INSERT INTO `dayofweek` VALUES (5,'Friday'),(1,'Monday'),(6,'Saturday'),(7,'Sunday'),(4,'Thursday'),(2,'Tuesday'),(3,'Wednesday');
/*!40000 ALTER TABLE `dayofweek` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `deliveryoption`
--

DROP TABLE IF EXISTS `deliveryoption`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `deliveryoption` (
  `id` int NOT NULL AUTO_INCREMENT,
  `option_name` varchar(200) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `option_name` (`option_name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deliveryoption`
--

LOCK TABLES `deliveryoption` WRITE;
/*!40000 ALTER TABLE `deliveryoption` DISABLE KEYS */;
INSERT INTO `deliveryoption` VALUES (3,'Curbside'),(1,'Home Delivery'),(2,'Pick-Up');
/*!40000 ALTER TABLE `deliveryoption` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dietaryrestriction`
--

DROP TABLE IF EXISTS `dietaryrestriction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dietaryrestriction` (
  `id` int NOT NULL AUTO_INCREMENT,
  `restriction_name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dietaryrestriction`
--

LOCK TABLES `dietaryrestriction` WRITE;
/*!40000 ALTER TABLE `dietaryrestriction` DISABLE KEYS */;
INSERT INTO `dietaryrestriction` VALUES (1,'Vegan'),(2,'Gluten-Free'),(3,'Nut-Free'),(4,'Lactose-Free');
/*!40000 ALTER TABLE `dietaryrestriction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `document`
--

DROP TABLE IF EXISTS `document`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `document` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` text NOT NULL,
  `user_id` int DEFAULT NULL,
  `shoplisting_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_document_user_id` (`user_id`),
  KEY `fk_document_shoplisting_id` (`shoplisting_id`),
  CONSTRAINT `fk_document_shoplisting_id` FOREIGN KEY (`shoplisting_id`) REFERENCES `shoplistings` (`shop_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_document_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `document`
--

LOCK TABLES `document` WRITE;
/*!40000 ALTER TABLE `document` DISABLE KEYS */;
INSERT INTO `document` VALUES (1,'1731241202214-Business License.pdf',11,9);
/*!40000 ALTER TABLE `document` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `email_verification`
--

DROP TABLE IF EXISTS `email_verification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `email_verification` (
  `email` varchar(255) NOT NULL,
  `verification_code` varchar(10) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `email_verification`
--

LOCK TABLES `email_verification` WRITE;
/*!40000 ALTER TABLE `email_verification` DISABLE KEYS */;
/*!40000 ALTER TABLE `email_verification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `event`
--

DROP TABLE IF EXISTS `event`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `img` varchar(200) DEFAULT NULL,
  `type_id` int DEFAULT NULL,
  `description` text NOT NULL,
  `start_datetime` timestamp NOT NULL,
  `end_datetime` timestamp NOT NULL,
  `capacity` int DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `owner_id` int DEFAULT NULL,
  `shop_id` int DEFAULT NULL,
  `created_on` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` varchar(45) DEFAULT 'available',
  `exclusive` varchar(45) DEFAULT 'public',
  `tnc` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_event_owner` (`owner_id`),
  KEY `fk_event_shop` (`shop_id`),
  KEY `idx_event_owner_shop` (`id`,`owner_id`,`shop_id`),
  CONSTRAINT `fk_event_owner` FOREIGN KEY (`owner_id`) REFERENCES `shopowners` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_event_shop` FOREIGN KEY (`shop_id`) REFERENCES `shoplistings` (`shop_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event`
--

LOCK TABLES `event` WRITE;
/*!40000 ALTER TABLE `event` DISABLE KEYS */;
INSERT INTO `event` VALUES (16,'Holiday Cookie D3213','default-empty.jpg',5,'Get into the festive spirit by decorating holiday-themed cookies!','2024-12-15 07:00:00','2024-12-15 09:00:00',80,2.00,11,3,'2024-11-10 12:06:53','available','public','One cookie decorating kit per participant. All ages welcome.12312'),(17,'Coffee Tasting event','1731245068597landing page 2.jpg',2,'Coffee cart for your events — Convenience and hospitality at your location — make an impact with B','2024-11-10 13:24:00','2024-11-19 13:24:00',20,10.00,11,3,'2024-11-10 13:24:28','available','exclusive','Non refundable');
/*!40000 ALTER TABLE `event` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `eventtype`
--

DROP TABLE IF EXISTS `eventtype`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `eventtype` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type_name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `eventtype`
--

LOCK TABLES `eventtype` WRITE;
/*!40000 ALTER TABLE `eventtype` DISABLE KEYS */;
INSERT INTO `eventtype` VALUES (1,'Coffee Tasting'),(2,'Brewing Workshop'),(3,'Latte Art Competition'),(4,'Barista Training'),(5,'Coffee Roasting Session');
/*!40000 ALTER TABLE `eventtype` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expertspecialization`
--

DROP TABLE IF EXISTS `expertspecialization`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expertspecialization` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `specialization_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_expert_specialization_user` (`user_id`),
  KEY `fk_expert_specialization_id` (`specialization_id`),
  CONSTRAINT `fk_expert_specialization_id` FOREIGN KEY (`specialization_id`) REFERENCES `specialization` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_expert_specialization_user` FOREIGN KEY (`user_id`) REFERENCES `coffeeexperts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expertspecialization`
--

LOCK TABLES `expertspecialization` WRITE;
/*!40000 ALTER TABLE `expertspecialization` DISABLE KEYS */;
/*!40000 ALTER TABLE `expertspecialization` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favoritearticles`
--

DROP TABLE IF EXISTS `favoritearticles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favoritearticles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `article_id` int NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_favorite_user_article` (`user_id`,`article_id`),
  KEY `fk_favorite_article` (`article_id`),
  CONSTRAINT `fk_favorite_article` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_favorite_article_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favoritearticles`
--

LOCK TABLES `favoritearticles` WRITE;
/*!40000 ALTER TABLE `favoritearticles` DISABLE KEYS */;
INSERT INTO `favoritearticles` VALUES (1,4,1,'2024-11-03 13:36:08'),(6,4,6,'2024-11-10 13:39:56'),(9,4,10,'2024-11-11 04:25:08'),(10,16,12,'2024-11-11 14:45:53');
/*!40000 ALTER TABLE `favoritearticles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favoriteposts`
--

DROP TABLE IF EXISTS `favoriteposts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favoriteposts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `post_id` int DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_favorite_user` (`user_id`),
  KEY `fk_favorite_post` (`post_id`),
  CONSTRAINT `fk_favorite_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_favorite_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favoriteposts`
--

LOCK TABLES `favoriteposts` WRITE;
/*!40000 ALTER TABLE `favoriteposts` DISABLE KEYS */;
INSERT INTO `favoriteposts` VALUES (19,4,73,'2024-11-10 18:29:08'),(21,4,75,'2024-11-10 18:30:29'),(22,4,74,'2024-11-10 18:30:30'),(25,4,78,'2024-11-11 11:15:37'),(26,4,76,'2024-11-11 11:15:38');
/*!40000 ALTER TABLE `favoriteposts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favoriteshops`
--

DROP TABLE IF EXISTS `favoriteshops`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favoriteshops` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `shop_id` int NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_favorite_user_shop` (`user_id`),
  KEY `fk_favorite_shop` (`shop_id`),
  CONSTRAINT `fk_favorite_shop` FOREIGN KEY (`shop_id`) REFERENCES `shoplistings` (`shop_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_favorite_user_shop` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=68 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favoriteshops`
--

LOCK TABLES `favoriteshops` WRITE;
/*!40000 ALTER TABLE `favoriteshops` DISABLE KEYS */;
/*!40000 ALTER TABLE `favoriteshops` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `friendrequest`
--

DROP TABLE IF EXISTS `friendrequest`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `friendrequest` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sender_id` int NOT NULL,
  `recipient_id` int NOT NULL,
  `status_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_friend_request_sender` (`sender_id`),
  KEY `fk_friend_request_recipient` (`recipient_id`),
  KEY `fk_friend_request_status` (`status_id`),
  CONSTRAINT `fk_friend_request_recipient` FOREIGN KEY (`recipient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_friend_request_sender` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_friend_request_status` FOREIGN KEY (`status_id`) REFERENCES `status` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `friendrequest`
--

LOCK TABLES `friendrequest` WRITE;
/*!40000 ALTER TABLE `friendrequest` DISABLE KEYS */;
INSERT INTO `friendrequest` VALUES (18,16,17,5,'2024-11-11 12:32:15'),(19,4,14,4,'2024-11-11 14:59:17');
/*!40000 ALTER TABLE `friendrequest` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gender`
--

DROP TABLE IF EXISTS `gender`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gender` (
  `id` int NOT NULL AUTO_INCREMENT,
  `gender_name` varchar(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `gender_name` (`gender_name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gender`
--

LOCK TABLES `gender` WRITE;
/*!40000 ALTER TABLE `gender` DISABLE KEYS */;
INSERT INTO `gender` VALUES (2,'female'),(1,'male'),(3,'non-binary');
/*!40000 ALTER TABLE `gender` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobtitle`
--

DROP TABLE IF EXISTS `jobtitle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobtitle` (
  `id` int NOT NULL AUTO_INCREMENT,
  `job_name` varchar(200) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `job_name` (`job_name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobtitle`
--

LOCK TABLES `jobtitle` WRITE;
/*!40000 ALTER TABLE `jobtitle` DISABLE KEYS */;
INSERT INTO `jobtitle` VALUES (2,'Barista'),(3,'Cafe Manager'),(4,'Coffee Roaster'),(6,'Espresso Specialist'),(5,'Latte Artist'),(1,'Owner');
/*!40000 ALTER TABLE `jobtitle` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `likes`
--

DROP TABLE IF EXISTS `likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `likes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userid` int NOT NULL,
  `postid` int DEFAULT NULL,
  `articleid` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `likePostid` (`postid`),
  KEY `likeArticletid` (`articleid`),
  KEY `idx_like_user_post` (`userid`,`postid`),
  CONSTRAINT `likeArticletid` FOREIGN KEY (`articleid`) REFERENCES `articles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `likePostid` FOREIGN KEY (`postid`) REFERENCES `posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `likeUserid` FOREIGN KEY (`userid`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `likes`
--

LOCK TABLES `likes` WRITE;
/*!40000 ALTER TABLE `likes` DISABLE KEYS */;
INSERT INTO `likes` VALUES (39,16,75,NULL),(40,16,74,NULL),(41,16,NULL,5),(42,4,74,NULL),(43,4,73,NULL),(44,4,72,NULL),(50,4,75,NULL),(53,4,NULL,6),(55,4,NULL,5),(57,4,NULL,2),(58,16,NULL,1),(60,4,NULL,10),(62,4,76,NULL),(63,4,78,NULL);
/*!40000 ALTER TABLE `likes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `meetup`
--

DROP TABLE IF EXISTS `meetup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `meetup` (
  `meetup_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `startDate_Time` timestamp NOT NULL,
  `endDate_Time` timestamp NOT NULL,
  `shop_id` int NOT NULL,
  `event_id` int DEFAULT NULL,
  PRIMARY KEY (`meetup_id`),
  KEY `fk_meetup_shop` (`shop_id`),
  KEY `fk_meetup_event` (`event_id`),
  KEY `fk_meetup_user` (`user_id`),
  CONSTRAINT `fk_meetup_event` FOREIGN KEY (`event_id`) REFERENCES `event` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_meetup_shop` FOREIGN KEY (`shop_id`) REFERENCES `shoplistings` (`shop_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_meetup_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `meetup`
--

LOCK TABLES `meetup` WRITE;
/*!40000 ALTER TABLE `meetup` DISABLE KEYS */;
INSERT INTO `meetup` VALUES (40,4,'213','123','2024-11-11 12:16:00','2024-11-11 14:18:00',3,NULL);
/*!40000 ALTER TABLE `meetup` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `meetuprequest`
--

DROP TABLE IF EXISTS `meetuprequest`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `meetuprequest` (
  `request_id` int NOT NULL AUTO_INCREMENT,
  `meetup_id` int NOT NULL,
  `status_id` int DEFAULT NULL,
  `sender_id` int NOT NULL,
  `recipient_id` int NOT NULL,
  `sent_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`request_id`),
  KEY `fk_sender_id` (`sender_id`),
  KEY `fk_recipient_id` (`recipient_id`),
  KEY `fk_meetup_id` (`meetup_id`),
  CONSTRAINT `fk_meetup_id` FOREIGN KEY (`meetup_id`) REFERENCES `meetup` (`meetup_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_recipient_id` FOREIGN KEY (`recipient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_sender_id` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `meetuprequest`
--

LOCK TABLES `meetuprequest` WRITE;
/*!40000 ALTER TABLE `meetuprequest` DISABLE KEYS */;
/*!40000 ALTER TABLE `meetuprequest` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menuitem`
--

DROP TABLE IF EXISTS `menuitem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menuitem` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `desc` text,
  `img` varchar(255) DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `usual_price` decimal(10,2) DEFAULT NULL,
  `discounted_rate` int DEFAULT NULL,
  `availability` tinyint(1) DEFAULT '1',
  `special` tinyint(1) DEFAULT '0',
  `shop_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `fk_menuitem_category` (`category_id`),
  KEY `fk_menuitem_shop` (`shop_id`),
  KEY `idx_menuitem_shop` (`id`,`shop_id`),
  CONSTRAINT `fk_menuitem_category` FOREIGN KEY (`category_id`) REFERENCES `menuitemcategory` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_menuitem_shop` FOREIGN KEY (`shop_id`) REFERENCES `shoplistings` (`shop_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_discounted_rate` CHECK (((`discounted_rate` >= 0) and (`discounted_rate` <= 100)))
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menuitem`
--

LOCK TABLES `menuitem` WRITE;
/*!40000 ALTER TABLE `menuitem` DISABLE KEYS */;
INSERT INTO `menuitem` VALUES (23,'testingasdasd','dsadas','1731245431032landing page.jpg',1,112.00,10,1,1,3);
/*!40000 ALTER TABLE `menuitem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menuitemcategory`
--

DROP TABLE IF EXISTS `menuitemcategory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menuitemcategory` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menuitemcategory`
--

LOCK TABLES `menuitemcategory` WRITE;
/*!40000 ALTER TABLE `menuitemcategory` DISABLE KEYS */;
INSERT INTO `menuitemcategory` VALUES (1,'Coffee'),(2,'Pastries'),(3,'Snacks');
/*!40000 ALTER TABLE `menuitemcategory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menuitemdietaryrestriction`
--

DROP TABLE IF EXISTS `menuitemdietaryrestriction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menuitemdietaryrestriction` (
  `id` int NOT NULL AUTO_INCREMENT,
  `restriction_id` int DEFAULT NULL,
  `menuitem_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_menuitem_id` (`menuitem_id`),
  KEY `fk_menuitem_restriction` (`restriction_id`),
  CONSTRAINT `fk_menuitem_id` FOREIGN KEY (`menuitem_id`) REFERENCES `menuitem` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_menuitem_restriction` FOREIGN KEY (`restriction_id`) REFERENCES `dietaryrestriction` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menuitemdietaryrestriction`
--

LOCK TABLES `menuitemdietaryrestriction` WRITE;
/*!40000 ALTER TABLE `menuitemdietaryrestriction` DISABLE KEYS */;
INSERT INTO `menuitemdietaryrestriction` VALUES (28,1,23);
/*!40000 ALTER TABLE `menuitemdietaryrestriction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification`
--

DROP TABLE IF EXISTS `notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification` (
  `notification_id` int NOT NULL AUTO_INCREMENT,
  `description` text,
  `is_read` tinyint(1) DEFAULT '0',
  `create_on` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id` int DEFAULT NULL,
  `type_id` int DEFAULT NULL,
  PRIMARY KEY (`notification_id`),
  KEY `fk_notification_type` (`type_id`),
  KEY `idx_notification_user_type` (`user_id`,`type_id`),
  CONSTRAINT `fk_notification_type` FOREIGN KEY (`type_id`) REFERENCES `notificationtype` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_notification_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification`
--

LOCK TABLES `notification` WRITE;
/*!40000 ALTER TABLE `notification` DISABLE KEYS */;
INSERT INTO `notification` VALUES (1,'You have a new message from Alex!',0,'2024-11-02 06:01:16',4,4),(2,'Security alert: Suspicious login detected.',0,'2024-11-02 06:01:16',4,5),(3,'Your subscription has been renewed.',0,'2024-11-02 06:01:16',4,7),(4,'A new update is available for your app.',0,'2024-11-02 06:01:16',4,6),(5,'Reminder: Join the upcoming event this weekend!',0,'2024-11-02 06:01:16',4,8),(6,'A new feature has been added to your dashboard!',0,'2024-11-02 06:01:16',11,6),(7,'Your account security settings were changed.',0,'2024-11-02 06:01:16',16,5),(8,'You have a new message from John!',0,'2024-11-02 06:01:16',11,4),(9,'Your subscription has been upgraded.',0,'2024-11-02 06:01:16',16,7),(10,'Reminder: Update your profile.',0,'2024-11-02 06:01:16',11,3);
/*!40000 ALTER TABLE `notification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notificationtype`
--

DROP TABLE IF EXISTS `notificationtype`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notificationtype` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type_name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `type_name` (`type_name`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificationtype`
--

LOCK TABLES `notificationtype` WRITE;
/*!40000 ALTER TABLE `notificationtype` DISABLE KEYS */;
INSERT INTO `notificationtype` VALUES (2,'Account Upgrade'),(8,'Event'),(4,'Message'),(3,'Reminder'),(5,'Security'),(7,'Subscription'),(6,'Update'),(1,'Welcome');
/*!40000 ALTER TABLE `notificationtype` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `platformfeatures`
--

DROP TABLE IF EXISTS `platformfeatures`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `platformfeatures` (
  `id` int NOT NULL AUTO_INCREMENT,
  `feature_name` varchar(255) NOT NULL,
  `description` text,
  `feature_image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `platformfeatures`
--

LOCK TABLES `platformfeatures` WRITE;
/*!40000 ALTER TABLE `platformfeatures` DISABLE KEYS */;
INSERT INTO `platformfeatures` VALUES (1,'Advanced Analytics','Provides detailed analytics for coffee shop performance.',NULL,'2024-11-02 06:01:16'),(2,'Mobile Ordering','Allows users to place orders directly from their mobile devices.',NULL,'2024-11-02 06:01:16'),(3,'Customer Loyalty Program','A rewards program that provides points and discounts to frequent customers.',NULL,'2024-11-02 06:01:16'),(4,'Inventory Management','Manage inventory levels and track supplies in real-time.',NULL,'2024-11-02 06:01:16'),(5,'Marketing Automation','Automates the creation and delivery of marketing campaigns.',NULL,'2024-11-02 06:01:16'),(6,'Event Management','Allows shop owners to create and manage events such as coffee tastings or workshops.',NULL,'2024-11-02 06:01:16'),(7,'Customer Feedback','Collects feedback from customers about their experience.',NULL,'2024-11-02 06:01:16'),(8,'Online Menu Customization','Allows owners to create and customize their online menus.',NULL,'2024-11-02 06:01:16'),(9,'Staff Scheduling','Provides tools for scheduling and managing staff shifts.',NULL,'2024-11-02 06:01:16'),(10,'Payment Integration','Integrates various payment options for seamless checkout.',NULL,'2024-11-02 06:01:16');
/*!40000 ALTER TABLE `platformfeatures` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `platformreviews`
--

DROP TABLE IF EXISTS `platformreviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `platformreviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `feature_id` int DEFAULT NULL,
  `rating` decimal(2,1) DEFAULT NULL,
  `review_text` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_platform_review_user` (`user_id`),
  KEY `fk_platform_review_feature` (`feature_id`),
  CONSTRAINT `fk_platform_review_feature` FOREIGN KEY (`feature_id`) REFERENCES `platformfeatures` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_platform_review_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `platformreviews_chk_1` CHECK (((`rating` >= 1) and (`rating` <= 5)))
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `platformreviews`
--

LOCK TABLES `platformreviews` WRITE;
/*!40000 ALTER TABLE `platformreviews` DISABLE KEYS */;
INSERT INTO `platformreviews` VALUES (1,1,7,4.0,'Simple and effective for providing feedback.','2024-08-01 10:30:00'),(2,4,6,5.0,'A fantastic way to manage my events!','2024-09-10 14:15:00'),(3,6,10,4.8,'Fast and seamless payment experience.','2024-07-25 09:45:00'),(4,11,8,4.5,'Easy to customize and update the menu.','2024-09-20 17:30:00'),(5,13,9,4.2,'The scheduling tool is helpful, but could use more features.','2024-08-15 11:20:00'),(6,16,NULL,5.0,'This training feature is great for learning new skills.','2024-10-01 13:45:00'),(7,9,6,4.9,'Makes managing events so much easier!','2024-07-28 08:00:00'),(8,14,7,3.8,'Good feature, but could use some improvements.','2024-09-05 16:00:00'),(9,16,6,5.0,'Great tool for hosting events with ease.','2024-10-03 12:30:00'),(10,11,1,4.0,'qwewq','2024-11-03 13:52:42');
/*!40000 ALTER TABLE `platformreviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `postcategories`
--

DROP TABLE IF EXISTS `postcategories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `postcategories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `post_id` int DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `post_cat_postId` (`post_id`),
  KEY `post_cat_catId` (`category_id`),
  CONSTRAINT `post_cat_catId` FOREIGN KEY (`category_id`) REFERENCES `postcategory` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `post_cat_postId` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `postcategories`
--

LOCK TABLES `postcategories` WRITE;
/*!40000 ALTER TABLE `postcategories` DISABLE KEYS */;
INSERT INTO `postcategories` VALUES (35,68,3),(36,69,1),(37,70,3),(38,70,5),(39,71,3),(40,72,6),(41,73,7);
/*!40000 ALTER TABLE `postcategories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `postcategory`
--

DROP TABLE IF EXISTS `postcategory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `postcategory` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `type` varchar(45) DEFAULT 'regular',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `postcategory`
--

LOCK TABLES `postcategory` WRITE;
/*!40000 ALTER TABLE `postcategory` DISABLE KEYS */;
INSERT INTO `postcategory` VALUES (1,'Nice coffee','2024-11-03 13:29:11','regular'),(2,'great breakfast','2024-11-03 13:29:19','regular'),(3,'owner post','2024-11-10 05:50:23','owner'),(5,'Deals','2024-11-10 08:42:34','owner'),(6,'Customer Satisfaction','2024-11-10 08:42:34','owner'),(7,'Coffee tips','2024-11-10 08:42:34','owner'),(8,'Health and wellness','2024-11-10 08:42:34','owner'),(9,'Educational','2024-11-10 08:42:34','owner'),(10,'Others','2024-11-10 08:42:34','owner'),(11,'Behind the scens','2024-11-10 08:42:34','owner');
/*!40000 ALTER TABLE `postcategory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `postimage`
--

DROP TABLE IF EXISTS `postimage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `postimage` (
  `id` int NOT NULL AUTO_INCREMENT,
  `post_id` int DEFAULT NULL,
  `img` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_post_image` (`post_id`),
  CONSTRAINT `image_postid` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `postimage`
--

LOCK TABLES `postimage` WRITE;
/*!40000 ALTER TABLE `postimage` DISABLE KEYS */;
INSERT INTO `postimage` VALUES (1,9,'1726401804623images.png'),(2,9,'1726401804623images.png'),(3,9,'1726401804623images.png'),(4,10,'1726403022592images.png'),(5,11,'1726403029839images.png'),(28,68,'1731240478017-kopio.jpg');
/*!40000 ALTER TABLE `postimage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `posts`
--

DROP TABLE IF EXISTS `posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `posts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `desc` varchar(1000) DEFAULT NULL,
  `userid` int NOT NULL,
  `createdAt` datetime DEFAULT NULL,
  `shop_id` int DEFAULT NULL,
  `advertised` tinyint(1) DEFAULT '0',
  `advertise_expire_date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `post_shop_id` (`shop_id`),
  KEY `idx_post_user` (`userid`),
  CONSTRAINT `post_shop_id` FOREIGN KEY (`shop_id`) REFERENCES `shoplistings` (`shop_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `userid` FOREIGN KEY (`userid`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=81 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `posts`
--

LOCK TABLES `posts` WRITE;
/*!40000 ALTER TABLE `posts` DISABLE KEYS */;
INSERT INTO `posts` VALUES (9,'Enjoying a latte at my favorite coffee shop, such a peaceful afternoon!',7,'2024-09-15 20:03:24',NULL,0,NULL),(10,'A beautiful morning with a hot cup of coffee, life is good.',7,'2024-09-15 20:23:42',NULL,0,NULL),(11,'Relaxing with a cup of coffee, just what I needed after a long day.',9,'2024-09-15 20:23:49',NULL,0,NULL),(68,'Nothing beats the aroma of freshly brewed coffee in the morning ☕?. At our shop, we carefully select premium beans to give you a rich and unforgettable experience in every cup. Whether you\'re in need of a morning boost or a midday pick-me-up, we’ve got you covered! Stop by and treat yourself to a perfect cup today.',11,'2024-11-10 20:07:58',3,0,NULL),(69,'trwerw',4,'2024-11-10 21:39:27',3,0,NULL),(70,'wtewr',14,'2024-11-10 21:46:26',3,1,'2024-11-24'),(71,'rewqewq',14,'2024-11-10 21:46:34',3,1,'2024-11-24'),(72,'21321',11,'2024-11-10 21:46:56',9,1,'2024-11-24'),(73,'weqe',11,'2024-11-10 21:47:01',9,1,'2024-11-24'),(74,'tearea',4,'2024-11-10 22:12:02',NULL,0,NULL),(75,'tesad',4,'2024-11-10 22:43:16',NULL,0,NULL),(76,'test',11,'2024-11-10 22:43:57',9,1,'2024-11-24'),(77,'asdsadasd',14,'2024-11-11 01:07:08',NULL,0,NULL),(78,'dasdsa',4,'2024-11-11 12:24:13',NULL,0,NULL),(79,'12431',4,'2024-11-11 22:49:10',NULL,0,NULL),(80,'2312312',4,'2024-11-11 22:59:09',NULL,0,NULL);
/*!40000 ALTER TABLE `posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `regularusers`
--

DROP TABLE IF EXISTS `regularusers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `regularusers` (
  `id` int NOT NULL,
  `bio` text,
  `subscription_id` int DEFAULT NULL,
  `subscription_expired_date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_regular_user_subscription` (`subscription_id`),
  CONSTRAINT `fk_regular_user_subscription` FOREIGN KEY (`subscription_id`) REFERENCES `subscription` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_regular_user_user` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `regularusers`
--

LOCK TABLES `regularusers` WRITE;
/*!40000 ALTER TABLE `regularusers` DISABLE KEYS */;
INSERT INTO `regularusers` VALUES (1,'This is a test bio.',1,NULL),(4,'This iadniasjdjaspok kopaskdpoaskdopa opsdopadopas opasdoasdopasid odsaopdisaopdio osadiopasidop iasodiasodioasdi ooisaopdiasodosaopd oasdioasidaso soadiaodipoad asodiasodoap dsaidopsaodsapod sadoadio',2,'2024-12-10'),(6,NULL,NULL,NULL),(7,NULL,NULL,NULL),(9,NULL,NULL,NULL),(10,NULL,NULL,NULL),(14,NULL,1,NULL);
/*!40000 ALTER TABLE `regularusers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `relationships`
--

DROP TABLE IF EXISTS `relationships`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `relationships` (
  `id` int NOT NULL AUTO_INCREMENT,
  `followerUserId` int DEFAULT NULL,
  `followedUserId` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_relations_follower` (`followerUserId`),
  KEY `fk_relations_followed` (`followedUserId`),
  CONSTRAINT `fk_relations_followed` FOREIGN KEY (`followedUserId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_relations_follower` FOREIGN KEY (`followerUserId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `relationships`
--

LOCK TABLES `relationships` WRITE;
/*!40000 ALTER TABLE `relationships` DISABLE KEYS */;
INSERT INTO `relationships` VALUES (33,16,11,'2024-11-10 05:26:11'),(34,16,4,'2024-11-10 05:26:15'),(36,4,16,'2024-11-10 19:25:23'),(37,4,11,'2024-11-11 04:24:45');
/*!40000 ALTER TABLE `relationships` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviewcategory`
--

DROP TABLE IF EXISTS `reviewcategory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviewcategory` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `category_name` (`category_name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviewcategory`
--

LOCK TABLES `reviewcategory` WRITE;
/*!40000 ALTER TABLE `reviewcategory` DISABLE KEYS */;
INSERT INTO `reviewcategory` VALUES (1,'general','2024-11-02 06:01:16'),(2,'food','2024-11-02 06:01:16'),(3,'service','2024-11-02 06:01:16'),(4,'ambiance','2024-11-02 06:01:16');
/*!40000 ALTER TABLE `reviewcategory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rewardpoints`
--

DROP TABLE IF EXISTS `rewardpoints`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rewardpoints` (
  `user_id` int DEFAULT NULL,
  `points_balance` int DEFAULT '0',
  `points_obtained` int DEFAULT '0',
  `points_spent` int DEFAULT '0',
  `obtained_at` datetime DEFAULT NULL,
  KEY `user_id` (`user_id`),
  CONSTRAINT `rewardpoints_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rewardpoints`
--

LOCK TABLES `rewardpoints` WRITE;
/*!40000 ALTER TABLE `rewardpoints` DISABLE KEYS */;
INSERT INTO `rewardpoints` VALUES (1,0,0,0,NULL),(4,130,130,0,NULL),(6,0,0,0,NULL),(7,0,0,0,NULL),(9,0,0,0,NULL),(10,0,0,0,NULL),(14,20,20,0,NULL),(17,5,5,0,NULL);
/*!40000 ALTER TABLE `rewardpoints` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rolefeature`
--

DROP TABLE IF EXISTS `rolefeature`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rolefeature` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_type_id` int DEFAULT NULL,
  `feature_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_user_feature` (`user_type_id`,`feature_id`),
  KEY `fk_role_feature_feature` (`feature_id`),
  CONSTRAINT `fk_role_feature_feature` FOREIGN KEY (`feature_id`) REFERENCES `platformfeatures` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_role_feature_user_type` FOREIGN KEY (`user_type_id`) REFERENCES `usertype` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rolefeature`
--

LOCK TABLES `rolefeature` WRITE;
/*!40000 ALTER TABLE `rolefeature` DISABLE KEYS */;
INSERT INTO `rolefeature` VALUES (2,1,2),(1,1,3),(3,1,7),(4,2,1),(5,2,2),(6,2,6),(7,2,7),(8,3,1),(9,3,2),(10,3,3),(11,3,4),(12,3,5),(13,3,6),(16,3,8),(14,3,9),(15,3,10);
/*!40000 ALTER TABLE `rolefeature` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sectioncontent`
--

DROP TABLE IF EXISTS `sectioncontent`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sectioncontent` (
  `id` int NOT NULL AUTO_INCREMENT,
  `heading` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `section_name` enum('home','aboutus') NOT NULL,
  `content_order` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sectioncontent`
--

LOCK TABLES `sectioncontent` WRITE;
/*!40000 ALTER TABLE `sectioncontent` DISABLE KEYS */;
/*!40000 ALTER TABLE `sectioncontent` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `serviceoffered`
--

DROP TABLE IF EXISTS `serviceoffered`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `serviceoffered` (
  `id` int NOT NULL AUTO_INCREMENT,
  `service_name` varchar(200) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `service_name` (`service_name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `serviceoffered`
--

LOCK TABLES `serviceoffered` WRITE;
/*!40000 ALTER TABLE `serviceoffered` DISABLE KEYS */;
INSERT INTO `serviceoffered` VALUES (2,'Bakery'),(1,'Coffee Brewing'),(3,'Roasting Beans');
/*!40000 ALTER TABLE `serviceoffered` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shoplistingcloseddays`
--

DROP TABLE IF EXISTS `shoplistingcloseddays`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shoplistingcloseddays` (
  `id` int NOT NULL AUTO_INCREMENT,
  `shop_id` int DEFAULT NULL,
  `day_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_shoplisting_day_day` (`day_id`),
  KEY `idx_shoplisting_day` (`shop_id`,`day_id`),
  CONSTRAINT `fk_shoplisting_day_day` FOREIGN KEY (`day_id`) REFERENCES `dayofweek` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_shoplisting_day_shop` FOREIGN KEY (`shop_id`) REFERENCES `shoplistings` (`shop_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shoplistingcloseddays`
--

LOCK TABLES `shoplistingcloseddays` WRITE;
/*!40000 ALTER TABLE `shoplistingcloseddays` DISABLE KEYS */;
INSERT INTO `shoplistingcloseddays` VALUES (14,3,7),(4,5,1),(5,6,2),(6,8,3),(11,9,7),(12,10,2),(13,10,4),(16,11,2),(15,11,5);
/*!40000 ALTER TABLE `shoplistingcloseddays` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shoplistingdeliveryoption`
--

DROP TABLE IF EXISTS `shoplistingdeliveryoption`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shoplistingdeliveryoption` (
  `id` int NOT NULL AUTO_INCREMENT,
  `shop_id` int DEFAULT NULL,
  `delivery_option_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_shoplisting_delivery_option` (`delivery_option_id`),
  KEY `idx_shoplisting_delivery` (`shop_id`,`delivery_option_id`),
  CONSTRAINT `fk_shoplisting_delivery_option` FOREIGN KEY (`delivery_option_id`) REFERENCES `deliveryoption` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_shoplisting_delivery_shop` FOREIGN KEY (`shop_id`) REFERENCES `shoplistings` (`shop_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shoplistingdeliveryoption`
--

LOCK TABLES `shoplistingdeliveryoption` WRITE;
/*!40000 ALTER TABLE `shoplistingdeliveryoption` DISABLE KEYS */;
INSERT INTO `shoplistingdeliveryoption` VALUES (10,3,2),(3,5,1),(4,7,2),(8,9,2),(9,10,2),(11,11,1);
/*!40000 ALTER TABLE `shoplistingdeliveryoption` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shoplistingphotogallery`
--

DROP TABLE IF EXISTS `shoplistingphotogallery`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shoplistingphotogallery` (
  `id` int NOT NULL AUTO_INCREMENT,
  `shop_id` int DEFAULT NULL,
  `image` varchar(255) NOT NULL,
  `created_on` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_shoplisting_photo` (`shop_id`),
  CONSTRAINT `fk_photo_shoplisting` FOREIGN KEY (`shop_id`) REFERENCES `shoplistings` (`shop_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shoplistingphotogallery`
--

LOCK TABLES `shoplistingphotogallery` WRITE;
/*!40000 ALTER TABLE `shoplistingphotogallery` DISABLE KEYS */;
INSERT INTO `shoplistingphotogallery` VALUES (9,3,'1731240083444-breakfast_set.jpg','2024-11-10 12:01:23');
/*!40000 ALTER TABLE `shoplistingphotogallery` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shoplistings`
--

DROP TABLE IF EXISTS `shoplistings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shoplistings` (
  `shop_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `img` text,
  `type_id` int DEFAULT NULL,
  `location` varchar(200) NOT NULL,
  `postal_code` varchar(200) NOT NULL,
  `date_established` date DEFAULT NULL,
  `license_number` varchar(255) DEFAULT NULL,
  `owner_id` int NOT NULL,
  `status_id` int DEFAULT NULL,
  `featured` tinyint(1) DEFAULT '0',
  `featured_expire_date` date DEFAULT NULL,
  `created_on` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`shop_id`),
  KEY `fk_shop_type` (`type_id`),
  KEY `fk_shoplisting_status` (`status_id`),
  KEY `idx_shoplistings_owner_type` (`owner_id`,`type_id`),
  CONSTRAINT `fk_shop_owner` FOREIGN KEY (`owner_id`) REFERENCES `shopowners` (`id`),
  CONSTRAINT `fk_shop_type` FOREIGN KEY (`type_id`) REFERENCES `shoptype` (`id`),
  CONSTRAINT `fk_shoplisting_status` FOREIGN KEY (`status_id`) REFERENCES `status` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shoplistings`
--

LOCK TABLES `shoplistings` WRITE;
/*!40000 ALTER TABLE `shoplistings` DISABLE KEYS */;
INSERT INTO `shoplistings` VALUES (3,'Foodclique sadsadasd','Vintage coffee shop with a relaxed atmosphere.','1731240024089Foodclique.jpg',1,'461 Clementi Rd, A3.02C, SIM Global Education Block A','599491','2020-05-06','MOCHA9101',11,1,1,'2024-11-24','2024-11-02 06:01:16'),(5,'The Espresso Bar','A modern espresso bar serving the best coffee blends.',NULL,1,'25 Coffee Plaza, Brewtown','54321','2020-04-10','ESPRESSO543',13,1,0,NULL,'2024-11-02 06:01:16'),(6,'Latte Haven','A haven for latte lovers with a variety of milk options.',NULL,2,'78 Latte Blvd, Cuppa City','67892','2018-11-15','LATTE5678',13,1,0,NULL,'2024-11-02 06:01:16'),(7,'Cuppa Joy','Vintage coffee house known for artisanal brews and cozy atmosphere.',NULL,1,'56 Joy Street, Java Town','98765','2017-06-20','CUPPA1234',13,1,0,NULL,'2024-11-02 06:01:16'),(8,'Bean Bros Roastery','Specialty coffee roastery offering freshly roasted beans.',NULL,3,'12 Bean Avenue, Roasty Town','32145','2019-09-25','BEAN5678',13,1,0,NULL,'2024-11-02 06:01:16'),(9,'Bistro Basket','local haven for fresh ingredients, tasty snacks, and a curated selection of beverages','1731241202195Bistro Basket.webp',2,'#01-52, 95 Lor 4 Toa Payoh ','310095','2022-03-17','BL-2023-456789',11,1,0,NULL,'2024-11-10 12:20:02'),(10,'followernotification','123123',NULL,2,'13221','123','2024-11-18','12312312',11,1,0,NULL,'2024-11-10 18:00:33'),(11,'123','1232',NULL,2,'wqe','wqe','2024-11-11','qwe',11,1,0,NULL,'2024-11-11 06:14:48');
/*!40000 ALTER TABLE `shoplistings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shoplistingservice`
--

DROP TABLE IF EXISTS `shoplistingservice`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shoplistingservice` (
  `id` int NOT NULL AUTO_INCREMENT,
  `shop_id` int DEFAULT NULL,
  `service_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_shoplisting_service_service` (`service_id`),
  KEY `idx_shoplisting_service` (`shop_id`,`service_id`),
  CONSTRAINT `fk_shoplisting_service_service` FOREIGN KEY (`service_id`) REFERENCES `serviceoffered` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_shoplisting_service_shop` FOREIGN KEY (`shop_id`) REFERENCES `shoplistings` (`shop_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shoplistingservice`
--

LOCK TABLES `shoplistingservice` WRITE;
/*!40000 ALTER TABLE `shoplistingservice` DISABLE KEYS */;
INSERT INTO `shoplistingservice` VALUES (16,3,1),(17,3,2),(4,5,1),(5,6,2),(6,8,3),(13,9,1),(14,9,2),(15,10,1),(18,11,1);
/*!40000 ALTER TABLE `shoplistingservice` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shoplistingsocialmedia`
--

DROP TABLE IF EXISTS `shoplistingsocialmedia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shoplistingsocialmedia` (
  `id` int NOT NULL AUTO_INCREMENT,
  `shop_id` int DEFAULT NULL,
  `social_media_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_shoplisting_socialmedia_social` (`social_media_id`),
  KEY `idx_shoplisting_socialmedia` (`shop_id`,`social_media_id`),
  CONSTRAINT `fk_shoplisting_socialmedia_shop` FOREIGN KEY (`shop_id`) REFERENCES `shoplistings` (`shop_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_shoplisting_socialmedia_social` FOREIGN KEY (`social_media_id`) REFERENCES `socialmedia` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shoplistingsocialmedia`
--

LOCK TABLES `shoplistingsocialmedia` WRITE;
/*!40000 ALTER TABLE `shoplistingsocialmedia` DISABLE KEYS */;
INSERT INTO `shoplistingsocialmedia` VALUES (3,5,1),(4,6,2),(5,8,3);
/*!40000 ALTER TABLE `shoplistingsocialmedia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shopowners`
--

DROP TABLE IF EXISTS `shopowners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shopowners` (
  `id` int NOT NULL,
  `bio` varchar(200) DEFAULT NULL,
  `job_id` int DEFAULT NULL,
  `coins` int DEFAULT '20',
  PRIMARY KEY (`id`),
  KEY `fk_shopowner_job` (`job_id`),
  CONSTRAINT `fk_shopowner_job` FOREIGN KEY (`job_id`) REFERENCES `jobtitle` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_shopowner_user` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shopowners`
--

LOCK TABLES `shopowners` WRITE;
/*!40000 ALTER TABLE `shopowners` DISABLE KEYS */;
INSERT INTO `shopowners` VALUES (11,'Experienced barista and shop owner. ',1,50),(13,'Experienced coffee roaster and business owner.',4,100);
/*!40000 ALTER TABLE `shopowners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shopreviews`
--

DROP TABLE IF EXISTS `shopreviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shopreviews` (
  `review_id` int NOT NULL AUTO_INCREMENT,
  `shop_id` int NOT NULL,
  `user_id` int NOT NULL,
  `category_id` int NOT NULL,
  `rating` decimal(2,1) NOT NULL,
  `review_text` text NOT NULL,
  `reply_text` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `replied_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`review_id`),
  KEY `shop_id` (`shop_id`),
  KEY `user_id` (`user_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `shopreviews_ibfk_1` FOREIGN KEY (`shop_id`) REFERENCES `shoplistings` (`shop_id`) ON DELETE CASCADE,
  CONSTRAINT `shopreviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `shopreviews_ibfk_3` FOREIGN KEY (`category_id`) REFERENCES `reviewcategory` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `shopreviews_chk_1` CHECK (((`rating` >= 1) and (`rating` <= 5)))
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shopreviews`
--

LOCK TABLES `shopreviews` WRITE;
/*!40000 ALTER TABLE `shopreviews` DISABLE KEYS */;
INSERT INTO `shopreviews` VALUES (2,3,4,1,5.0,'best shop ','231321','2024-11-10 13:41:30','2024-11-10 13:47:17'),(3,3,4,1,5.0,'tear',NULL,'2024-11-10 14:12:17',NULL),(6,3,4,2,5.0,'test',NULL,'2024-11-10 14:54:47',NULL),(8,3,4,1,5.0,'trar',NULL,'2024-11-10 15:02:04',NULL),(9,3,4,4,5.0,'a',NULL,'2024-11-10 15:07:54',NULL),(18,3,4,1,5.0,'traesr',NULL,'2024-11-10 15:25:08',NULL),(19,3,4,1,5.0,'tasersd',NULL,'2024-11-10 15:25:46',NULL),(26,3,4,2,5.0,'dasdsaddsa',NULL,'2024-11-10 15:27:26',NULL),(27,3,4,1,5.0,'asdas',NULL,'2024-11-10 15:27:33',NULL),(28,3,4,2,5.0,'sads',NULL,'2024-11-11 04:24:29',NULL),(29,3,4,1,4.0,'ewqe',NULL,'2024-11-11 06:50:22',NULL);
/*!40000 ALTER TABLE `shopreviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shoptype`
--

DROP TABLE IF EXISTS `shoptype`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shoptype` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type_name` varchar(200) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `type_name` (`type_name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shoptype`
--

LOCK TABLES `shoptype` WRITE;
/*!40000 ALTER TABLE `shoptype` DISABLE KEYS */;
INSERT INTO `shoptype` VALUES (4,'Bakery'),(2,'Cafe'),(3,'Coffee Roastery'),(1,'Coffee Shop'),(5,'Kopitiam');
/*!40000 ALTER TABLE `shoptype` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `socialmedia`
--

DROP TABLE IF EXISTS `socialmedia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `socialmedia` (
  `id` int NOT NULL AUTO_INCREMENT,
  `social_media_name` varchar(200) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `social_media_name` (`social_media_name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `socialmedia`
--

LOCK TABLES `socialmedia` WRITE;
/*!40000 ALTER TABLE `socialmedia` DISABLE KEYS */;
INSERT INTO `socialmedia` VALUES (2,'Facebook'),(1,'Instagram'),(4,'TikTok'),(3,'Twitter');
/*!40000 ALTER TABLE `socialmedia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `specialization`
--

DROP TABLE IF EXISTS `specialization`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `specialization` (
  `id` int NOT NULL AUTO_INCREMENT,
  `specialization_name` varchar(200) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `specialization`
--

LOCK TABLES `specialization` WRITE;
/*!40000 ALTER TABLE `specialization` DISABLE KEYS */;
INSERT INTO `specialization` VALUES (1,'Latte Art'),(2,'Espresso Brewing'),(3,'Coffee Roasting'),(4,'Home Brewing Techniques');
/*!40000 ALTER TABLE `specialization` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `status`
--

DROP TABLE IF EXISTS `status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `status` (
  `id` int NOT NULL AUTO_INCREMENT,
  `status_name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `status_name` (`status_name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `status`
--

LOCK TABLES `status` WRITE;
/*!40000 ALTER TABLE `status` DISABLE KEYS */;
INSERT INTO `status` VALUES (5,'accepted'),(1,'active'),(2,'inactive'),(4,'pending'),(3,'suspended');
/*!40000 ALTER TABLE `status` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stories`
--

DROP TABLE IF EXISTS `stories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `img` varchar(200) NOT NULL,
  `userid` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `storyUserid_idx` (`userid`),
  CONSTRAINT `storyUserid` FOREIGN KEY (`userid`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stories`
--

LOCK TABLES `stories` WRITE;
/*!40000 ALTER TABLE `stories` DISABLE KEYS */;
/*!40000 ALTER TABLE `stories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscription`
--

DROP TABLE IF EXISTS `subscription`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscription` (
  `id` int NOT NULL AUTO_INCREMENT,
  `subscription_name` varchar(200) NOT NULL,
  `user_type_id` int DEFAULT NULL,
  `price` decimal(6,2) DEFAULT NULL,
  `features` json DEFAULT NULL,
  `subscription_point` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `subscription_user_type` (`user_type_id`),
  CONSTRAINT `subscription_user_type` FOREIGN KEY (`user_type_id`) REFERENCES `usertype` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscription`
--

LOCK TABLES `subscription` WRITE;
/*!40000 ALTER TABLE `subscription` DISABLE KEYS */;
INSERT INTO `subscription` VALUES (1,'basic',1,0.00,NULL,0),(2,'premium',1,20.00,NULL,100);
/*!40000 ALTER TABLE `subscription` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tags`
--

DROP TABLE IF EXISTS `tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tags` (
  `tag_id` int NOT NULL AUTO_INCREMENT,
  `tag_name` varchar(255) NOT NULL,
  PRIMARY KEY (`tag_id`),
  UNIQUE KEY `tag_name` (`tag_name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tags`
--

LOCK TABLES `tags` WRITE;
/*!40000 ALTER TABLE `tags` DISABLE KEYS */;
INSERT INTO `tags` VALUES (2,'Barista'),(6,'Coffee Addict'),(1,'Coffee Lover'),(4,'Espresso Expert'),(3,'Home Brewer'),(5,'Latte Artist');
/*!40000 ALTER TABLE `tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_vouchers`
--

DROP TABLE IF EXISTS `user_vouchers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_vouchers` (
  `user_voucher_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `voucher_id` int DEFAULT NULL,
  `redeemed_date` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `used_date` date DEFAULT NULL,
  `status` enum('Available','Used','Expired') DEFAULT NULL,
  PRIMARY KEY (`user_voucher_id`),
  KEY `user_id` (`user_id`),
  KEY `voucher_id` (`voucher_id`),
  CONSTRAINT `user_vouchers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_vouchers_ibfk_2` FOREIGN KEY (`voucher_id`) REFERENCES `vouchers` (`voucher_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_vouchers`
--

LOCK TABLES `user_vouchers` WRITE;
/*!40000 ALTER TABLE `user_vouchers` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_vouchers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `userallergies`
--

DROP TABLE IF EXISTS `userallergies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `userallergies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `allergy_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_allergies_allergy` (`allergy_id`),
  KEY `idx_allergies_user_allergy` (`user_id`,`allergy_id`),
  CONSTRAINT `fk_allergies_allergy` FOREIGN KEY (`allergy_id`) REFERENCES `allergies` (`allergy_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_allergies_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=126 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `userallergies`
--

LOCK TABLES `userallergies` WRITE;
/*!40000 ALTER TABLE `userallergies` DISABLE KEYS */;
INSERT INTO `userallergies` VALUES (2,1,1),(1,1,3),(124,4,1),(125,4,3),(123,16,1),(122,16,2);
/*!40000 ALTER TABLE `userallergies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `userbrewingmethods`
--

DROP TABLE IF EXISTS `userbrewingmethods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `userbrewingmethods` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `method_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_brewingmethods_method` (`method_id`),
  KEY `idx_brewingmethods_user_method` (`user_id`,`method_id`),
  CONSTRAINT `fk_brewingmethods_method` FOREIGN KEY (`method_id`) REFERENCES `brewingmethods` (`method_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_brewingmethods_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=77 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `userbrewingmethods`
--

LOCK TABLES `userbrewingmethods` WRITE;
/*!40000 ALTER TABLE `userbrewingmethods` DISABLE KEYS */;
INSERT INTO `userbrewingmethods` VALUES (1,1,2),(76,4,2),(71,11,2),(75,16,2),(74,16,3);
/*!40000 ALTER TABLE `userbrewingmethods` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usercoffeebeans`
--

DROP TABLE IF EXISTS `usercoffeebeans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usercoffeebeans` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `bean_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_favbeans_bean` (`bean_id`),
  KEY `idx_favbeans_user_bean` (`user_id`,`bean_id`),
  CONSTRAINT `fk_favbeans_bean` FOREIGN KEY (`bean_id`) REFERENCES `coffeebeans` (`bean_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_favbeans_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=186 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usercoffeebeans`
--

LOCK TABLES `usercoffeebeans` WRITE;
/*!40000 ALTER TABLE `usercoffeebeans` DISABLE KEYS */;
INSERT INTO `usercoffeebeans` VALUES (1,1,1),(2,1,2),(185,4,2),(184,4,3),(183,4,4),(180,16,1),(182,16,2),(181,16,4);
/*!40000 ALTER TABLE `usercoffeebeans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usercoffeetypes`
--

DROP TABLE IF EXISTS `usercoffeetypes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usercoffeetypes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `type_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_favtypes_type` (`type_id`),
  KEY `idx_favtypes_user_type` (`user_id`,`type_id`),
  CONSTRAINT `fk_favtypes_type` FOREIGN KEY (`type_id`) REFERENCES `coffeetypes` (`type_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_favtypes_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=169 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usercoffeetypes`
--

LOCK TABLES `usercoffeetypes` WRITE;
/*!40000 ALTER TABLE `usercoffeetypes` DISABLE KEYS */;
INSERT INTO `usercoffeetypes` VALUES (1,1,2),(168,4,1),(167,4,2),(166,4,3),(163,11,1),(162,11,2),(165,16,2);
/*!40000 ALTER TABLE `usercoffeetypes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `userjoinedevent`
--

DROP TABLE IF EXISTS `userjoinedevent`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `userjoinedevent` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `event_id` int NOT NULL,
  `joined_on` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_joined_event_user` (`user_id`),
  KEY `fk_joined_event_event` (`event_id`),
  CONSTRAINT `fk_joined_event_event` FOREIGN KEY (`event_id`) REFERENCES `event` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_joined_event_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `userjoinedevent`
--

LOCK TABLES `userjoinedevent` WRITE;
/*!40000 ALTER TABLE `userjoinedevent` DISABLE KEYS */;
/*!40000 ALTER TABLE `userjoinedevent` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(45) NOT NULL,
  `email` varchar(45) DEFAULT NULL,
  `password` varchar(200) NOT NULL,
  `name` varchar(45) DEFAULT NULL,
  `coverPic` varchar(200) DEFAULT NULL,
  `profilePic` varchar(200) DEFAULT NULL,
  `city_id` int DEFAULT NULL,
  `gender_id` int DEFAULT NULL,
  `user_type_id` int DEFAULT NULL,
  `status_id` int DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `verified` tinyint(1) NOT NULL DEFAULT '0',
  `created_on` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_user_type` (`user_type_id`),
  KEY `fk_user_gender` (`gender_id`),
  KEY `fk_user_status` (`status_id`),
  KEY `fk_user_city` (`city_id`),
  CONSTRAINT `fk_user_city` FOREIGN KEY (`city_id`) REFERENCES `city` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_user_gender` FOREIGN KEY (`gender_id`) REFERENCES `gender` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_user_status` FOREIGN KEY (`status_id`) REFERENCES `status` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_user_type` FOREIGN KEY (`user_type_id`) REFERENCES `usertype` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'test','rads@example.com','$2a$10$YbXhHLDhvqhu3rTvFydeLOoml4DDysw51rsJcVea.PZ9HUtbCxsoW','sdad',NULL,NULL,NULL,1,2,1,NULL,NULL,1,'2024-11-02 06:01:16'),(4,'hello','hello@fa.com','$2a$10$OBL03o.r4X5BbvJEcm3yxOLFTMjgKSAT6x0B8TDj3OUEF45wP8666','James','1730802151564coffee-3.jpg','1730801999208coffee 1.jpeg',71,1,1,1,NULL,'',1,'2024-11-02 06:01:16'),(6,'asdasdas','aa@example.com','$2a$10$XEJMZk4FT3GwJQ38y.ylIupBsda0aIdmQpdkApWTYUeHECaExnv96','a',NULL,NULL,NULL,1,1,1,NULL,NULL,1,'2024-11-02 06:01:16'),(7,'asdasdasa','aaaa@example.com','$2a$10$bnJa3kkpRRdcvltEOG3VrO8RDvZvIuELZCquRDsggilcRd./8nzTK','aa',NULL,NULL,NULL,1,1,1,NULL,NULL,1,'2024-11-02 06:01:16'),(9,'googd','good@example.com','$2a$10$.jVLliQNqsfHy5dez7TvS.StrER.BXO0WeT6/Zzz62ZRjosngHD7G','ogdd',NULL,NULL,NULL,1,1,1,NULL,NULL,1,'2024-11-02 06:01:16'),(10,'asd','asd@example.com','$2a$10$y2549oWbisBgQOFjdW.PheefpY4rhUpJEMdtiRS051DDYp.WCCude','asdas asd',NULL,NULL,NULL,1,1,1,NULL,NULL,1,'2024-11-02 06:01:16'),(11,'owner','owner@gmail.com','$2a$10$T5QcFcicVpi.N8zeQmYYaOzu8O28hZDsyL3dS8pjyzsy3ksou.Zje','_Super_Rich_Owner_','1730809892725coverpic2.jpg',NULL,NULL,1,3,1,NULL,'',1,'2024-11-02 06:01:16'),(13,'register','register@gmail.com','$2a$10$rLGsgJVuEHu/iMDY8YAl3.dHe70AQzOcxGKXa1Z9H8lnkYfXhXuQS','register',NULL,NULL,NULL,1,3,1,NULL,NULL,1,'2024-11-02 06:01:16'),(14,'user001','user001@gmail.com','$2a$10$A6ELsGnV08TkBxhwn6fTQuJ0ocgDwBotysS0qYW.lu.NCOV2rJ/Ta','user001',NULL,NULL,NULL,1,1,1,NULL,NULL,1,'2024-11-02 06:01:16'),(15,'admin','admin@gmail.com','$2a$10$V1wvX5hGiDwywYDkYOyn9uWJnl0jFfCDi.oLKEVHfhcmnTDerJKMO','admintester',NULL,'1730801202297empty-profile-picture.jpg',NULL,1,4,1,NULL,'',0,'2024-11-02 06:01:16'),(16,'expert','expert@gmail.com','$2a$10$fg/uGJZIacuzUTT.VEFRde9iEmYCyXsSqeiXVT2tg8v03ecsugZ6O','expert','1730810061893coverpic3.jpeg','1730809745643expert1.jpeg',NULL,1,2,1,NULL,'',1,'2024-11-02 06:01:16'),(17,'expert001','wlxwulixing@gmail.com','$2a$10$FreZnD/sr/QRmzFuH1RqN.guyC2VzHeqwMGMdGikJamrG1s.piZi6','expert001',NULL,NULL,NULL,NULL,2,1,NULL,NULL,1,'2024-11-11 12:28:26');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usertags`
--

DROP TABLE IF EXISTS `usertags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usertags` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `tag_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_tags_tag` (`tag_id`),
  KEY `idx_tags_user_tag` (`user_id`,`tag_id`),
  CONSTRAINT `fk_tags_tag` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`tag_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_tags_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=133 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usertags`
--

LOCK TABLES `usertags` WRITE;
/*!40000 ALTER TABLE `usertags` DISABLE KEYS */;
INSERT INTO `usertags` VALUES (1,1,1),(2,1,6),(132,4,1),(131,4,6),(126,11,3),(125,11,4),(130,16,3),(129,16,4);
/*!40000 ALTER TABLE `usertags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usertype`
--

DROP TABLE IF EXISTS `usertype`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usertype` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type_name` varchar(50) NOT NULL,
  `type_full_name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `type_name` (`type_name`),
  UNIQUE KEY `type_full_name` (`type_full_name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usertype`
--

LOCK TABLES `usertype` WRITE;
/*!40000 ALTER TABLE `usertype` DISABLE KEYS */;
INSERT INTO `usertype` VALUES (1,'regular','Regular User'),(2,'expert','Coffee Expert'),(3,'owner','Coffee Shop Owner'),(4,'admin','System Admin');
/*!40000 ALTER TABLE `usertype` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vouchers`
--

DROP TABLE IF EXISTS `vouchers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vouchers` (
  `voucher_id` int NOT NULL AUTO_INCREMENT,
  `shop_id` int DEFAULT NULL,
  `voucher_name` varchar(255) DEFAULT NULL,
  `img` text,
  `amount_available` int DEFAULT NULL,
  `points_cost` int DEFAULT NULL,
  `value_in_dollars` decimal(10,2) DEFAULT NULL,
  `validity_period` int DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  `exclusive` varchar(45) DEFAULT 'public',
  `description` varchar(255) DEFAULT NULL,
  `tnc` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`voucher_id`),
  KEY `shop_id` (`shop_id`),
  CONSTRAINT `vouchers_ibfk_1` FOREIGN KEY (`shop_id`) REFERENCES `shoplistings` (`shop_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vouchers`
--

LOCK TABLES `vouchers` WRITE;
/*!40000 ALTER TABLE `vouchers` DISABLE KEYS */;
INSERT INTO `vouchers` VALUES (6,3,'Super Saver Voucher','default-empty.jpg',100,500,10.00,14,1,'public','Get 20% off on all items','Valid only at participating stores. Cannot be combined with other offers.'),(7,3,'Coffee Lover\'s Delight','default-empty.jpg',10,200,5.00,15,1,'exclusive','Redeem a free coffee','Limited to one voucher per customer per visit.'),(8,10,'1','default-empty.jpg',1,1,1.00,1,1,'public','1','21313223'),(9,10,'21','default-empty.jpg',1,1,1.00,1,1,'exclusive','3123','123'),(10,3,'r','default-empty.jpg',1,1,-11.00,1,1,'public','1','sadasdasdas'),(11,3,'ar','default-empty.jpg',1,1,1.00,1,1,'exclusive','1','1123');
/*!40000 ALTER TABLE `vouchers` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-11-11 23:07:39
