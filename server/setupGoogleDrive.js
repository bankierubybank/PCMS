async function setupGoogleDrive() {
    let googleDrive = require('./controllers/googleDrive.js');
    googleDrive.upload('test.zip');
}

setupGoogleDrive();