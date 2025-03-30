import { google } from 'googleapis';
import http from 'http';
import url from 'url';
import open from 'open';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config();

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = 'token.json';

async function getAuthClient() {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        'http://localhost:8080'
    );

    // Check if we have stored tokens
    if (fs.existsSync(TOKEN_PATH)) {
        const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH));
        oauth2Client.setCredentials(tokens);
        
        // Check if token is expired
        if (tokens.expiry_date && tokens.expiry_date > Date.now()) {
            console.log('Using stored authentication tokens');
            return oauth2Client;
        }
    }

    // If no valid tokens, get new ones
    console.log('No valid tokens found. Getting new authentication...');
    
    // Create a promise to handle the authorization code
    const authCodePromise = new Promise((resolve) => {
        const server = http.createServer(async (req, res) => {
            try {
                const urlParams = url.parse(req.url, true);
                const code = urlParams.query.code;

                if (code) {
                    console.log('Authorization code received!');
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end('Authorization successful! You can close this window.');
                    server.close();
                    resolve(code);
                }
            } catch (error) {
                console.error('Error processing authorization:', error);
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end('Error processing authorization');
            }
        });

        server.listen(8080, () => {
            console.log('Waiting for authorization...');
        });
    });

    // Generate the authorization URL
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });

    // Open the browser automatically
    console.log('Opening browser for authorization...');
    await open(authUrl);

    // Wait for the authorization code
    const code = await authCodePromise;

    // Exchange the code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Store the tokens for future use
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
    console.log('Tokens stored for future use');

    return oauth2Client;
}

function getValues(spreadsheetId, range, callback) {
    try {
      sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: range,
      }).then((response) => {
        const result = response.result;
        const numRows = result.values ? result.values.length : 0;
        console.log(`${numRows} rows retrieved.`);
        if (callback) callback(response);
      });
    } catch (err) {
      document.getElementById('content').innerText = err.message;
      return;
    }
  }

function printResponse(response) {
  console.log('Spreadsheet response:', response);
}

async function main() {
    try {
        const auth = await getAuthClient();
        const sheets = google.sheets({ version: 'v4', auth });
        
        // Test the connection by getting spreadsheet metadata
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: '1dRqe-ez6yNdbSEt7D4d_yBlchfLECgvZX0Z6UBYePJY',
            range: "A1:B6"
        });

        console.log(response.data.values);

        // Try printing response
        
        console.log('Successfully connected to Google Sheets!');
        // console.log('Spreadsheet title:', response.data.properties.title);
        console.log('Spreadsheet title:', metadata.data.properties.title);
        
        // Get all sheets in the spreadsheet
        console.log('\nAvailable sheets:');
    }
    catch(error){
        console.log(error);
    }
}
