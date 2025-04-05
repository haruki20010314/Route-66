/**
 * Route 66 Journey - Main JavaScript
 * Core functionality and data management for the Route 66 Journey website
 */

// Global data store
const Route66 = {
  data: null,
  localStorageKeys: {
    apiKey: 'route66_google_maps_api_key',
    diaryEntries: 'route66_diary_entries',
    currentPage: 'route66_current_page'
  },
  // Initialize the application
  init: async function() {
    // サンプルデータを設定
    this.data = {
      stops: [
        { id: 1, location: "Chicago", state: "IL", date: "2025-03-01", status: "completed", distanceFromStart: 0, distanceToEnd: 2448 },
        { id: 2, location: "St. Louis", state: "MO", date: "2025-03-03", status: "completed", distanceFromStart: 300, distanceToEnd: 2148 },
        { id: 3, location: "Amarillo", state: "TX", date: "2025-03-10", status: "current", distanceFromStart: 800, distanceToEnd: 1648 },
        { id: 4, location: "Santa Monica", state: "CA", date: "2025-03-20", status: "upcoming", distanceFromStart: 2448, distanceToEnd: 0 },
      ],
    };
    try {
      // Load travel data
      await this.loadTravelData();
      // Set current page
      const path = window.location.pathname;
      this.setCurrentPage(path.substring(path.lastIndexOf('/') + 1));
      
      // Initialize page-specific functionality
      this.initPageSpecific();
      
      // Handle API key toggle
      const toggleBtn = document.getElementById('toggle-map-settings');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
          const settingsPanel = document.getElementById('map-settings');
          settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
        });
      }
    } catch (error) {
      console.error('Initialization error:', error);
      this.showError('Failed to initialize the application. Please try reloading the page.');
    }
  },
  // Load travel data from JSON file
  loadTravelData: async function() {
    try {
      const response = await fetch('data/travel-data.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.data = await response.json();
      // Load any custom diary entries from local storage
      this.loadCustomDiaryEntries();
      return this.data;
    } catch (error) {
      console.error('Error loading travel data:', error);
      this.showError('Failed to load travel data. Please check your internet connection and try again.');
      throw error;
    }
  },
  // Load custom diary entries from local storage
  loadCustomDiaryEntries: function() {
    try {
      const storedEntries = localStorage.getItem(this.localStorageKeys.diaryEntries);
      if (storedEntries) {
        const customEntries = JSON.parse(storedEntries);
        // Add custom entries to the data
        if (customEntries && customEntries.length > 0) {
          this.data.entries = [...this.data.entries, ...customEntries];
          // Sort entries by date (newest first)
          this.data.entries.sort((a, b) => new Date(b.date) - new Date(a.date));
        }
      }
    } catch (error) {
      console.error('Error loading custom diary entries:', error);
    }
  },
  // Save custom diary entry to local storage
  saveCustomDiaryEntry: function(entry) {
    try {
      // Generate a unique ID
      entry.id = Date.now();
      // Get existing entries
      const storedEntries = localStorage.getItem(this.localStorageKeys.diaryEntries);
      let customEntries = storedEntries ? JSON.parse(storedEntries) : [];
        
      // Add new entry
      customEntries.push(entry);
      // Save back to local storage
      localStorage.setItem(this.localStorageKeys.diaryEntries, JSON.stringify(customEntries));
      // Update in-memory data
      this.data.entries.push(entry);
      // Sort entries by date (newest first)
      this.data.entries.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      return true;
    } catch (error) {
      console.error('Error saving custom diary entry:', error);
      return false;
    }
  },
  // Get Google Maps API key from local storage
  getGoogleMapsApiKey: function() {
    return localStorage.getItem(this.localStorageKeys.apiKey);
  },
  // Save Google Maps API key to local storage
  saveGoogleMapsApiKey: function(apiKey) {
    localStorage.setItem(this.localStorageKeys.apiKey, apiKey);
    return true;
  },
  // Set current page in local storage
  setCurrentPage: function(page) {
    localStorage.setItem(this.localStorageKeys.currentPage, page);
    return true;
  },
  // Get current page from local storage
  getCurrentPage: function() {
    return localStorage.getItem(this.localStorageKeys.currentPage) || 'index.html';
  },
  // Format date for display
  formatDate: function(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  },
  // Find current stop based on status
  getCurrentStop: function() {
    return this.data.stops.find(stop => stop.status === "current") || this.data.stops[0];
  },
  // Calculate distance and progress information for all stops
  calculateDistances: function() {
    return this.data.stops.map((stop, index) => {
      const nextStop = this.data.stops[index + 1];
      return {
        ...stop,
        distanceToNext: nextStop ? nextStop.distanceFromStart - stop.distanceFromStart : 0,
      };
    });
  },
  // Show error message
  showError: function(message) {
    // You could implement a more sophisticated error display here
    alert(message);
  },
  // Initialize page-specific functionality based on current page
  initPageSpecific: function() {
    const currentPage = this.getCurrentPage();
    // Common elements across pages
    const apiKeyInput = document.getElementById('api-key-input');
    const saveApiKeyBtn = document.getElementById('save-api-key');
    if (apiKeyInput && saveApiKeyBtn) {
      // Set saved API key if it exists
      const savedApiKey = this.getGoogleMapsApiKey();
      if (savedApiKey) {
        apiKeyInput.value = savedApiKey;
      }
      // API key save button handler
      saveApiKeyBtn.addEventListener('click', () => {
        const apiKey = apiKeyInput.value.trim();
        if (apiKey) {
          this.saveGoogleMapsApiKey(apiKey);
          document.getElementById('map-settings').style.display = 'none';
          
          // Reload the page to reinitialize the map
          window.location.reload();
        } else {
          alert('Please enter a valid API key.');
        }
      });
    }
    
    // Add more page specific initialization here if needed
  }
};

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  Route66.init();
});

document.addEventListener("DOMContentLoaded", () => {
  // サンプルデータ
  const journeyData = {
    daysOnRoad: 15,
    locationsVisited: 10,
    milesTraveled: 1200,
    currentLocation: "Amarillo, TX",
    distanceFromStart: 800,
    distanceToEnd: 400,
    progressPercentage: 67,
  };

  // HTML要素にデータを反映
  document.getElementById("days-count").textContent = journeyData.daysOnRoad;
  document.getElementById("locations-count").textContent = journeyData.locationsVisited;
  document.getElementById("miles-count").textContent = journeyData.milesTraveled;
  document.getElementById("current-location").textContent = journeyData.currentLocation;
  document.getElementById("distance-from-start").textContent = `${journeyData.distanceFromStart} miles from start`;
  document.getElementById("distance-to-end").textContent = `${journeyData.distanceToEnd} miles to end`;
  document.getElementById("progress-percentage").textContent = `${journeyData.progressPercentage}% Complete`;

  // プログレスバーの幅を更新
  document.getElementById("journey-progress").style.width = `${journeyData.progressPercentage}%`;
});