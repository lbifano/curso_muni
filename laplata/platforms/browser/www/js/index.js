var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', app.onDeviceReady, false);
    },
    onDeviceReady: function() {

        console.log("onDeviceReady");
        FCMPlugin.getToken(
          function(token){
            $('#token_fcm').html(token);

          },
          function(err){
            alert('error retrieving token: ' + err);
          }
        );
        FCMPlugin.onNotification(
          function(data){
            if(data.wasTapped){
              //Notification was received on device tray and tapped by the user.
              alert( JSON.stringify(data) );
            }else{
              //Notification was received in foreground. Maybe the user needs to be notified.
              alert( JSON.stringify(data) );
            }
          },
          function(msg){
            console.log('onNotification callback successfully registered: ' + msg);
          },
          function(err){
            console.log('Error registering onNotification callback: ' + err);
          }
        );
    },

    doLogin: function () {
      var user=$("#login_username").val();
      var pass=$("#login_password").val();
      $.ajax({
        url:'http://localhost/laplata_ws/index.php/getToken/'+user+'/'+pass,
        success: doLoginOK,
        error: doLoginERROR
      });
      function doLoginOK(r){
        //lo envio al index
        DB.save('dataLogin',r.token);
        document.location = 'index.html';
      }
      function doLoginERROR(r){
        alert(r.responseText);
      }
    },

    doAltaReclamo: function(posicion) {

      var observacion = $("#rec_observacion").val();
      var categoria = $("#rec_categoria").val();
      console.log(Config.server+'reclamo/'+observacion+'/'+categoria+'/'+posicion.coords.longitude+'/'+posicion.coords.latitude+'/'+posicion.coords.accuracy+'/'+Config.token_test);
      $.ajax({
        url: Config.server+'reclamo/'+observacion+'/'+categoria+'/'+posicion.coords.longitude+'/'+posicion.coords.latitude+'/'+posicion.coords.accuracy+'/'+Config.token_test,
        method: "POST",
        success: function(r) {
          if($('#fotos').children().length) {
            $('#fotos').children('img').each(function () {
                //console.log(this.src);
                app.uploadFoto($(this).attr('src'));
            });
          }
        },
        error: function(r) {
          console.log("Error al crear el reclamo");

          console.log(r);
        }
      });


    },
    altaReclamo: function() {

      GPS.geoAndThen(app.doAltaReclamo);
    },
    takePhoto: function(e) {

      if($('#fotos').children().length >= Config.cant_fotos) {
        alert('Solo se pueden subier '+Config.cant_fotos+' fotos');
        return;
      }
      if (navigator.camera && !Config.test)
      {
        app.capture();
      }
      else
      {
        IMAGE_URI = 'img/logo.png';
        app.addFoto(IMAGE_URI);
      }
    },

    addFoto: function(src)
    {
        var img = $('<img class="foto" width="128px" style="padding:10px" onclick="if(confirm(\'Desea eliminar esta foto?\')) $(this).remove();">');
        img.attr('src', src);
        img.appendTo('#fotos');
    },

    capture: function() {
          navigator.camera.getPicture(app.onCaptureSuccess, app.onCaptureFail, {
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.CAMERA,
            targetWidth: Config.width_fotos,
            correctOrientation: true
          });
    },

    onCaptureSuccess: function(imageURI) {
        IMAGE_URI = imageURI;
        app.addFoto(IMAGE_URI);
    },
    onCaptureFail: function() {
        alert('Ocurrio un error al capturar la imagen');
    },

     uploadFoto: function (imageURI) {

        cb_ok = function (r) {
           console.log("Code = " + r.responseCode);
           console.log("Response = " + r.response);
           // borrar la foto
        }

        cb_fail = function (error) {
          console.log("Error al subir fotos");
          console.log(error);
          //marcar para intentar luego
        }

         var options = new FileUploadOptions();
         options.fileName=imageURI.substr(imageURI.lastIndexOf('/')+1);
         options.mimeType="image/png";
         options.params = {};
         options.chunkedMode = true;

         var ft = new FileTransfer();
         console.log(imageURI);
         console.log(Config.upload_foto);
         console.log(options);
         ft.upload(imageURI, encodeURI(Config.server+'upload'), cb_ok, cb_fail, options);
    },


};
