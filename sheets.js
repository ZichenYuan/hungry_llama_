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

// Function to get values from a specific range
function getValues(sheets, spreadsheetId, range, callback) {
    try {
      sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: range,
      }).then((response) => {
        const result = response.data;
        const numRows = result.values ? result.values.length : 0;
        console.log(`${numRows} rows retrieved.`);
        if (callback) callback(response);
        return response.data;
      });
    } catch (err) {
      console.error('Error getting values:', err);
      return null;
    }
}

// Function to get all data from an entire sheet
async function getEntireSheet(sheets, spreadsheetId, sheetName) {
    try {
        // First get the sheet metadata to understand its dimensions
        const metadataResponse = await sheets.spreadsheets.get({
            spreadsheetId: spreadsheetId
        });
        
        // Find the specific sheet
        const sheet = metadataResponse.data.sheets.find(s => 
            s.properties.title === sheetName);
        
        if (!sheet) {
            console.error(`Sheet "${sheetName}" not found`);
            return null;
        }
        
        // Get sheet dimensions
        const gridProps = sheet.properties.gridProperties;
        const rowCount = gridProps.rowCount;
        const colCount = gridProps.columnCount;
        
        // Request all data in the sheet using A1 notation
        // A1:ZZ1000 is a common pattern to get everything, but better to use actual dimensions
        const range = `${sheetName}!A1:${columnToLetter(colCount)}${rowCount}`;
        
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: range
        });
        
        console.log(`Retrieved entire sheet "${sheetName}": ${response.data.values ? response.data.values.length : 0} rows`);
        return response.data.values;
    } catch (err) {
        console.error('Error retrieving entire sheet:', err);
        return null;
    }
}

// Helper function to convert column number to letter (e.g., 1 -> A, 27 -> AA)
function columnToLetter(column) {
    let letter = '';
    while (column > 0) {
        const remainder = (column - 1) % 26;
        letter = String.fromCharCode(65 + remainder) + letter;
        column = Math.floor((column - 1) / 26);
    }
    return letter;
}

function printResponse(response) {
  console.log('Spreadsheet response:', response);
}

async function main() {
    try {
        const auth = await getAuthClient();
        const sheets = google.sheets({ version: 'v4', auth });
        
        // Get the spreadsheet metadata first
        const metadata = await sheets.spreadsheets.get({
            spreadsheetId: '1dRqe-ez6yNdbSEt7D4d_yBlchfLECgvZX0Z6UBYePJY'
        });
        
        console.log('Successfully connected to Google Sheets!');
        console.log('Spreadsheet title:', metadata.data.properties.title);
        
        // Get list of sheets
        console.log('\nAvailable sheets:');
        metadata.data.sheets.forEach(sheet => {
            console.log(`- ${sheet.properties.title}`);
        });
        
        // Get the entire first sheet
        if (metadata.data.sheets.length > 0) {
            const firstSheetName = metadata.data.sheets[0].properties.title;
            console.log(`\nGetting all data from sheet: ${firstSheetName}`);
            
            const entireSheet = await getEntireSheet(sheets, '1dRqe-ez6yNdbSEt7D4d_yBlchfLECgvZX0Z6UBYePJY', firstSheetName);
            
            if (entireSheet) {
                console.log('\nEntire sheet data:');
                
                // Format the output with column letters
                const formattedData = formatSheetWithColumnLetters(entireSheet);
                console.table(formattedData);
            }
        }
    }
    catch(error){
        console.log(error);
    }
}

// Execute the main function
main();

// Helper function to format sheet data with column letters
function formatSheetWithColumnLetters(sheetData) {
    if (!sheetData || sheetData.length === 0) {
        return [];
    }
    
    // Create an object with column letters as keys
    return sheetData.map((row, rowIndex) => {
        const rowObj = {};
        
        // Add each cell with column letter as key
        row.forEach((cell, colIndex) => {
            rowObj[columnToLetter(colIndex + 1)] = cell;
        });
        
        return rowObj;
    });
}
