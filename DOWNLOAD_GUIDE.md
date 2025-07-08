# How to Download Completed Scraping Files

## **File Locations**

### **Automatic Saving Location:**
```
c:\Users\srattana\Documents\alltime\webScrapAgent\jira_request\postcode_mys\forDeploying\data\
```

### **File Naming Convention:**
- **Original file**: `perlis_1.json` (contains URLs to scrape)
- **Completed file**: `perlis_1_details.json` (contains scraped postcode details)

## **Download Methods**

### **Method 1: Web Interface (Recommended)**

1. **Open the Application**: http://localhost:3000
2. **Scroll to "📥 Download Completed Files" section**
3. **Click "⬇️ Download" button** next to any completed file
4. **File downloads automatically** to your browser's download folder

**Features:**
- ✅ Shows file size and creation date
- ✅ Shows number of records scraped
- ✅ One-click download
- ✅ Automatically refreshes after scraping completion

### **Method 2: File Explorer**

1. **Open File Explorer**
2. **Navigate to**: `c:\Users\srattana\Documents\alltime\webScrapAgent\jira_request\postcode_mys\forDeploying\data\`
3. **Look for files ending with**: `_details.json`
4. **Copy or move files** to your desired location

### **Method 3: Direct API Access**

**List completed files:**
```
http://localhost:3000/api/completed-files
```

**Download specific file:**
```
http://localhost:3000/api/download/perlis_1_details.json
```

## **File Content Structure**

Each completed file contains an array of scraped postcode details:

```json
[
  {
    "office": "Pos Malaysia Berhad",
    "url": "https://postcode.my/perlis-kaki-bukit-jalan-padang-besar-batu-16-02200.html",
    "location": "Jalan Padang Besar Batu 16",
    "city": "Kaki Bukit",
    "state": "Perlis",
    "postcode": "02200",
    "gps_lat": "6.123456",
    "gps_lng": "100.123456"
  }
]
```

## **When Files Are Created**

- **During Scraping**: Files are created in the `data/` folder
- **After Completion**: The "📥 Download Completed Files" section automatically refreshes
- **File Updates**: Each scraping session creates a new `_details.json` file

## **File Management Tips**

### **Organize Your Downloads:**
- Create folders for different states/regions
- Rename files with dates if needed
- Keep original and detailed files together

### **Backup Important Data:**
- Copy completed files to a backup location
- The `data/` folder contains both original and scraped data

### **File Sizes:**
- Original files: Usually small (few KB)
- Completed files: Larger (depends on number of records scraped)
- File sizes are shown in the download interface

## **Troubleshooting Downloads**

### **If Download Section Doesn't Show Files:**
1. Click "🔄 Refresh Downloads" button
2. Check if scraping actually completed successfully
3. Verify files exist in the `data/` folder

### **If Download Fails:**
1. Check server is still running
2. Try right-clicking download link → "Save as..."
3. Access files directly through File Explorer

### **File Not Found:**
1. Ensure the scraping session completed successfully
2. Check server console for any errors
3. Verify the `data/` directory has proper permissions

The download feature is now fully integrated into the web interface, making it easy to access your scraped postcode data! 📥
