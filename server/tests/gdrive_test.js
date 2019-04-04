const fs = require('fs');
const {
  promisify
} = require('util');
const promiseReader = promisify(fs.readFile);
const readline = require('readline');
const {
  google
} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

async function main(fileName) {
  const credentials = await fileReader('credentials.json')
  const oAuth2Client = await authorize(JSON.parse(credentials))
  uploadFile(oAuth2Client, fileName)
}

async function fileReader(fileName) {
  return await promiseReader(fileName)
}

main('backuptest.zip');

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
async function authorize(credentials) {
  const {
    client_secret,
    client_id,
    redirect_uris
  } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);

  const token = await fileReader(TOKEN_PATH).catch((err) => {
    console.log(err);
    return getAccessToken(oAuth2Client);
  });
  oAuth2Client.setCredentials(JSON.parse(token))
  return oAuth2Client
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      return oAuth2Client
    });
  });
}

function uploadFile(auth, fileName) {
  const drive = google.drive({
    version: 'v3',
    auth
  });
  let fileMetadata = {
    'name': fileName
  };
  let media = {
    mimeType: 'application/zip',
    body: fs.createReadStream('./' + fileName),
    resumable: true
  };
  drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id',
    uploadType: 'resumable'
  }).catch(err => console.log(err));
}