# Swiss Ephemeris API Server

A custom Swiss Ephemeris REST API server built for Google Apps Script integration. Provides planetary positions, house cusps, and chart data with Swiss Ephemeris accuracy.

## 🚀 Quick Deploy to Railway

### Step 1: Create GitHub Repository

1. Go to [https://github.com/new](https://github.com/new)
2. Name it: `swisseph-api`
3. Make it **Public** (required for Railway free tier)
4. Click "Create repository"

### Step 2: Upload Your Code

From your terminal in this directory:

```bash
cd /Users/lisa/swisseph/swisseph-api-server

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Swiss Ephemeris API"

# Add your GitHub repo (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/swisseph-api.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Railway

1. **Go to**: [https://railway.app](https://railway.app)
2. **Sign up** with GitHub (free)
3. **Click**: "New Project"
4. **Select**: "Deploy from GitHub repo"
5. **Choose**: Your `swisseph-api` repository
6. **Railway will automatically**:
   - Detect Node.js
   - Run `npm install`
   - Start the server
   - Give you a public URL

### Step 4: Get Your API URL

1. In Railway, click on your deployment
2. Go to **Settings** tab
3. Click **Generate Domain** under "Networking"
4. Copy your URL: `https://swisseph-api-production.up.railway.app`

**Done!** Your API is live! 🎉

---

## 📡 API Endpoints

### Base URL
```
https://your-app.railway.app
```

### 1. Get Planetary Positions

**Endpoint**: `POST /api/planets`

**Request Body**:
```json
{
  "year": 1967,
  "month": 4,
  "day": 17,
  "hour": 6,
  "min": 40,
  "lat": 40.8928,
  "lon": -73.9734
}
```

**Response**:
```json
{
  "sun": {
    "longitude": 27.123456,
    "full_degree": 27.123456,
    "sign": "Aries",
    "degree": 27.123456,
    "speed": 1.0,
    "isRetro": "false"
  },
  "moon": { ... },
  ...
}
```

### 2. Get House Cusps

**Endpoint**: `POST /api/houses`

**Request Body**:
```json
{
  "year": 1967,
  "month": 4,
  "day": 17,
  "hour": 6,
  "min": 40,
  "lat": 40.8928,
  "lon": -73.9734,
  "house_type": "placidus"
}
```

**House Types**: `placidus`, `whole_sign`, `koch`, `equal`, `campanus`

**Response**:
```json
{
  "ascendant": {
    "longitude": 0.123456,
    "full_degree": 0.123456,
    "sign": "Aries",
    "degree": 0.123456
  },
  "house1": { ... },
  "house2": { ... },
  ...
  "house12": { ... }
}
```

### 3. Get Complete Chart

**Endpoint**: `POST /api/chart`

**Request Body**: Same as `/api/planets`

**Response**:
```json
{
  "planets": { ... },
  "houses": { ... }
}
```

---

## 💰 Costs

**Railway Free Tier**:
- $5 USD free credit every month
- Enough for **500,000+ requests**
- Execution time: 500 hours/month
- **Perfect for personal use!**

**If you exceed free tier**: ~$0.000001 per request

---

## 🧪 Test Your API

Once deployed, test with:

```bash
curl -X POST https://your-app.railway.app/api/planets \
  -H "Content-Type: application/json" \
  -d '{
    "year": 1967,
    "month": 4,
    "day": 17,
    "hour": 6,
    "min": 40,
    "lat": 40.8928,
    "lon": -73.9734
  }'
```

Or visit: `https://your-app.railway.app` in browser to see status.

---

## 🔧 Local Development

```bash
# Install dependencies
npm install

# Start server
npm start

# Server runs at http://localhost:3000
```

---

## 📚 Next Steps

After deployment:
1. Copy your Railway URL
2. Update Google Apps Script files with your URL
3. Test with sample chart
4. Deploy your charts!

---

## 🛟 Troubleshooting

### Build Failed?
- Make sure all files are committed to GitHub
- Check Railway logs for error messages

### Can't access API?
- Make sure you generated a domain in Railway settings
- Check if deployment is "Active"

### Getting errors?
- Test locally first: `npm start`
- Check server logs in Railway dashboard

---

## ✨ Features

- ✅ Swiss Ephemeris accuracy
- ✅ All major planets + asteroids
- ✅ Multiple house systems
- ✅ Fast responses (~50ms)
- ✅ CORS enabled
- ✅ JSON responses
- ✅ Error handling
- ✅ Free hosting

---

## 📝 License

MIT - Use freely for personal or commercial projects
