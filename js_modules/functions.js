var address = require('address')
var http = require('http')
const electron = require('electron')
const Notification = electron.Notification

module.exports = {
    
   getIpInfo: function(callback) {

        return http.get({
            host: 'ip-api.com',
            path: '/json'
        }, function (response) {
            // Continuously update stream with data
            var body = '';
            response.on('data', function (d) {
                body += d;
            });
            response.on('end', function () {
        
                // Data reception is done, do whatever with it!      
                var parsed = JSON.parse(body);
                callback({
                country: parsed.country,
                city: parsed.city,
                timezone: parsed.timezone,
                query: parsed.query,
                isp: parsed.isp,
                });
            });
        });
    },
  //------------------------------------------------------------------------------------------
   getMacAddr: function () {
       return address.mac(function (err, addr) {
          return addr;
       });
   },

   notifyMe: function(title, message, icon) {
      if(Notification.isSupported())  console.log('not supported');
      const notifycation = new Notification({
        title: title,
        body: message,
        icon: icon 
      });
      notifycation.show();
   }
};