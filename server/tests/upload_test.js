const {
    google
} = require('googleapis');
const fs = require('fs');
const readline = require('readline');
const compute = google.compute('v1');
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const path = require('path');
const TOKEN_PATH = path.join(process.cwd(), 'token.json');

async function main() {
    // This method looks for the GCLOUD_PROJECT and GOOGLE_APPLICATION_CREDENTIALS
    // environment letiables.
    /*
    const auth = await google.auth.getClient({
        // Scopes can be specified either as an array or as a single, space-delimited string.
        //scopes: ['https://www.googleapis.com/auth/compute']
        scopes: SCOPES
    });
    */

    const apiData = require('../client_id.json');
    const oAuth2Client = new google.auth.OAuth2(
        apiData.web.client_id,
        apiData.web.client_secret,
        ''
    );
    await fs.readFile(TOKEN_PATH, (err, token) => {
        oAuth2Client.setCredentials(JSON.parse(token));
    });

    const drive = google.drive({
        version: 'v3',
        auth: oAuth2Client
    });
    drive.files.list({
        pageSize: 10,
        fields: 'nextPageToken, files(id, name)',
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const files = res.data.files;
        if (files.length) {
            console.log('Files:');
            files.map((file) => {
                console.log(`${file.name} (${file.id})`);
            });
        } else {
            console.log('No files found.');
        }
    });
}

main().catch(console.error);