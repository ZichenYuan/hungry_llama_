import { google } from 'googleapis';
import http from 'http';
import url from 'url';
import open from 'open';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

async function getAuthClient() {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        'http://localhost:8080'
    );

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

    return oauth2Client;
}

async function main() {
    try {
        const auth = await getAuthClient();
        const sheets = google.sheets({ version: 'v4', auth });
        
        // Test the connection by getting spreadsheet metadata
        const response = await sheets.spreadsheets.get({
            spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        });
        
        console.log('Successfully connected to Google Sheets!');
        console.log('Spreadsheet title:', response.data.properties.title);
        
    } catch (error) {
        console.error('Error:', error);
    }
}

main();
