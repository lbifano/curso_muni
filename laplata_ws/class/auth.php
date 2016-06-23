<?php
class Auth
{
    public static function checkToken($token)  {
      global $app;
      $token = trim($token);
      if($token!='')
      {
        $sql = "SELECT * FROM user WHERE token = ?";

        $res = $app['db']->fetchAssoc($sql, array($token));
        if($res)
        {
          #ver si no esta dado de baja
          $segundos=strtotime($res['fh_token']) - strtotime('now');
          $diferencia=intval($segundos/60/60/24/30);#token valido por 1 mes
          if($diferencia == 0)
          {
            return true;
          }
        }
      }
      return false;
    }
}
