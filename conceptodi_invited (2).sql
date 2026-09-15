-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3306
-- Tiempo de generación: 15-09-2026 a las 15:36:33
-- Versión del servidor: 9.1.0
-- Versión de PHP: 8.4.15

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `conceptodi_invited`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `assets`
--

DROP TABLE IF EXISTS `assets`;
CREATE TABLE IF NOT EXISTS `assets` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `partner_id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'image',
  `file_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `mime_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `size` bigint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `assets_partner_id_foreign` (`partner_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `assets`
--

INSERT INTO `assets` (`id`, `partner_id`, `name`, `type`, `file_path`, `mime_type`, `size`, `created_at`, `updated_at`) VALUES
(1, 1, 'imgi_4_f5e2e160c7c16db488db26df6ea74d2e.png', 'image', 'partners/1/assets/qe7qxqsWaaTnbWmRSrsGtNhaGE5Wsb2GNVoOB0mW.png', 'image/png', 230200, '2026-09-13 08:20:21', '2026-09-13 08:20:21'),
(2, 1, 'floral-header-left.png', 'image', 'partners/1/assets/PTWy4z4yLdXEolcfNIhyD8yqWrUXpwSPliOHt7jY.png', 'image/png', 53998, '2026-09-13 17:32:32', '2026-09-13 17:32:32'),
(3, 1, '688ba4cfaea7b7e282632d4970089c8b.mp4', 'video', 'partners/1/assets/Q6NO1SEAeRszJJ2Uqps3yZCF7M9v8vsJWDdEPn8C.m4v', 'video/mp4', 6145648, '2026-09-13 22:46:50', '2026-09-13 22:46:50');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cache`
--

DROP TABLE IF EXISTS `cache`;
CREATE TABLE IF NOT EXISTS `cache` (
  `key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
CREATE TABLE IF NOT EXISTS `cache_locks` (
  `key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `events`
--

DROP TABLE IF EXISTS `events`;
CREATE TABLE IF NOT EXISTS `events` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `partner_id` bigint UNSIGNED DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `event_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'other',
  `event_date` datetime DEFAULT NULL,
  `location` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `latitude` decimal(18,14) DEFAULT NULL,
  `longitude` decimal(18,14) DEFAULT NULL,
  `itinerary` json DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `services` json DEFAULT NULL,
  `logo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `background` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `guest_count` int NOT NULL DEFAULT '0',
  `confirmed_count` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `events_partner_id_foreign` (`partner_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `events`
--

INSERT INTO `events` (`id`, `partner_id`, `name`, `event_type`, `event_date`, `location`, `latitude`, `longitude`, `itinerary`, `description`, `services`, `logo`, `background`, `status`, `guest_count`, `confirmed_count`, `created_at`, `updated_at`) VALUES
(1, 1, 'Camila15', 'quince', '2026-10-10 18:00:00', 'C. Cabimas, La Candelaria, El Limón, Parroquia Caña de Azúcar, Municipio Iragorry, Estado Aragua, 2105, Venezuela', NULL, NULL, '[{\"id\": \"1789095456606\", \"date\": \"2026-10-10\", \"name\": \"Recepcion\", \"address\": \"C. Cabimas, La Candelaria, El Limón, Parroquia Caña de Azúcar, Municipio Iragorry, Estado Aragua, 2105, Venezuela\", \"end_time\": \"22:00\", \"latitude\": 10.290006986690306, \"longitude\": -67.64270217432549, \"start_time\": \"18:00\", \"location_name\": \"Casa Arcai\"}]', 'Quince Años de Camila Castro', '[\"TOTEM\", \"INVITACION\", \"PROTOCOLO\"]', 'events/logos/Ger8XPTE5wYQnuiYNqMjgZwP8EPdHOVdUwuh31KC.png', NULL, 'active', 0, 0, '2026-09-10 18:52:41', '2026-09-11 17:55:07');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
CREATE TABLE IF NOT EXISTS `failed_jobs` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `guests`
--

DROP TABLE IF EXISTS `guests`;
CREATE TABLE IF NOT EXISTS `guests` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `event_id` bigint UNSIGNED NOT NULL,
  `guest_group_id` bigint UNSIGNED DEFAULT NULL,
  `table_id` bigint UNSIGNED DEFAULT NULL,
  `invitation_id` bigint UNSIGNED DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Primary',
  `category` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Adulto',
  `is_confirmed` tinyint(1) DEFAULT NULL,
  `dietary_restrictions` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `seating_assignment` json DEFAULT NULL,
  `checked_in_at` timestamp NULL DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','confirmed','declined') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `companion_count` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `guests_event_id_foreign` (`event_id`),
  KEY `guests_table_id_foreign` (`table_id`),
  KEY `guests_invitation_id_foreign` (`invitation_id`),
  KEY `guests_guest_group_id_foreign` (`guest_group_id`)
) ENGINE=MyISAM AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `guests`
--

