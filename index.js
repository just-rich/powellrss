import fetch from 'node-fetch';
import { parseStringPromise } from 'xml2js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// StockTwits API key (access token) and URL from .env
const STOCKTWITS_API_KEY = process.env.STOCKTWITS_API_KEY;
const STOCKTWITS_API_URL = process.env.STOCKTWITS_API_URL;
const RSS_FEED_URL = 'https://www.federalreserve.gov/feeds/s_t_powell.xml';

// Get the directory path of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to store the last GUID
const GUID_FILE_PATH = path.join(__dirname, 'last_posted_guid.json');

// Function to fetch and parse the RSS feed
async function fetchRSSFeed() {
  try {
    const response = await fetch(RSS_FEED_URL);
    const data = await response.text();
    const parsedData = await parseStringPromise(data);
    return parsedData.rss.channel[0].item;
  } catch (error) {
    console.error('Error fetching RSS feed:', error);
    return [];
  }
}

// Function to post to StockTwits
async function postToStockTwits(title, description, link) {
  try {
    const message = `
Jerome #Powell speech today:
Title: ${title}
Description: ${description}
Link: ${link}
Tickers to watch around event: $SPX $SPY $QQQ $DJI`;

    const formData = new URLSearchParams();
    formData.append('body', message);

    const response = await fetch(STOCKTWITS_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `OAuth ${STOCKTWITS_API_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    const data = await response.json();
    console.log('Posted to StockTwits:', data);
  } catch (error) {
    console.error('Error posting to StockTwits:', error);
  }
}

// Function to read the last posted GUID from the JSON file
function readLastPostedGuid() {
  if (fs.existsSync(GUID_FILE_PATH)) {
    const data = fs.readFileSync(GUID_FILE_PATH, 'utf-8');
    const parsedData = JSON.parse(data);
    return parsedData.last_guid;
  }
  return null; // No last posted GUID
}

// Function to save the last posted GUID to the JSON file
function saveLastPostedGuid(guid) {
  const data = JSON.stringify({ last_guid: guid }, null, 2);
  fs.writeFileSync(GUID_FILE_PATH, data);
}

// Function to check for new RSS items and post them
async function checkAndPost() {
  const items = await fetchRSSFeed();
  const lastItem = items[0]; // Get the most recent item

  if (lastItem && lastItem.guid && lastItem.guid[0]) {
    const lastItemGuid = lastItem.guid[0];
    const lastPostedGuid = readLastPostedGuid();

    // If it's a new item (the GUID is different from the last posted one), post it
    if (lastPostedGuid === null) {
      // If no GUID is stored (on first run), save the current GUID
      saveLastPostedGuid(lastItemGuid);
      console.log('First run: Stored the latest GUID, no post made.');
    } else if (lastPostedGuid !== lastItemGuid) {
      await postToStockTwits(lastItem.title[0], lastItem.description[0], lastItem.link[0]);
      saveLastPostedGuid(lastItemGuid); // Update the stored GUID
      console.log('New item posted:', lastItem.title[0]);
    } else {
      console.log('No new items to post.');
    }
  }
}

// Interval to check RSS feed every 5 minutes (300000ms)
setInterval(checkAndPost, 300000);

// Initial check when the script starts (only stores the GUID, no posting)
checkAndPost();