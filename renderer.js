// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const electron = require('electron')
const ipcRenderer = electron.ipcRenderer

ipcRenderer.on('notify' , function(event , data) {   
   console.log(data.msg) 
   let myNotification = new Notification('Success', {
        body: data.msg
   })
      
});
