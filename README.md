# Powell Speeches RSS posts to Stocktwits
A simple script that frequently checks a federalreserve.gov RSS feed specifically for Jerome Powell speeches, 
to post to Stocktwits using an access_token.

## How to run
1. Clone this repo  
2. Run `npm install` to install dependencies  
3. Copy or rename `.env.example` to `.env` and replace `YOUR_ACCESS_TOKEN` with the access token from following 
steps below

## How to get Stocktwits API Key / Access Token
1. Open https://stocktwits.com and log in  
2. Open dev tools (hit F12 key)  
3. Select the 'Application' tab  
4. Under 'Storage' category, expand 'Cookies', & click on `https://stocktwits.com`  
5. Find or search `access_token` & copy the value. This is the key you need for `.env`

---

Check out [@nvstly](https://github.com/nvstly), a free interactive [social investing platform](https://nvstly.com) where 
traders can track, share, or copy trades with extensive insights on every position & in-depth performance stats.