INSERT INTO `guests` (`id`, `event_id`, `guest_group_id`, `table_id`, `invitation_id`, `name`, `title`, `role`, `category`, `is_confirmed`, `dietary_restrictions`, `seating_assignment`, `checked_in_at`, `email`, `phone`, `status`, `companion_count`, `created_at`, `updated_at`) VALUES
(15, 1, 3, NULL, NULL, 'Juan Mendoza', 'Sr.', 'Principal', 'Adulto', NULL, NULL, NULL, NULL, NULL, NULL, 'pending', 0, '2026-09-14 06:05:08', '2026-09-14 06:05:08'),
(10, 1, 1, NULL, NULL, 'Arístides Castro', 'Sr.', 'Principal', 'Adulto', NULL, NULL, NULL, NULL, NULL, NULL, 'pending', 0, '2026-09-14 03:24:35', '2026-09-14 03:24:35'),
(9, 1, 1, NULL, NULL, 'Lolimar Lopez', 'Sr.', 'Esposa', 'Adulto', NULL, NULL, NULL, NULL, NULL, NULL, 'pending', 0, '2026-09-14 03:24:35', '2026-09-14 03:24:35'),
(14, 1, 2, NULL, NULL, 'Aristides Jr. Castro', 'Srito.', 'Hijo', 'Joven', NULL, NULL, NULL, NULL, NULL, NULL, 'pending', 0, '2026-09-14 06:05:07', '2026-09-14 06:05:07'),
(13, 1, 2, NULL, NULL, 'María Pérez', 'Sra.', 'Esposa', 'Adulto', NULL, NULL, NULL, NULL, NULL, NULL, 'pending', 0, '2026-09-14 06:05:07', '2026-09-14 06:05:07'),
(11, 1, 1, NULL, NULL, 'Arístides Castro', 'Srito.', 'Hijo', 'Joven', NULL, NULL, NULL, NULL, NULL, NULL, 'pending', 0, '2026-09-14 03:24:35', '2026-09-14 03:24:35'),
(12, 1, 1, NULL, NULL, 'Camila Castro', 'Srita.', 'Hija', 'Joven', NULL, NULL, NULL, NULL, NULL, NULL, 'pending', 0, '2026-09-14 03:24:35', '2026-09-14 03:24:35');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `guest_groups`
--

DROP TABLE IF EXISTS `guest_groups`;
CREATE TABLE IF NOT EXISTS `guest_groups` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `event_id` bigint UNSIGNED NOT NULL,
  `assigned_invitation_id` bigint UNSIGNED DEFAULT NULL,
  `formal_addressee` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_phone` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_whatsapp` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `max_guests` int NOT NULL DEFAULT '1',
  `status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `guest_groups_event_id_foreign` (`event_id`),
  KEY `guest_groups_assigned_invitation_id_foreign` (`assigned_invitation_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `guest_groups`
--

INSERT INTO `guest_groups` (`id`, `event_id`, `assigned_invitation_id`, `formal_addressee`, `contact_email`, `contact_phone`, `contact_whatsapp`, `max_guests`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'Flia. Castro Lopez', NULL, NULL, NULL, 4, 'pending', '2026-09-14 01:06:31', '2026-09-14 03:24:35'),
(2, 1, 1, 'Familia Castro Pérez', 'aristides@ejemplo.com', '+584120000000', '+584120000000', 2, 'pending', '2026-09-14 06:05:07', '2026-09-14 06:05:07'),
(3, 1, 1, 'Sr. Juan Mendoza', 'juan@ejemplo.com', '+584141112233', '+584141112233', 1, 'pending', '2026-09-14 06:05:08', '2026-09-14 06:05:08');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `invitations`
--

