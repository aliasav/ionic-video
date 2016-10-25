(function(){

angular.module('yolo.utils', [])

.factory('$localstorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    },
    addObject: function(key1, key2, value){
      $window.localStorage[key1][key2] = value;
    }
  }
}])

// utility functions
.factory("UTILS", function(SERVER, $sce){
  var o = {

    // variables
    weekday : ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    month : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],


    validate_email : function(email){
      regex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}/igm;
      return regex.test(email);
    },

    validate_text : function(text){
      if(text == undefined || text.length == 0 || text == " ")
        return false
      else return true;
    },

    validate_phone : function(phone){
      regex = /^\d{10}$/
      return regex.test(phone);
    },

    validate_number : function(number){
      number = parseInt(number, 10);
      if(number == undefined || number.length == 0 || number == " " || !(typeof number === 'number')){
        return false;
      }
      else return true;
    },

    // receives pythonic date and converts to displayable date 
    process_date : function(date){
      date = (date.slice(0,10)).split("-");
      date = new Date(date);
      var date_string = String(o.month[parseInt(date.getMonth())]) + " " + String(date.getDate()) + ", " + String(date.getFullYear());

      return date_string;

    },

    // function to get day, date, month in a list
    get_date: function(){
      
      var d = new Date(); 
      
      var n = o.weekday[d.getDay()];
      var m = o.month[d.getMonth()];
      
      return [ n, d.getDate(), m]; 
    },

    // returns video url prepended with server url
    generate_video_url : function(url){
      url = SERVER.server_url + String(url);
      url = $sce.trustAsResourceUrl(url);
      return url;
    },

    // returns trusted url 
    generate_sce_trusted_video_url : function(url){
      url = $sce.trustAsResourceUrl(url);
      return url;
    },

    // generates array of date-sorted video objects
    sort_video_data : function(video_data){

      // initialise variables
      var ds1 = [], i = 0, temp, ds2 = [];
      
      // get date and original indices list
      for (vid in video_data){
        var a = (video_data[vid].created_at.slice(0,10)).split("-");
        var b = (video_data[vid].created_at.slice(11,19)).split(":");
        a = a.concat(b);
        ds1[i] = [vid, new Date(a[0],a[1],a[2],a[3],a[4],a[5])];
        i++;
      }
      
      // sort ds1 according to date
      // applying selection sort
      var min = ds1[0][1];
      for (i = 0 ; i < ds1.length; i++){
        min = i;
        for (var j=i + 1; j < ds1.length; j++){
          if(ds1[min][1] >= ds1[j][1]){
            min = j;
          }  
        }
        if (min != i){
          temp = ds1[min][1];
          ds1[min][1] = ds1[i][1];
          ds1[i][1] = temp;
        }
      }

      // create sorted video data
      var sorted_video_data = {};
      for ( i = 0; i < ds1.length; i++ ){
        sorted_video_data[ds1[i][0]] = video_data[ds1[i][0]];
      }    

      console.log("Sorted video data ->");
      console.log(JSON.stringify(sorted_video_data));

      return sorted_video_data;

    },

  };
  return o;
})

// filter to capfirst text
.filter('capfirst', function() {
    return function(input, scope) {
      if (input == undefined || input == null)
        return;
        return input.substring(0,1).toUpperCase()+input.substring(1);
      }
})

// returns trusted url
.filter('trustAsResourceUrl', ['$sce', function($sce) {
    return function(val) {
        return $sce.trustAsResourceUrl(val);
    };
}])

// log factory for debugging
.factory("LOG", function(DEBUG){
  
  var obj = {
    debug : DEBUG.Value,

    log : function(str){
      if (obj.debug){
        console.log(str);
      }
    }
  };

  return obj;

})

;

})();