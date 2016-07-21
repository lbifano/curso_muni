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
require 'class/reclamo.php';
use Symfony\Component\HttpFoundation\Request;
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

$app->post('/reclamo/{obs}/{categoria}/{lng}/{lat}/{error}/{token}', function ($obs,$categoria,$lng,$lat,$error,$token) use ($app)  {
  if(Auth::checkToken($token) !== true) return  $app->json(array('ERROR' => 'Token invalido'),404);
  $usuario = Auth::getUsuario($token);
  $sql = "INSERT INTO reclamo (login, observacion, gps_lng, gps_lat, gps_err) values (?,?,?,?,?)";
  $res = $app['db']->insert('reclamo', array( 'login' => $usuario['login'] ,
                                              'observacion' => $obs,
                                              'gps_lng' => $lng,
                                              'gps_lat' => $lat,
                                              'gps_err' => $error));
  return $app->json($res,201);
});

$app->get('/reclamosRelacionados/{lng}/{lat}/{token}', function ($lng,$lat,$token) use ($app)  {
  if(Auth::checkToken($token) !== true) return  $app->json(array('ERROR' => 'Token invalido'),404);
  if(Reclamo::recRelacionado($lng,$lat)) {
    //devulevo la lista con estado 200OK
  }
  else {
    return $app->json(array(),201);
  }
});

$app->get('/reincidirReclamo/{id}/{obs}/{token}', function ($id,$token) use ($app)  {
  if(Auth::checkToken($token) !== true) return  $app->json(array('ERROR' => 'Token invalido'),404);
  $usuario = Auth::getUsuario($token);
  $res = $app['db']->insert('reincidir', array( 'login' => $usuario['loogin'] ,
                                              'observacion' => $obs,
                                              'id_reclamo' => $id));
  return $app->json($res,200);
});

$app->post('/upload', function (Request $request) use ($app) {
     $file = $request->files->get('file');
     if ($file == NULL)
     {
         return $app->json(array('status' => 'Fail'), 500);
     }
     else
     {
          $file->move(__DIR__.'/files', $file->getClientOriginalName());
          return $app->json(array('status' => 'Ok'), 200);
     }
});


$app->get('/send_msg/{title}/{msj}/{id}', function ($title,$msj,$id) use ($app) {
  #$sql = "SELECT * FROM usuarios WHERE id = ?";
  #$res = $app['db']->fetchAssoc($sql, array((int) $id));
  if(1) {
    // API access key from Google API's Console
    define( 'API_ACCESS_KEY', 'AIzaSyB0cpwVJGMIGbfZAIdZbXTmY2-d7jG579s' );
    #$registrationIds = array( $res['api_key'] );
    // prep the bundle
    $to = "cWq0ar48MWM:APA91bFgtoU6-W9GqU0kHBKQYN0zbCok1TfoQbdHI734O1pkUTDGQgyy-WFqEpZT25PKEjdTiNz1J54JjMrYu8uFvvENmzeHVNYJsT3VfgEuVgXpaZLl4JrOJBBAbNJHHWb5Ii5VYnrA";
    $fields = array
    (
      "notification" => array(
        "title"=>$title,
        "body"=>$msj,
        "sound"=>"default",
        "click_action"=>"FCM_PLUGIN_ACTIVITY",
        "icon"=>"fcm_push_icon",
        "color"=> "#ff0000"
      )
      ,
      "data" => array(
        "sexo"=>"M",
        "estatura"=>"1,60",
        "peso"=> "80"
      )
      ,
        "to" => $to,
        "priority" => "high",
        "restricted_package_name" => ""
    );

    $headers = array
    (
      'Authorization: key=' . API_ACCESS_KEY,
      'Content-Type: application/json'
    );

    $ch = curl_init();
    curl_setopt( $ch,CURLOPT_URL, 'https://fcm.googleapis.com/fcm/send' );
    curl_setopt( $ch,CURLOPT_POST, true );
    curl_setopt( $ch,CURLOPT_HTTPHEADER, $headers );
    curl_setopt( $ch,CURLOPT_RETURNTRANSFER, true );
    curl_setopt( $ch,CURLOPT_SSL_VERIFYPEER, false );
    curl_setopt( $ch,CURLOPT_POSTFIELDS, json_encode( $fields ) );
    $result = curl_exec($ch );
    curl_close( $ch );
    return  $app->json($result,200);
  } else {
    return $app->json('USER NOT FOUND', 500);
  }

});



$app->run();