DROP TABLE IF EXISTS `invitations`;
CREATE TABLE IF NOT EXISTS `invitations` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `event_id` bigint UNSIGNED NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `template` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'default',
  `content` json DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `invitations_event_id_foreign` (`event_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `invitations`
--

INSERT INTO `invitations` (`id`, `event_id`, `title`, `slug`, `description`, `template`, `content`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 'Prueba', 'camila15-prueba', NULL, 'interactive', '{\"scenes\": [{\"id\": \"scene-1\", \"name\": \"Escena 01\", \"elements\": [{\"x\": -234, \"y\": 1098, \"id\": \"el-image-1789323592411\", \"type\": \"image\", \"color\": \"var(--text-main)\", \"width\": 1056, \"height\": 588, \"locked\": false, \"content\": \"/storage/partners/1/assets/PTWy4z4yLdXEolcfNIhyD8yqWrUXpwSPliOHt7jY.png\", \"visible\": true, \"imgScale\": 100, \"rotation\": -90, \"textAlign\": \"center\", \"initialWidth\": 390, \"naturalWidth\": 390, \"initialHeight\": 217, \"naturalHeight\": 217, \"keepAspectRatio\": true}, {\"x\": 90, \"y\": 173, \"id\": \"el-title-1\", \"type\": \"text\", \"color\": \"linear-gradient(135deg, #E63946 0%, #3B82F6 100%)\", \"width\": 900, \"height\": 150, \"locked\": false, \"content\": \"¡Nos Casamos!\", \"groupId\": \"group-1789321107925\", \"visible\": true, \"fontSize\": 84, \"animation\": \"slideUp\", \"groupName\": \"Grupo (2 capas)\", \"textAlign\": \"center\", \"fontFamily\": \"Satisfy\", \"fontWeight\": \"bold\", \"textShadowBlur\": 24, \"textAboveBorder\": true, \"textBorderColor\": \"linear-gradient(135deg, #1ff702 0%, #fff700 100%)\", \"textBorderWidth\": 8, \"textShadowColor\": \"#002aff\", \"textShadowOffsetX\": 2, \"textShadowOffsetY\": 2}, {\"x\": 102, \"y\": 0, \"id\": \"el-image-1789147355586\", \"type\": \"image\", \"color\": \"var(--text-main)\", \"width\": 877, \"height\": 349, \"locked\": false, \"content\": \"/storage/partners/1/assets/qe7qxqsWaaTnbWmRSrsGtNhaGE5Wsb2GNVoOB0mW.png\", \"groupId\": \"group-1789321107925\", \"visible\": true, \"imgScale\": 100, \"imgSepia\": false, \"groupName\": \"Grupo (2 capas)\", \"textAlign\": \"center\", \"imgGrayscale\": false, \"initialWidth\": 877, \"imgBrightness\": 100, \"initialHeight\": 349, \"keepAspectRatio\": false}, {\"x\": -88, \"y\": -67, \"id\": \"el-video-1789325826581\", \"type\": \"video\", \"color\": \"var(--text-main)\", \"width\": 1257, \"height\": 2055, \"locked\": false, \"content\": \"/storage/partners/1/assets/Q6NO1SEAeRszJJ2Uqps3yZCF7M9v8vsJWDdEPn8C.m4v\", \"visible\": true, \"imgScale\": 100, \"rotation\": 4, \"objectFit\": \"cover\", \"textAlign\": \"center\", \"preFitState\": {\"x\": 50, \"y\": 210, \"width\": 260, \"height\": 45}, \"initialWidth\": 1080, \"initialHeight\": 1920}]}, {\"id\": \"scene-1789396130261\", \"name\": \"Escena 02\", \"elements\": []}], \"preview\": \"data:image/jpeg;base64,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\", \"elements\": [{\"x\": -234, \"y\": 1098, \"id\": \"el-image-1789323592411\", \"type\": \"image\", \"color\": \"var(--text-main)\", \"width\": 1056, \"height\": 588, \"locked\": false, \"content\": \"/storage/partners/1/assets/PTWy4z4yLdXEolcfNIhyD8yqWrUXpwSPliOHt7jY.png\", \"visible\": true, \"imgScale\": 100, \"rotation\": -90, \"textAlign\": \"center\", \"initialWidth\": 390, \"naturalWidth\": 390, \"initialHeight\": 217, \"naturalHeight\": 217, \"keepAspectRatio\": true}, {\"x\": 90, \"y\": 173, \"id\": \"el-title-1\", \"type\": \"text\", \"color\": \"linear-gradient(135deg, #E63946 0%, #3B82F6 100%)\", \"width\": 900, \"height\": 150, \"locked\": false, \"content\": \"¡Nos Casamos!\", \"groupId\": \"group-1789321107925\", \"visible\": true, \"fontSize\": 84, \"animation\": \"slideUp\", \"groupName\": \"Grupo (2 capas)\", \"textAlign\": \"center\", \"fontFamily\": \"Satisfy\", \"fontWeight\": \"bold\", \"textShadowBlur\": 24, \"textAboveBorder\": true, \"textBorderColor\": \"linear-gradient(135deg, #1ff702 0%, #fff700 100%)\", \"textBorderWidth\": 8, \"textShadowColor\": \"#002aff\", \"textShadowOffsetX\": 2, \"textShadowOffsetY\": 2}, {\"x\": 102, \"y\": 0, \"id\": \"el-image-1789147355586\", \"type\": \"image\", \"color\": \"var(--text-main)\", \"width\": 877, \"height\": 349, \"locked\": false, \"content\": \"/storage/partners/1/assets/qe7qxqsWaaTnbWmRSrsGtNhaGE5Wsb2GNVoOB0mW.png\", \"groupId\": \"group-1789321107925\", \"visible\": true, \"imgScale\": 100, \"imgSepia\": false, \"groupName\": \"Grupo (2 capas)\", \"textAlign\": \"center\", \"imgGrayscale\": false, \"initialWidth\": 877, \"imgBrightness\": 100, \"initialHeight\": 349, \"keepAspectRatio\": false}, {\"x\": -88, \"y\": -67, \"id\": \"el-video-1789325826581\", \"type\": \"video\", \"color\": \"var(--text-main)\", \"width\": 1257, \"height\": 2055, \"locked\": false, \"content\": \"/storage/partners/1/assets/Q6NO1SEAeRszJJ2Uqps3yZCF7M9v8vsJWDdEPn8C.m4v\", \"visible\": true, \"imgScale\": 100, \"rotation\": 4, \"objectFit\": \"cover\", \"textAlign\": \"center\", \"preFitState\": {\"x\": 50, \"y\": 210, \"width\": 260, \"height\": 45}, \"initialWidth\": 1080, \"initialHeight\": 1920}], \"activeSceneId\": \"scene-1\"}', 1, '2026-09-11 18:28:57', '2026-09-14 19:13:48');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `jobs`
--

DROP TABLE IF EXISTS `jobs`;
CREATE TABLE IF NOT EXISTS `jobs` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint UNSIGNED NOT NULL,
  `reserved_at` int UNSIGNED DEFAULT NULL,
  `available_at` int UNSIGNED NOT NULL,
  `created_at` int UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
CREATE TABLE IF NOT EXISTS `job_batches` (
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `migrations`
--

DROP TABLE IF EXISTS `migrations`;
CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_09_09_195239_create_partners_table', 1),
(5, '2026_09_09_200128_create_partner_user_table', 1),
(6, '2026_09_09_213215_create_personal_access_tokens_table', 2),
(7, '2026_09_10_053456_create_events_table', 3),
(8, '2026_09_10_121854_create_tables_table', 4),
(9, '2026_09_10_121920_create_guests_table', 4),
(10, '2026_09_10_144421_add_logo_and_background_to_events_table', 5),
(11, '2026_09_10_145629_add_services_to_events_table', 6),
(13, '2026_09_10_210543_add_coordinates_to_events_table', 7),
(14, '2026_09_10_213914_add_itinerary_to_events_table', 8),
(15, '2026_09_11_040557_add_partner_id_to_events_table', 9),
(16, '2026_09_11_101200_create_invitations_table', 10),
(17, '2026_09_11_101201_add_invitation_id_to_guests_table', 10),
(18, '2026_09_13_040744_create_assets_table', 11),
(19, '2026_09_13_202246_create_guest_groups_and_update_guests_table', 12),
(20, '2026_09_13_221502_add_title_and_category_to_guests_table', 13),
(21, '2026_09_13_221817_make_is_confirmed_nullable_in_guests_table', 14);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `partners`
--

DROP TABLE IF EXISTS `partners`;
CREATE TABLE IF NOT EXISTS `partners` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint UNSIGNED NOT NULL,
  `business_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `business_rut` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `business_address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `business_phone` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_phone` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `social_links` json DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `credits_web` int NOT NULL DEFAULT '0',
  `credits_video` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `partners_user_id_foreign` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `partners`
--

INSERT INTO `partners` (`id`, `user_id`, `business_name`, `business_rut`, `logo`, `business_address`, `business_phone`, `contact_name`, `contact_phone`, `social_links`, `is_active`, `credits_web`, `credits_video`, `created_at`, `updated_at`) VALUES
(1, 1, 'ConceptoDigital', '123456789', 'partners/logos/SK5vA8dVre0MHIrM8UCM4DMKkdgBuhfXeeCxwGlZ.png', 'C/Cabimas #29', NULL, NULL, NULL, '\"[{\\\"type\\\":\\\"whatsapp\\\",\\\"value\\\":\\\"+584265332600\\\"}]\"', 1, 0, 0, '2026-09-10 16:41:00', '2026-09-10 16:41:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `partner_user`
--

DROP TABLE IF EXISTS `partner_user`;
CREATE TABLE IF NOT EXISTS `partner_user` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `partner_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `partner_user_partner_id_foreign` (`partner_id`),
  KEY `partner_user_user_id_foreign` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `partner_user`
--

INSERT INTO `partner_user` (`id`, `partner_id`, `user_id`, `created_at`, `updated_at`) VALUES
(1, 1, 1, NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
CREATE TABLE IF NOT EXISTS `personal_access_tokens` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint UNSIGNED NOT NULL,
  `name` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sessions`
--

DROP TABLE IF EXISTS `sessions`;
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('1LRXuxdevFqlNuef8yiyuowbZTEm5Jq1SRI2u23j', 1, '::ffff:192.168.0.107', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', 'YTo1OntzOjY6Il90b2tlbiI7czo0MDoicXBtNUg2SDhPZ05RdTFOU1JObktwTGhBSlQyWlllU2p5aW1qMUxSSyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTI0OiJodHRwczovLzE5Mi4xNjguMC4xMDc6NTE3My9AZnMvRDovY2RfU3lzdGVtcy9pbnZpdGVkL3Jlc291cmNlcy9qcy9jb21wb25lbnRzL2Rlc2lnbmVyL0VudmVsb3BlQ3VzdG9taXplci50c3g/dD0xNzg5NDg0NDEzNzAwIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX1zOjUwOiJsb2dpbl93ZWJfNTliYTM2YWRkYzJiMmY5NDAxNTgwZjAxNGM3ZjU4ZWE0ZTMwOTg5ZCI7aToxO3M6MTc6InBhc3N3b3JkX2hhc2hfd2ViIjtzOjY0OiI5NDFlNWI1MzQwYjJjOTg4YTZhMWU4Y2RkMjU0ZDljZDcwMWY2YWU1YjM1MWUyNjhlM2MyNmJiYzIwYzZmZTBhIjt9', 1789484416),
('WHeR4S8sXKmJJ8Rg6uUnByyyKJpqGr56bghlFeqX', NULL, '127.0.0.1', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Mobile Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiZm5YeU04SU02a3BlTHJqalNMbExEam84UmlGN0p0c3U3amdncTFZRCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzA6Imh0dHBzOi8vMTkyLjE2OC4wLjEwNzo1MTczL3YvMSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1789486062);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tables`
--

DROP TABLE IF EXISTS `tables`;
CREATE TABLE IF NOT EXISTS `tables` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `event_id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `capacity` int NOT NULL DEFAULT '10',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tables_event_id_foreign` (`event_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `remember_token` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `role`, `is_active`, `avatar`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'Aristides Castro', 'aristidescastro@gmail.com', '2026-09-10 01:43:56', '$2y$12$vi.MvWx5hs6vrMtzUGFCf.w/68oDpbWhWkm4ePzOU4qahFhljZGgi', 'superadmin', 1, NULL, 'Ls1H4cCxIa', '2026-09-10 01:43:57', '2026-09-10 01:43:57');

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `assets`
--
ALTER TABLE `assets`
  ADD CONSTRAINT `assets_partner_id_foreign` FOREIGN KEY (`partner_id`) REFERENCES `partners` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `events`
--
ALTER TABLE `events`
  ADD CONSTRAINT `events_partner_id_foreign` FOREIGN KEY (`partner_id`) REFERENCES `partners` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `guest_groups`
--
ALTER TABLE `guest_groups`
  ADD CONSTRAINT `guest_groups_assigned_invitation_id_foreign` FOREIGN KEY (`assigned_invitation_id`) REFERENCES `invitations` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `guest_groups_event_id_foreign` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `invitations`
--
ALTER TABLE `invitations`
  ADD CONSTRAINT `invitations_event_id_foreign` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `partners`
--
ALTER TABLE `partners`
  ADD CONSTRAINT `partners_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `partner_user`
--
ALTER TABLE `partner_user`
  ADD CONSTRAINT `partner_user_partner_id_foreign` FOREIGN KEY (`partner_id`) REFERENCES `partners` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `partner_user_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
