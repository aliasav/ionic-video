// Ionic yolo App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'yolo' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'yolo.services' is found in services.js
// 'yolo.controllers' is found in controllers.js

(function(){

angular.module('yolo', ['ionic', 'yolo.controllers', 'yolo.services', 'yolo.utils', 'ngCordova', 'ngCookies', 'ionic.service.core', 'ionic.service.push'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }
  });
})

// user identification settings
.config(['$ionicAppProvider', function($ionicAppProvider){
  $ionicAppProvider.identify({
    app_id: "2c886cf2",
    api_key: "e63f38e04842d1062e2af762283e71c43b71e8fd485447f1",
    dev_push: true,
  })
}])

// Changing interpolation start/end symbols.
.config(function($interpolateProvider, $httpProvider){
  $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
})

// CSRF token setting
.run(function($http, $cookies){
  $http.defaults.headers.common['X-CSRFToken'] = $cookies['csrftoken'];
})


.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // splash page
  .state('splash', {
    url: '/',
    templateUrl: 'templates/splash.html',
    controller: 'SplashCtrl',
    onEnter : function($state, USER){
      USER.checkSession()
      .then(function(sessionFlag){
        console.log("sessionFlag : " + String(sessionFlag));
        if (sessionFlag) $state.go('tab.dash');
        else $state.go('splash');
      });
    },
  })


  // setup an abstract state for the tabs directive
    .state('tab', {
    url: "/tab",
    abstract: true,
    templateUrl: "templates/tabs.html",

    // don't load state until user is populated
    resolve: {
      populateSession : function(USER){
        console.log("populateSession");
        return USER.checkSession();
      },
    },

    onEnter: function($state, USER){
      USER.checkSession()
      .then(function(sessionFlag){
        if(sessionFlag) $state.go('tab.dash');
        else $state.go('splash');
      });
    },
  })

  // Each tab has its own nav history stack:

  .state('tab.dash', {
    url: '/dash',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-dash.html',
        controller: 'DashCtrl'
      }
    },

    /*resolve:{

      can_upload_flag: function(USER, $q){

        var defer = $q.defer();

        USER.get_can_upload_flag()
        .then(function(flag){
          if (flag){
            console.log("USER.can_upload_flag in resolve then: " + String(USER.can_upload_flag));
            defer.resolve(USER.can_upload_flag);
          }
        });

        return defer.promise;
      }
    },*/

  })

  .state('tab.account', {
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'accountController'
      }
    },
  })

  // If none of the above states are matched, use this as the fallback:
  $urlRouterProvider.otherwise('/');

})

// url used in priduction : SERVER

// development server urls
// always keep as SERVER
// will be changed to SERVER2 during deployment
// strictly keep the constant names in double quotes!

.constant("SERVER4", {
    server_url : "http://127.0.0.1:8000/api",
    auth_url :"http://127.0.0.1:8000/api",
    upload_video : "http://127.0.0.1:8000/api/upload_video",
    get_user_history: "http://127.0.0.1:8000/api/get_user_history",
    get_can_upload_flag : "http://127.0.0.1:8000/api/get_can_upload_flag",
  })

// production server urls
// always keep as SERVER1
// will be changed to SERVER during deployment
.constant("SERVER1", {
    server_url : "http://128.199.173.222/api",
    auth_url :"http://128.199.173.222/api",
    upload_video : "http://128.199.173.222/api/upload_video",
    get_user_history: "http://128.199.173.222/api/get_user_history",
    get_can_upload_flag : "http://128.199.173.222/api/get_can_upload_flag",
  })

// testing server urls
// always keep as SERVER3
.constant("SERVER3", {
    server_url : "http://192.168.1.84:8000/api",
    auth_url :"http://192.168.1.84:8000/api",
    upload_video : "http://192.168.1.84:8000/api/upload_video",
    get_user_history: "http://192.168.1.84:8000/api/get_user_history",
    get_can_upload_flag : "http://192.168.1.84:8000/api/get_can_upload_flag",
  })

.constant("SERVER", {
    server_url : "http://192.168.0.101:8000/api",
    auth_url :"http://192.168.0.101:8000/api",
    upload_video : "http://192.168.0.101:8000/api/upload_video",
    get_user_history: "http://192.168.0.101:8000/api/get_user_history",
    get_can_upload_flag : "http://192.168.0.101:8000/api/get_can_upload_flag",
  })


// value must be false in production!
.constant('DEBUG', {
  "Value" : true,
})

// video settings
.constant("VIDEO_SETTINGS",{
  "duration" : 20,
})

;

})()
