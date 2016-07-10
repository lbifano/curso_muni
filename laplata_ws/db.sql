
DROP TABLE IF EXISTS `categoria`;
CREATE TABLE `categoria` (
  `id` int(11) NOT NULL,
  `descripcion` varchar(32) NOT NULL,
  `contraccion` varchar(2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `estado`;
CREATE TABLE `estado` (
  `id` int(11) NOT NULL,
  `descripcion` varchar(50) NOT NULL,
  `contraccion` varchar(2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `reclamo`;
CREATE TABLE `reclamo` (
  `id_reclamo` int(11) NOT NULL AUTO_INCREMENT,
  `login` varchar(32) NOT NULL,
  `fh_alta` datetime NOT NULL ON UPDATE CURRENT_TIMESTAMP,
  `path_foto` text,
  `observacion` text NOT NULL,
  `gps_lng` double NOT NULL,
  `gps_lat` double NOT NULL,
  `gps_err` double NOT NULL,
  `estado` int(11) NOT NULL,
  `categoria` int(11) NOT NULL,
  PRIMARY KEY (`id_reclamo`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `reincidencias`;
CREATE TABLE `reincidencias` (
  `id_reclamo` int(11) NOT NULL,
  `login` varchar(32) NOT NULL,
  `fh_alta` datetime NOT NULL,
  `path_foto` text NOT NULL,
  `observacion` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `login` varchar(32) NOT NULL,
  `pass` varchar(32) NOT NULL,
  `token` text NOT NULL,
  `fh_token` datetime NOT NULL,
  `nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
