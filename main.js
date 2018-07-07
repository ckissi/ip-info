const electron = require('electron')
const {Menu, Tray, clipboard, ipcMain } = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const Notification = electron.Notification

const path = require('path')
const url = require('url')
const notifier = require('node-notifier')
const settings = require('electron-settings')
var http = require('http')
var ip = require("ip")
var address = require('address')
var AutoLaunch = require('auto-launch');
var functions = require("./js_modules/functions.js");
var contextMenu, menuTemplate
var mac_address
var ip_data = {   
   country: '',
   city: '',
   timezone: '',
   query: '',
   isp: ''
} 


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let tray = null

var autoLauncher = new AutoLaunch({
  name: 'IP Info',
  path: app.getPath('exe'),
});

/*autoLauncher.isEnabled().then((isEnabled) => {
  if (!isEnabled) autoLauncher.enable();
});*/

console.log('Path' + app.getPath('exe'));

function createWindow() {
    if (process.platform === 'darwin') app.dock.hide();

    // Create the browser window.
    mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      frame: false,
      transparent: true,
      show: false,
      icon: path.join(__dirname, 'assets/img/connection.png')
    })

    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true,
    }))

    // Open the DevTools.
    //mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      mainWindow = null
    })
    
    // settings
    
    //settings.deleteAll()
    // initial autolauch setitings
    if(!settings.has('autolaunch')) { 
      settings.set('autolauch',true)
      autoLauncher.enable()
    }
    if(!settings.has('copy_to_clipboard')) { 
      settings.set('copy_to_clipboard',true)
    }
    if(!settings.has('show_local_ip')) { 
      settings.set('show_local_ip',false)
    }

    setTray()
    functions.getIpInfo(getData)  
    //notifyme('title', 'meesage', './assets/img/connection.png')
    
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit()
    }
})

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
      createWindow()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

function setTray() {
  
  mac_address = functions.getMacAddr()
  tray = new Tray(path.join(__dirname, '/assets/img/connection.png'))
  menuTemplate = [
    {
      label: 'Local  IP: ' +  address.ip(),
      sublabel: 'daco',
      icon: path.join(__dirname, '/assets/img/connection.png'),
      click: function () {
         if(settings.get('copy_to_clipboard')) {
            clipboard.writeText(address.ip())
            functions.notifyMe('Success', address.ip() + ' has been copied to clipboard',path.join(__dirname, '/assets/img/connection.png'))         
         }
      }
    },
    {
      label: 'Public IP: ' +  ip_data.ip,
      click: function () {
        if(settings.get('copy_to_clipboard')) {
           clipboard.writeText(ip_data.ip)
           functions.notifyMe('Success', ip_data.ip + ' has been copied to clipboard',path.join(__dirname, '/assets/img/connection.png'))               
        }
      }
    },
    {
      label: 'MAC Address: ' +  mac_address,
      click: function () {
        if(settings.get('copy_to_clipboard')) {
           clipboard.writeText(mac_address)
           functions.notifyMe('Success', mac_address + ' has been copied to clipboard',path.join(__dirname, '/assets/img/connection.png'))
        }
      }
    },    
    {
      type: 'separator'
    },
    {
      label: 'Additional Details...',
      submenu: [{
          label: ''
        },
        {
          label: '',
          click: function () {
            
          }
        },
        {
          label: '',
          click: function () {
            
          }
        },
        {
          label: '',
          click: function () {
            
          }
        }
      ],
    },
    {
      label: 'Settings',
      submenu: [{
          label: 'Start on Login',
          type: 'checkbox',
          checked: (!settings.has('autolaunch') ? true : settings.get('autolaunch')),
          click: function() {            
                  settings.set('autolaunch',contextMenu.items[5].submenu.items[0].checked);
                  if(settings.get('autolaunch')) autoLauncher.enable()
                  else autoLauncher.disable();              
          }          
        },
        {
          label: 'Copy to Clipboard on Click',
          type: 'checkbox',
          checked: (!settings.has('copy_to_clipboard') ? true : settings.get('copy_to_clipboard')),
          click: function() {            
            settings.set('copy_to_clipboard',contextMenu.items[5].submenu.items[1].checked);             
          }   
        },
        {
          label: 'Show Local IP in Menu Bar',
          type: 'checkbox',
          checked: (settings.has('show_local_ip') ? settings.get('show_local_ip') : false),
          click: function() {            
              settings.set('show_local_ip', contextMenu.items[5].submenu.items[2].checked);
              tray.setTitle(contextMenu.items[5].submenu.items[2].checked ? address.ip() : ip_data.ip);
              console.log(contextMenu.items[5].submenu.items[2].label)
          }
        },
        {
          label: 'Refresh',
          click: function () {
            //setTray();
            functions.getIpInfo(getData)  
          }
        },
      ]
    },
    {
      type: 'separator'
    },
    {
      label: 'Quit',
      click: function () {
        app.quit()
      }
    },

  ]
  contextMenu = Menu.buildFromTemplate(menuTemplate)
  tray.setContextMenu(contextMenu)

  tray.setTitle('')
  tray.setToolTip('')

}

//==== FUNCTIONS ==================================

var getData = function (data) {
  //data.local_ip = ip.address();
  local_ip = data.local_ip;
  //public_ip = data.query;
  if(settings.get('show_local_ip')) {
     tray.setTitle(address.ip())
     tray.setToolTip(address.ip())
  } else {
     tray.setTitle( data.query)
     tray.setToolTip( data.query)
  }
  
  ip_data.country = data.country
  ip_data.city = data.city
  ip_data.timezone = data.timezone
  ip_data.ip =  data.query
  ip_data.isp = data.isp
  menuTemplate[1].label = 'Public IP: ' + ip_data.ip
  menuTemplate[4].submenu[0].label = 'Country: ' + ip_data.country
  menuTemplate[4].submenu[1].label = 'City: ' + ip_data.city
  menuTemplate[4].submenu[2].label = 'Time Zone: ' + ip_data.timezone
  menuTemplate[4].submenu[3].label = 'ISP: ' + ip_data.isp
  contextMenu = Menu.buildFromTemplate(menuTemplate)
  tray.setContextMenu(contextMenu)
  //window.webContents.send('content', data);
  //console.log(ip_data.ip);
}

  /*var myNotificiation = new Notification('Title', {
    body: 'Lorem Ipsum Dolor Sit Amet'
  });

  myNotification.onclick = () => {
   console.log('Notification clicked')
 }*/
  /*notifier.notify({
    title: title,
    message: message,
    //icon: path.join('', 'images/' + icon), // Absolute path
    //icon: icon,
    sound: true, // Only Notification Center or Windows Toasters
    wait: true // Wait with callback, until user action is take

  }, function (err, response) {
    // Response is response from notification
  });

  notifier.on('click', function (notifierObject, options) {
    console.log("You clicked on the notification")
  });

  notifier.on('timeout', function (notifierObject, options) {
    console.log("Notification timed out!")
  });
}
*/