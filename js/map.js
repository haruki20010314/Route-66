/**
 * Route 66 Journey - Map JavaScript
 * Handles Google Maps integration and display
 */

const Route66Map = {
  map: null,
  markers: [],
  routePath: null,
  
  // Initialize the map functionality
  init: async function() {
    // Wait for Route66 data to be available
    if (!Route66.data) {
      await new Promise(resolve => {
        const checkData = setInterval(() => {
          if (Route66.data) {
            clearInterval(checkData);
            resolve();
          }
        }, 100);
      });
    }
    
    // Try to load the map
    this.loadGoogleMapsScript();
  },
  
  // Load Google Maps script
  loadGoogleMapsScript: function() {
    const apiKey = Route66.getGoogleMapsApiKey();
    
    // If no API key, update placeholder text
    if (!apiKey) {
      const placeholder = document.getElementById('map-placeholder');
      if (placeholder) {
        placeholder.innerHTML = `
          <div class="text-center p-4">
            <i class="ri-map-pin-line text-primary text-3xl mb-2"></i>
            <p class="font-semibold mb-2">Google Maps API Key Required</p>
            <p class="text-sm mb-4">Click the settings icon in the top right corner of this card to set your API key.</p>
            <button id="show-map-settings" class="text-primary font-semibold">
              <i class="ri-settings-3-line mr-1"></i> Configure API Key
            </button>
          </div>
        `;
        
        // Add click handler for the configure button
        const showSettingsBtn = document.getElementById('show-map-settings');
        if (showSettingsBtn) {
          showSettingsBtn.addEventListener('click', () => {
            const settingsPanel = document.getElementById('map-settings');
            settingsPanel.style.display = 'block';
          });
        }
      }
      return;
    }
    
    // Create and append the script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=Route66Map.initMap`;
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  },
  
  // Initialize Google Maps (callback for Google Maps API)
  initMap: function() {
    // Get map container
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;
    
    // Clear any existing content
    mapContainer.innerHTML = '';
    
    // Get stops and calculate distances
    const stops = Route66.calculateDistances();
    const currentStop = Route66.getCurrentStop();
    
    // Create the map
    this.map = new google.maps.Map(mapContainer, {
      zoom: 5,
      center: currentStop.coordinates,
      mapTypeId: 'roadmap'
    });
    
    // Create Route66 path
    const route66Path = stops.map(stop => stop.coordinates);
    this.routePath = new google.maps.Polyline({
      path: route66Path,
      geodesic: true,
      strokeColor: '#E76F51',
      strokeOpacity: 1.0,
      strokeWeight: 3
    });
    
    this.routePath.setMap(this.map);
    
    // Add markers for each stop
    this.addMarkers(stops);
  },
  
  // Add markers to the map
  addMarkers: function(stops) {
    if (!this.map) return;
    
    // Clear existing markers
    this.markers.forEach(marker => marker.setMap(null));
    this.markers = [];
    
    // Add markers for each stop
    stops.forEach(stop => {
      let markerIcon = {
        url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
      };
      
      // Change marker color based on status
      if (stop.status === 'current') {
        markerIcon.url = 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png';
      } else if (stop.status === 'completed') {
        markerIcon.url = 'https://maps.google.com/mapfiles/ms/icons/green-dot.png';
      }
      
      // Create marker
      const marker = new google.maps.Marker({
        position: stop.coordinates,
        map: this.map,
        title: `${stop.location}, ${stop.state}`,
        icon: markerIcon
      });
      
      // Add info window
      const infowindow = new google.maps.InfoWindow({
        content: `
          <div style="min-width: 200px;">
            <h3 style="margin-bottom: 5px; font-weight: bold;">${stop.location}, ${stop.state}</h3>
            <p style="margin-bottom: 5px;">${Route66.formatDate(stop.date)}</p>
            ${stop.highlights ? `<p style="margin-bottom: 5px;">${stop.highlights}</p>` : ''}
            <p style="margin-bottom: 5px;">
              <span style="font-weight: bold;">${stop.distanceFromStart.toLocaleString()}</span> miles from Chicago<br>
              <span style="font-weight: bold;">${stop.distanceToEnd.toLocaleString()}</span> miles to Santa Monica
            </p>
          </div>
        `
      });
      
      // Add click listener
      marker.addListener('click', function() {
        infowindow.open(this.map, marker);
      });
      
      // Store marker
      this.markers.push(marker);
    });
  }
};

// Initialize the map when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  Route66Map.init();
});
