# Route 66 Journey Website

A static website to document a journey along the historic Route 66 from Chicago to Santa Monica. This project is designed to be easily hosted on GitHub Pages without requiring any backend server.

## 📝 Features

- **Interactive Map**: Track journey progress with an integrated Google Maps display
- **Travel Diary**: Record and display travel diary entries
- **Detailed Itinerary**: View a complete itinerary with stops, dates, and distances
- **State-by-State Breakdown**: See information organized by state
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Local Storage**: Save custom diary entries directly in the browser
- **Bilingual Support**: Basic support for English and Japanese based on browser settings

## 🛠️ Technologies Used

- HTML5
- CSS3 with modern features (Grid, Flexbox, Variables, etc.)
- Vanilla JavaScript (ES6+)
- Google Maps JavaScript API
- Remix Icon (for iconography)
- Google Fonts (Inter, Montserrat, Noto Sans JP)

## 📋 Project Structure

```
route66-journey/
├── index.html                  # Homepage with journey status and diary
├── itinerary.html              # Detailed itinerary page
├── add-entry.html              # Form to add new diary entries
├── css/
│   └── styles.css              # Main stylesheet
├── js/
│   ├── main.js                 # Core functionality
│   ├── map.js                  # Google Maps integration
│   ├── diary.js                # Diary entry management
│   └── itinerary.js            # Itinerary display logic
└── data/
    └── travel-data.json        # Journey data in JSON format
```

## 🚀 Setup Instructions

### Local Development

1. Clone this repository or download the files
   ```bash
   git clone https://github.com/yourusername/route66-journey.git
   cd route66-journey
   ```

2. Obtain a Google Maps API Key
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable the "Maps JavaScript API"
   - Create an API key with appropriate restrictions
   - The website will prompt you to enter this key when you first load the map

3. Start a local development server
   - You can use any local server such as VS Code's Live Server extension, Python's SimpleHTTPServer, or Node.js http-server
   - For example, with Python 3:
     ```bash
     python -m http.server
     ```
   - Then open `http://localhost:8000` in your browser

### Deploying to GitHub Pages

1. Create a GitHub repository
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/route66-journey.git
   git push -u origin main
   ```

2. Enable GitHub Pages in repository settings
   - Go to your repository on GitHub
   - Click on "Settings" > "Pages"
   - Select "main" branch as the source
   - Click "Save"
   - Your site will be published at `https://yourusername.github.io/route66-journey/`

3. Google Maps API Key for Production
   - When using the site on GitHub Pages, you'll need to enter your Google Maps API key
   - Make sure to set appropriate HTTP referrer restrictions on your API key for security
   - The key will be stored in the user's browser local storage

## 🔄 Customizing Your Journey

### Modifying Travel Data

To customize the Route 66 journey with your own data:

1. Edit the `data/travel-data.json` file
   - Update the `stops` array with your planned or actual locations
   - Modify the `entries` array with your own diary entries

2. The data structure follows this format:
   ```javascript
   {
     "stops": [
       {
         "id": 1,
         "date": "YYYY-MM-DD",
         "location": "City Name",
         "state": "ST",
         "coordinates": { "lat": 12.3456, "lng": -12.3456 },
         "distanceToNext": 100,
         "highlights": "Description of highlights",
         "status": "completed" // or "current" or "upcoming"
       },
       // more stops...
     ],
     "entries": [
       {
         "id": 1,
         "title": "Entry Title",
         "date": "YYYY-MM-DD",
         "content": "Your diary entry text...",
         "location": {
           "city": "City Name",
           "state": "ST",
           "coordinates": { "lat": 12.3456, "lng": -12.3456 }
         },
         "tags": ["tag1", "tag2"],
         "image": "https://example.com/image.jpg"
       },
       // more entries...
     ]
   }
   ```

### Adding New Entries

You can also add new diary entries directly through the website:

1. Click on "Add Entry" in the navigation menu
2. Select a location from your itinerary stops
3. Fill in the entry details including title, date, content, tags, and an image URL
4. Preview and save your entry

These entries will be stored in your browser's local storage and displayed alongside the predefined entries.

## 📱 Using on Mobile Devices

The website is fully responsive and works well on mobile devices. When viewing on smaller screens:

- The two-column layout transforms into a vertical layout
- Map height adjusts for better viewing
- Touch-friendly controls for adding entries

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🌟 Credits

- Map integration: Google Maps JavaScript API
- Icons: [Remix Icon](https://remixicon.com/)
- Fonts: [Google Fonts](https://fonts.google.com/)
- Sample images: [Unsplash](https://unsplash.com/)

---

Made with ❤️ for Route 66 enthusiasts
