<?php
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');
}

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {

    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
}


require_once __DIR__.'/vendor/autoload.php';
require 'class/auth.php';
$app = new Silex\Application();
$app['debug'] = true;

$app->register(new Silex\Provider\DoctrineServiceProvider(), array(
    'db.options' => array(
      'driver'    => 'pdo_mysql',
      'host'      => 'localhost',
      'dbname'    => 'laplata',
      'user'      => 'root',
      'password'  => 'qwerty',
      'charset'   => 'utf8mb4',
    ),
));


$app->get('/getToken/{usu}/{pass}', function ($usu, $pass) use ($app)  {
  $passw = md5($pass);
  $sql = "SELECT * FROM user WHERE login = ? and pass = ?";
  $res = $app['db']->fetchAssoc($sql, array($usu, $passw));

  if($res)
  {
    if($res['token'])
    {
      if($res['fh_token'])
      {
        $segundos=strtotime($res['fh_token']) - strtotime('now');
        $diferencia=intval($segundos/60/60/24/30); #el token dura una hora
        if($diferencia == 0)
        {
          return  $app->json(array('token' => $res['token']),200);
        }
      }
    }
    $token = bin2hex(openssl_random_pseudo_bytes(128));

    $res = $app['db']->update('user',
                              array('token' => $token, 'fh_token' => date("Y-m-d H:i:s")),
                              array('login' => $usu, 'pass' => $passw));

    return  $app->json(array('token' => $token),200);
  }
  return  $app->json(array('ERROR' => 'Invalid user or pass'),404);

});


$app->get('/reclamos/{token}', function ($token) use ($app)  {
  if(Auth::checkToken($token) !== true) return  $app->json(array('ERROR' => 'Token invalido'),404);
  $sql_usuario = "SELECT login FROM user where token = '".$token."'";
  $res_usu = $app['db']->fetchAssoc($sql_usuario);

  $sql = "SELECT * FROM reclamo WHERE login = ? ";
  $reclamos = $app['db']->fetchAssoc($sql, array($res_usu['login']));
  return $app->json(array('reclamos' => $reclamos),200);
});

$app->run();
