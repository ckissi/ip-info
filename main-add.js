function notifyme(title, message, icon) {
    notifier.notify({
        title: title,
        message: message,
        icon: path.join('', 'images/' + icon),  // Absolute path
        sound: true,  // Only Notification Center or Windows Toasters
        wait: true    // Wait with callback, until user action is take

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
