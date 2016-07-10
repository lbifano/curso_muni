/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        //document.location = 'login.html';
        //slide('left', 'login.html');
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
      console.log('http://localhost/laplata_ws/index.php/reclamo/'+observacion+'/'+categoria+'/'+posicion.coords.longitude+'/'+posicion.coords.latitude+'/'+posicion.coords.accuracy+'/'+DB.get('dataLogin'));
      var observacion = $("#rec_observacion").val();
      var categoria = $("#rec_categoria").val();
      $.ajax({
        url: 'http://localhost/laplata_ws/index.php/reclamo/'+observacion+'/'+categoria+'/'+posicion.coords.longitude+'/'+posicion.coords.latitude+'/'+posicion.coords.accuracy+'/'+DB.get('dataLogin'),
        type: 'POST',
        success: okReclamo,
        error: errReclamo
      });
      function okReclamo() {
        if($('#fotos').children().length) {
          $('#fotos').children('img').each(function () {
              app.uploadFoto(this.prop('src'));
          });
        }
      }
      function errReclamo() {

      }
    },
    altaReclamo: function() {

      GPS.geoAndThen(app.doAltaReclamo);
    },
    takePhoto: function(e) {

      if($('#fotos').children().length >= Config.cant_fotos) {
        alert('Solo se pueden subier '+Config.cant_fotos+' fotos');
        return;
      }
      if (navigator.camera)
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
        var img = $('<img class="foto" onclick="if(confirm(\'Desea eliminar esta foto?\')) $(this).remove();">');
        img.attr('src', src);
        img.appendTo('#fotos');
    },

    capture: function() {
          navigator.camera.getPicture(app.onCaptureSuccess, app.onCaptureFail, {
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.CAMERA,
            targetWidth: 200,
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
          console.log("Response = " +  error.code);
          //marcar para intentar luego
        }
        console.log(imageURI);
         var ft = new FileTransfer();
         var options = new FileUploadOptions();
         options.fileKey= "file";
         options.fileName=imagefile.substr(imagefile.lastIndexOf('/')+1);
         options.mimeType="image/jpeg";
         options.params = {};
         options.chunkedMode = false;

         ft.upload(imagefile, 'http://localhost/laplata_ws/index.php/upload', cb_ok, cb_fail, options);
    },


};
