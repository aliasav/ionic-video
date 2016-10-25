/* All controllers go in this file */
/* Keep controllers as slim as possible */
/* Separate out as much as possible and include make services out of them. */
/* Naming convention for controllers: 'nameController'. A standard convention will make it easier to search for required controllers. */


(function(){

angular.module('yolo.controllers', ['ngCordova', 'yolo.services', 'yolo.utils'])

// dash controller for tab-dash page
.controller('DashCtrl', function($scope, SERVER, videoService, USER, UTILS) {

  // can_upload_flag controls single uploading per day
  // updates can_upload_flag each time tab-dash is entered
  $scope.$on('$ionicView.beforeEnter', function() {
    update_can_upload_flag();
  });

  // initialising variables
  var date_list = UTILS.get_date();

  /* state flag

    0 : User can capture video
    1 : Video captured and uploaded successfully
    2 : Error in uploading
    3 : Uploading in progress
  */


  $scope.stateFlag = 0;
  // date list
  $scope.date = {
    "day" : date_list[0],
    "date" : date_list[1],
    "month" : date_list[2],
  };

  // capture video and upload to server
  $scope.captureVideo = function(){

    // update stateFlag to uploading in progress state
    $scope.stateFlag = 3;

    // invoke camera
    videoService.captureVideo()
    .then(function(result){
      console.log("captureVideo returned in controller : " + String(result));
      // successful upload
      if (result === true){
        alert("You have uploaded your Yoro for today!");
        $scope.stateFlag = 1;
        update_can_upload_flag();
      }
      // error in uploading
      else if (result === false){
        alert("Error in file uploading, please check your internet connection & try again!");
        $scope.stateFlag = 0;
      }

    });
  }

  // updates can_upload_flag of scope
  function update_can_upload_flag(){
    USER.get_can_upload_flag()
    .then(function(flag){
      if(flag){
        // update flag if state is not in loading
        if ($scope.stateFlag != 3){
          $scope.can_upload_flag = USER.can_upload_flag;
        }
      }
      else $scope.can_upload_flag = false;
    });
  }

}) // end of dash controller


// account controller for tab-account page
.controller("accountController", function($scope, $sce, SERVER, videoService, UTILS){

  // inititalising variables
  $scope.video_data = {};
  $scope.displayVideosFlag = false;

  // update video history each time tab is opened
  $scope.$on('$ionicView.beforeEnter', function() {
    // get user video history
    videoService.getVideosHistory()
    .then(function(flag){
      
      if (flag){
        
        // no videos uploaded
        if (flag == "empty"){
        
          $scope.displayVideosFlag = false;
        
        }

        // video history obtained
        else{
          
          // set scope data  
          $scope.displayVideosFlag = true;
          // set video data and sort video data according to dates
          $scope.video_data = videoService.video_data;
          $scope.sorted_video_data = UTILS.sort_video_data($scope.video_data);
      
          // process data to correct video paths, generate trusted urls, get readable created at dates, fallback local path
          for (vid in $scope.video_data){
            $scope.video_data[vid].created_at = UTILS.process_date($scope.video_data[vid].created_at);
            $scope.video_data[vid].video_url = UTILS.generate_video_url($scope.video_data[vid].video_url);
            $scope.video_data[vid].available_path = videoService.getAvailableVideoPath($scope.video_data[vid].local_path, $scope.video_data[vid].local_path_2);
          }
        }
      }
      else{
        alert("Please check your internet connection!");
      }

    });
  });


  /*
   * if given group is the selected group, deselect it
   * else, select the given group
   */
  $scope.toggleGroup = function(group) {
    if ($scope.isGroupShown(group)) {
      $scope.shownGroup = null;
    } else {
      $scope.shownGroup = group;
    }
  };

  $scope.isGroupShown = function(group) {
    return $scope.shownGroup === group;
  };

  $scope.viewVideo = function(video){
    video.viewVideoFlag = true;
  };

})

// splash controller for splash page
.controller('SplashCtrl', function($scope, $state, $ionicUser, UTILS, LOG, USER) {

  // initialising variables
  $scope.user = {
    "username" : false,
    "passkey" : false,
  }

  // attempt to signup/login via User.auth
  $scope.submitForm = function(username, passkey, signinUp){
    // validate username/passkey
    if(UTILS.validate_text(username) && UTILS.validate_text(passkey)){

      // initialise user identification
      var user = $ionicUser.get();

      if(!user.user_id){
        // set user id here
        user.user_id = $ionicUser.generateGUID();
      }

      // meta data
      angular.extend(user,{
        name: username,
      });

      // identify user with Ionice User service
      $ionicUser.identify(user)
      .then(function(){
        $scope.user.identified = true;
        $scope.user.user_id = user.user_id;
        LOG.log("Identified user: " + $scope.user.username + "\bUser ID : " + $scope.user.user_id);
      })

      var user_obj = {
        "username" : username,
        "passkey" : passkey,
        "user_id" : user.user_id,
      };

      LOG.log("auth process initiated, possible status codes : 200, 201, 403, 409, 500");

      USER.auth(user_obj, signinUp)
      .then(function(status){
        LOG.log("status reveived:" + String(status));
        if (status==200 || status==201)
        {
          // session is set, redirect to dashboard
          $state.go('tab.dash');
        }
        else if (status==403){
          alert("Wrong username/passkey!");
        }
        else if (status==409){
          alert("Username & passkey already exists, choose a different username/passkey!");
        }
        else if(status==500){
          alert("Please check your internet connection!");
        }

      }, function(){
        // error handling here
        alert("Please check your internet connection!");
      });
    }
    else{

      if (!UTILS.validate_text(username)){
        alert("Please enter a valid username!");
      }

      if (!UTILS.validate_text(passkey)){
        alert("Please enter a valid passkey!");
      }
    }
  }

}) // end of splash controller

;


})()
