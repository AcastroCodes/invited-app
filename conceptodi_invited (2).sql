-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3306
-- Tiempo de generación: 14-09-2026 a las 00:23:05
-- Versión del servidor: 9.1.0
-- Versión de PHP: 8.3.14

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
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'image',
  `file_path` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mime_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Primary',
  `category` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Adulto',
  `is_confirmed` tinyint(1) DEFAULT NULL,
  `dietary_restrictions` text COLLATE utf8mb4_unicode_ci,
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
  `formal_addressee` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_whatsapp` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `max_guests` int NOT NULL DEFAULT '1',
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
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
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `template` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'default',
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
(1, 1, 'Prueba', 'camila15-prueba', NULL, 'interactive', '{\"preview\": \"data:image/jpeg;base64,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\", \"elements\": [{\"x\": 41, \"y\": 604, \"id\": \"el-image-1789323592411\", \"type\": \"image\", \"color\": \"var(--text-main)\", \"width\": 1056, \"height\": 588, \"locked\": false, \"content\": \"/storage/partners/1/assets/PTWy4z4yLdXEolcfNIhyD8yqWrUXpwSPliOHt7jY.png\", \"visible\": true, \"imgScale\": 100, \"rotation\": -90, \"textAlign\": \"center\", \"initialWidth\": 390, \"naturalWidth\": 390, \"initialHeight\": 217, \"naturalHeight\": 217, \"keepAspectRatio\": true}, {\"x\": 90, \"y\": 173, \"id\": \"el-title-1\", \"type\": \"text\", \"color\": \"linear-gradient(135deg, #E63946 0%, #3B82F6 100%)\", \"width\": 900, \"height\": 150, \"locked\": false, \"content\": \"¡Nos Casamos!\", \"groupId\": \"group-1789321107925\", \"visible\": true, \"fontSize\": 84, \"animation\": \"slideUp\", \"groupName\": \"Grupo (2 capas)\", \"textAlign\": \"center\", \"fontFamily\": \"Satisfy\", \"fontWeight\": \"bold\", \"textShadowBlur\": 24, \"textAboveBorder\": true, \"textBorderColor\": \"linear-gradient(135deg, #1ff702 0%, #fff700 100%)\", \"textBorderWidth\": 8, \"textShadowColor\": \"#002aff\", \"textShadowOffsetX\": 2, \"textShadowOffsetY\": 2}, {\"x\": 102, \"y\": 0, \"id\": \"el-image-1789147355586\", \"type\": \"image\", \"color\": \"var(--text-main)\", \"width\": 877, \"height\": 349, \"locked\": false, \"content\": \"/storage/partners/1/assets/qe7qxqsWaaTnbWmRSrsGtNhaGE5Wsb2GNVoOB0mW.png\", \"groupId\": \"group-1789321107925\", \"visible\": true, \"imgScale\": 100, \"imgSepia\": false, \"groupName\": \"Grupo (2 capas)\", \"textAlign\": \"center\", \"imgGrayscale\": false, \"initialWidth\": 877, \"imgBrightness\": 100, \"initialHeight\": 349, \"keepAspectRatio\": false}, {\"x\": -88, \"y\": -67, \"id\": \"el-video-1789325826581\", \"type\": \"video\", \"color\": \"var(--text-main)\", \"width\": 1257, \"height\": 2055, \"locked\": false, \"content\": \"/storage/partners/1/assets/Q6NO1SEAeRszJJ2Uqps3yZCF7M9v8vsJWDdEPn8C.m4v\", \"visible\": true, \"imgScale\": 100, \"rotation\": 4, \"objectFit\": \"cover\", \"textAlign\": \"center\", \"preFitState\": {\"x\": 50, \"y\": 210, \"width\": 260, \"height\": 45}, \"initialWidth\": 1080, \"initialHeight\": 1920}]}', 1, '2026-09-11 18:28:57', '2026-09-14 08:19:41');

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
('4xpDhpsKtsFAj6MeimfeU8ANvmCrwwheRNChXWoq', 1, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', 'YTo1OntzOjY6Il90b2tlbiI7czo0MDoibHh0Wjk3SzdieFJQeUdHYVlaNjU0MGxTOFRpYVRXV1hYZldzREpJdSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NTI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9ldmVudHMvMS9jb25maWc/dGFiPUlOVklUQUNJT04iO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fXM6NTA6ImxvZ2luX3dlYl81OWJhMzZhZGRjMmIyZjk0MDE1ODBmMDE0YzdmNThlYTRlMzA5ODlkIjtpOjE7czoxNzoicGFzc3dvcmRfaGFzaF93ZWIiO3M6NjQ6Ijk0MWU1YjUzNDBiMmM5ODhhNmExZThjZGQyNTRkOWNkNzAxZjZhZTViMzUxZTI2OGUzYzI2YmJjMjBjNmZlMGEiO30=', 1789359685);

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
