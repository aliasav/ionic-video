/* All services go here */
/* Kindly Keep code modular */
/* Use utlities whenever possible */

(function(){

angular.module('yolo.services', ['yolo.utils'])

.factory("videoService", function($http, $cordovaCapture, $ionicPlatform, $cordovaFileTransfer, $q, $localstorage, SERVER, USER, UTILS, VIDEO_SETTINGS){

  var videoService = {

    // videos list
    video_data : {},

    // intermediate temp object to store currently being uploaded video data
    temp_video_data : {},

    // launches camera, uploads video to server on save
    captureVideo : captureVideo,

    // gets video history : gets all videos' guids and created_at(s)
    getVideosHistory : getVideosHistory,

    // video data in local storage is a list of dictionaries corresponding to a video
    setVideoDataLocalStorage : setVideoDataLocalStorage,

    // get available video local path : either local app directory path or video player directory path
    getAvailableVideoPath : getAvailableVideoPath,   

    fail : fail,

    // generates random name for file
    makeid : makeid,

  };

  return videoService;

  // launches camera, uploads video to server on save
  function captureVideo(){

    var defer = $q.defer();

    // set videCapture options
    var videoCapture_options = { limit: 1, duration: VIDEO_SETTINGS.duration };

    // set upload meta-data
    videoService.temp_video_data = USER.getUserDetails();
    var d = String(new Date().toJSON().slice(0,10));
    var file_name = "yoro:" + String(videoService.temp_video_data["username"]) + ":" + d + ".mp4";

    videoService.temp_video_data["date"] = d;
    videoService.temp_video_data["file_name"] = file_name;

    // launch camera, saving and uploading done in success callback
    $cordovaCapture.captureVideo(videoCapture_options)
    .then(function(videoData) {

      // get local filesystem path of captured video
      var url = videoData[0].fullPath;
      var url2 = videoData[0].localURL;

      videoService.temp_video_data["url"] = url;
      videoService.temp_video_data["url2"] = url2;

      // make copy of file and store file in app directory
      getNativeURL()
      .then(function(result){

        console.log("getNativeURL_result : " + JSON.stringify(result));

        // add local paths to temp video data in videoService
        videoService.temp_video_data["local_path_1"]  = result.local_path_1;
        videoService.temp_video_data["local_path_2"]  = result.local_path_2;

        // initiate video uploading to server
        document.addEventListener('deviceready', function(){
          // set options for uploading
          var trustAllHosts = true;
          var options_ft = {
            fileKey: "yoro_vid",
            fileName: file_name,
            chunkedMode: true,
            mimeType: "video/mp4",
            params: videoService.temp_video_data,
          };

          $cordovaFileTransfer.upload(SERVER.upload_video, videoService.temp_video_data["local_path_1"], options_ft, trustAllHosts)
            .then(
            // success callback
            function(result) {

              if (result.responseCode===200){

                // parse response JSON string to object
                var data = JSON.parse(result.response);
                //console.log(JSON.stringify(data));
                // update can_upload flag
                USER.can_upload_flag = result.response.can_upload;

                // fetch guid and (pythonic)created_at of uploaded video
                var video_data_2 = data.video_data;

                // set local_path in video_data object
                for (var k in video_data_2)
                  var key = k;
                video_data_2[k]["local_path"] = videoService.temp_video_data["url"];

                // store video information in service object
                videoService.video_data[key] = video_data_2;

                //console.log(JSON.stringify(videoService.video_data));

                // store information in localstorage
                videoService.setVideoDataLocalStorage(video_data_2);

                defer.resolve(true);
              }

            },
            // error callback
            function(err) {
              defer.resolve(false);
            },
            // progress
            function (progress) {
              //alert(progress);
            }
            );

        }, false);
        return result;
      });

      //console.log("videoService.temp_video_data : " + JSON.stringify(videoService.temp_video_data));

      // returns promise of native filesystem objbect
      function getNativeURL(){
          // create promise that returns file system object
          var defer = $q.defer();
          var file_paths = {
            "local_path_1" : null, // local path in video directory
            "local_path_2" : null, // local path in app diretory
          };

          window.resolveLocalFileSystemURL(url2,
            // success callback
            function(entry){
              file_paths.local_path_1 = entry.nativeURL;
              //console.log("window.resolveLocalFileSystemURL : " + String(JSON.stringify(entry)));
              var name = entry.fullPath.substr(entry.fullPath.lastIndexOf('/') + 1);
              var newName = videoService.makeid() + name;

              var nativeURL = window.resolveLocalFileSystemURL(cordova.file.dataDirectory,
                // copy file to project directory
                function(fileSystem2){
                    var result = entry.copyTo(fileSystem2, newName, function(succ) {
                      file_paths.local_path_2 = succ.nativeURL;
                      // resolve promise with filesystem object
                     defer.resolve(file_paths);
                    }, videoService.fail);
                  }, videoService.fail);
            }, videoService.fail);

          return defer.promise;
      }
    });

    return defer.promise;
  }


  // gets video history : gets all videos' guids and created_at(s)
  function getVideosHistory(){

    var defer = $q.defer();
    var post_data = {
      "username" : USER.user_data["username"],
      "passkey" : USER.user_data["passkey"],
      "guid" : USER.user_data["guid"],
    };

    $http.post(SERVER.get_user_history, post_data)
    .success(function(data, status, headers, config){
      if (status===200){

        var number = parseInt(data["videos_number"]);

        console.log("Video data obtained -> " + String(number));
        console.log(JSON.stringify(data));

        if(number===0){
          defer.resolve("empty");
        }
        else{
          videoService.video_data = data["videos"];
          defer.resolve(true);
        }
      }
    })
    .error(function(data, status, headers, config){
      console.log("Error in getting video history.")
      defer.resolve(false);
    });

    return defer.promise;
  }

  // video data in local storage is a list of dictionaries corresponding to a video
  function setVideoDataLocalStorage(video_data){
    console.log("in setVideoDataLocalStorage");
    for (var k in video_data)
      var vid_guid = k;
    //$localstorage.addObject("video_data", String(vid_guid), {vid_guid : video_data});
    $localstorage.setObject("video_data", videoService.video_data);
    console.log(JSON.stringify($localstorage.getObject("video_data")));
  }

  function fail(){
    console.log("Failed callback ");
  }

  // Function to make a unique filename
  function makeid() {
   var text = '';
   var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   for ( var i=0; i < 5; i++ ) {
   text += possible.charAt(Math.floor(Math.random() * possible.length));
   }
   return text;
  }

  // takes 2 paths, returns available path or null
  // gets video path if available in app directory else fallback if video player directory else return null
  // returning null will allow user to donwload video from server
  function getAvailableVideoPath(p1, p2){
    
    window.resolveLocalFileSystemURL(p1, 
        
        // success callback
        function(fileEntry){
          console.log("Available path : " + String(fileEntry.nativeURL));
          return fileEntry.nativeURL;
        },

      // error callback
      // proceed to fallback 1
      function(){
        console.log("App directory url not available fallback");
        return p2; 
      }
    );
  }

}) // end of videoService

.factory('USER', function($http, $q, $localstorage, UTILS, SERVER){

  var o = {
    // user data object
    user_data : {
      "username" : false,
      "passkey" : false,
      "guid" : false,
      "created_at" : false,
    },

    // controls single video uploading per day
    can_upload_flag : true,

    // auth function for signup/login based on signingUp flag
    auth: function(user_obj, signingUp){

      var defer = $q.defer();

      // validate username & passkey
      if(!UTILS.validate_text(user_obj.username) || !UTILS.validate_text(user_obj.passkey)){
        alert("Please enter valid username and passkey!");
        defer.resolve(false);
      }

      else {

        // generate auth url for POST request
        var authRoute, url = SERVER.auth_url;
        if(signingUp){
          url = url + '/' + 'signup';
        }
        else {
          url = url + '/' + 'login';
        }

        // data to be sent to server
        data = {
          "username" : String(user_obj.username),
          "passkey" : String(user_obj.passkey),
          "user_id" : String(user_obj.user_id),
        };

        // initiate POST request : expected status codes : 201, 200, 403, 409; Rest all treated as 500
        $http.post(url, data)
        .success(function(data, status, config, headers){
          console.log("Data :")
          console.log(data);
          // user created successfully
          if (status == 201){
            console.log("User created successfully.");
            // set data in localstorage and USER user_data object
            o.setSession(data.user_data);
            defer.resolve(201);
          }

          // user logged in successfully
          else if (status==200){
            console.log("User logged in successfully.")
            // set data in localstorage and USER user_data object
            o.setSession(data.user_data);
            defer.resolve(200);
          }

          // error in auth
          else{
            console.log("Error in auth");
            defer.resolve(500);
          }
        })
        .error(function(data, status, config, headers){

          console.log("Error in auth : " + String(status));

          // username already exists
          if (status==409){
            console.log("Username/passkey pair already exists.");
            defer.resolve(409);
          }

          // invalid username/passkey pair
          else if (status==403){
            console.log("invalid username/passkey pair.");
            defer.resolve(403);
          }

          // error in auth
          else{
            console.log("Error in auth");
            defer.resolve(500);
          }

        });
      }

      return defer.promise;

    },

    // set user_data in User service and localstorage
    // set video_data in localstorage
    setSession: function(user_data){
      // set user_data in object
      if (user_data["username"]) o.user_data["username"] = user_data["username"];
      if (user_data["passkey"]) o.user_data["passkey"] = user_data["passkey"];
      if (user_data["guid"]) o.user_data["guid"] = user_data["guid"];
      if (user_data["created_at"]) o.user_data["created_at"] = user_data["created_at"];
      if (user_data["user_id"]) o.user_data["user_id"] = user_data["user_id"];
      if (user_data["is_identfied"]) o.user_data["is_identfied"] = user_data["is_identfied"];

      // set user_data in localstorage
      $localstorage.setObject('user', {username : user_data["username"], passkey : user_data["passkey"], guid : user_data["guid"], created_at : user_data["created_at"], user_id : user_data["user_id"], is_identfied : user_data["is_identfied"]});

      // set video_data in localstorage
      $localstorage.setObject('video_data', {});
    },

    // check if session exists, return true/false
    checkSession: function(){
      var defer = $q.defer();
      var user = $localstorage.getObject('user');

      //console.log("Checking localstorage for user obj -->");
      //console.log(user);

      // check localstorage value
      if (user.username){
        // initialise obj in this service
        o.user_data = {
          "username" : user.username,
          "passkey" : user.passkey,
          "guid" : user.guid,
          "created_at" : user.created_at,
        };
        defer.resolve(true);
      }
      // user object not found
      else defer.resolve(false);

      return defer.promise;
    },

    // get user details
    getUserDetails : function(){
      var details = {};
      var user = $localstorage.getObject('user');

      // set username
      if (o.user_data["username"]) details["username"] = o.user_data["username"];
      else details["username"] = user.username;

      // set passkey
      if (o.user_data["passkey"]) details["passkey"] = o.user_data["passkey"];
      else details["passkey"] = user.passkey;

      // set guid
      if (o.user_data["guid"]) details["guid"] = o.user_data["guid"];
      else details["guid"] = user.guid;

      // set created_at
      if (o.user_data["created_at"]) details["created_at"] = o.user_data["created_at"];
      else details["created_at"] = user.guid;

      return details;
    },

    destroySession: function(){
      $localstorage.setObject('user', {});
      o.user_data = {};
    },

    // function to get_can_upload_flag : invoked beforeEnter of tab-dash
    get_can_upload_flag : function(){
      var defer = $q.defer();

      var post_data = {
        "username" : o.user_data["username"],
        "passkey" : o.user_data["passkey"],
        "guid" : o.user_data["guid"],
      };

      $http.post(SERVER.get_can_upload_flag, post_data)
      .success(function(data, status, headers, config){
        if(status===200){
          o.can_upload_flag = data["can_upload"];
          console.log("Received can_upload_flag : " + String(o.can_upload_flag));
          defer.resolve(true);
        }
      })
      .error(function(data, status, headers, config){
        console.log("error in getting can_upload_flag : " + String(status));
        defer.resolve(false);
      })

      return defer.promise;
    },
  }

  return o;

})

;})()
