/**
 * Route 66 Journey - Itinerary JavaScript
 * Handles itinerary display and management
 */

const Route66Itinerary = {
  // Initialize itinerary functionality
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
    
    const currentPage = Route66.getCurrentPage();
    
    // Handle different pages
    if (currentPage === 'index.html' || currentPage === '') {
      this.updateJourneyStatus();
      this.displayHomeItinerary();
    } else if (currentPage === 'itinerary.html') {
      this.updateJourneyStatus();
      this.displayDetailedItinerary();
      this.displayStateBreakdown();
    }
  },
  
  // Update journey status section
  updateJourneyStatus: function() {
    const stops = Route66.calculateDistances();
    const currentStop = Route66.getCurrentStop();

    if (!currentStop) {
      console.error("Current stop not found.");
      return;
    }

    // Get elements
    const journeyProgress = document.getElementById('journey-progress');
    const progressPercentage = document.getElementById('progress-percentage');
    const daysCount = document.getElementById('days-count');
    const locationsCount = document.getElementById('locations-count');
    const milesCount = document.getElementById('miles-count');
    const totalDistance = document.getElementById('total-distance');
    const currentLocation = document.getElementById('current-location');
    const distanceFromStart = document.getElementById('distance-from-start');
    const distanceToEnd = document.getElementById('distance-to-end');
    const statesCount = document.getElementById('states-count');
    const stopsCount = document.getElementById('stops-count');
    
    // Skip if elements don't exist
    if (!journeyProgress && !progressPercentage) return;
    
    // Calculate statistics
    const completedCount = stops.filter(stop => stop.status === 'completed' || stop.status === 'current').length;
    const startDate = new Date(stops[0].date);
    const currentDate = new Date(currentStop.date);
    const daysOnRoad = Math.round((currentDate - startDate) / (1000 * 60 * 60 * 24));
    
    // Get unique states
    const uniqueStates = new Set(stops.map(stop => stop.state));
    
    // Update elements if they exist
    if (journeyProgress) journeyProgress.style.width = `${currentStop.progressPercentage}%`;
    if (progressPercentage) progressPercentage.textContent = `${currentStop.progressPercentage}% Complete`;
    if (daysCount) daysCount.textContent = daysOnRoad;
    if (locationsCount) locationsCount.textContent = completedCount;
    if (milesCount) milesCount.textContent = currentStop.distanceFromStart.toLocaleString();
    if (totalDistance) totalDistance.textContent = currentStop.totalDistance.toLocaleString();
    if (currentLocation) currentLocation.textContent = `${currentStop.location}, ${currentStop.state}`;
    if (distanceFromStart) distanceFromStart.textContent = `${currentStop.distanceFromStart.toLocaleString()} miles from start`;
    if (distanceToEnd) distanceToEnd.textContent = `${currentStop.distanceToEnd.toLocaleString()} miles to end`;
    if (statesCount) statesCount.textContent = uniqueStates.size;
    if (stopsCount) stopsCount.textContent = stops.length;
  },
  
  // Display itinerary on homepage
  displayHomeItinerary: function() {
    const itineraryTable = document.getElementById('itinerary-stops');
    if (!itineraryTable) return;
    
    // Clear table
    itineraryTable.innerHTML = '';
    
    // Get stops and calculate distances
    const stops = Route66.calculateDistances();
    const currentStop = Route66.getCurrentStop();
    
    // Show only 5 stops centered around current stop
    const currentIndex = stops.findIndex(stop => stop.id === currentStop.id);
    const startIndex = Math.max(0, currentIndex - 2);
    const endIndex = Math.min(stops.length, startIndex + 5);
    
    const displayStops = stops.slice(startIndex, endIndex);
    
    // Add rows to table
    displayStops.forEach(stop => {
      const isCurrentStop = stop.id === currentStop.id;
      
      let statusClass = "badge badge-upcoming";
      let statusText = "Upcoming";
      
      if (stop.status === 'current') {
        statusClass = "badge badge-current";
        statusText = "Current";
      } else if (stop.status === 'completed') {
        statusClass = "badge badge-completed";
        statusText = "Completed";
      }
      
      const date = Route66.formatDate(stop.date);
      
      const row = document.createElement('tr');
      row.className = `border-b border-gray hover:bg-gray-100 ${isCurrentStop ? "bg-blue-50" : ""}`;
      row.innerHTML = `
        <td class="py-2 px-3">${date}</td>
        <td class="py-2 px-3">
          <div class="font-semibold">${stop.location}, ${stop.state}</div>
          ${stop.highlights ? `<div class="text-xs text-gray-500 mt-1">${stop.highlights}</div>` : ''}
        </td>
        <td class="py-2 px-3">
          <span class="${statusClass}">
            ${statusText}
          </span>
        </td>
      `;
      
      itineraryTable.appendChild(row);
    });
  },
  
  // Display detailed itinerary on itinerary page
  displayDetailedItinerary: function() {
    const itineraryTable = document.getElementById('detailed-itinerary');
    if (!itineraryTable) return;
    
    // Clear table
    itineraryTable.innerHTML = '';
    
    // Get stops and calculate distances
    const stops = Route66.calculateDistances();
    const currentStop = Route66.getCurrentStop();
    
    // Add rows to table
    stops.forEach((stop, index) => {
      const isCurrentStop = stop.id === currentStop.id;
      
      let statusClass = "badge badge-upcoming";
      let statusText = "Upcoming";
      
      if (stop.status === 'current') {
        statusClass = "badge badge-current";
        statusText = "Current";
      } else if (stop.status === 'completed') {
        statusClass = "badge badge-completed";
        statusText = "Completed";
      }
      
      const date = Route66.formatDate(stop.date);
      
      // Calculate day number
      const startDate = new Date(stops[0].date);
      const stopDate = new Date(stop.date);
      const dayNumber = Math.round((stopDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
      
      const row = document.createElement('tr');
      row.className = `border-b border-gray hover:bg-gray-100 ${isCurrentStop ? "bg-blue-50" : ""}`;
      row.innerHTML = `
        <td class="py-3 px-3">${dayNumber}</td>
        <td class="py-3 px-3">${date}</td>
        <td class="py-3 px-3">
          <div class="font-semibold">${stop.location}, ${stop.state}</div>
        </td>
        <td class="py-3 px-3">
          <div class="flex flex-col text-sm">
            <span>
              <i class="ri-route-line text-primary mr-1"></i>
              ${stop.distanceFromStart.toLocaleString()} mi from start
            </span>
            <span>
              <i class="ri-flag-line text-secondary mr-1"></i>
              ${stop.distanceToEnd.toLocaleString()} mi to end
            </span>
            ${index < stops.length - 1 ? `
              <span>
                <i class="ri-arrow-right-line text-gray-dark mr-1"></i>
                ${stop.distanceToNext.toLocaleString()} mi to next stop
              </span>
            ` : ''}
          </div>
        </td>
        <td class="py-3 px-3">
          ${stop.highlights || ''}
        </td>
        <td class="py-3 px-3">
          <span class="${statusClass}">
            ${statusText}
          </span>
        </td>
      `;
      
      itineraryTable.appendChild(row);
    });
  },
  
  // Display state breakdown on itinerary page
  displayStateBreakdown: function() {
    const stateContainer = document.getElementById('state-breakdown');
    if (!stateContainer) return;
    
    // Clear container
    stateContainer.innerHTML = '';
    
    // Get stops
    const stops = Route66.calculateDistances();
    
    // Group stops by state
    const stateMap = {};
    stops.forEach(stop => {
      if (!stateMap[stop.state]) {
        stateMap[stop.state] = {
          state: stop.state,
          stops: [],
          totalDistance: 0
        };
      }
      
      stateMap[stop.state].stops.push(stop);
      
      // Add distance (only from stops within the state)
      if (stop.distanceToNext) {
        // Check if next stop is in the same state
        const nextStopIndex = stops.findIndex(s => s.id === stop.id) + 1;
        if (nextStopIndex < stops.length && stops[nextStopIndex].state === stop.state) {
          stateMap[stop.state].totalDistance += stop.distanceToNext;
        }
      }
    });
    
    // Convert to array and sort by route order
    const states = Object.values(stateMap).sort((a, b) => {
      const aFirstStop = a.stops[0];
      const bFirstStop = b.stops[0];
      return stops.findIndex(stop => stop.id === aFirstStop.id) - 
             stops.findIndex(stop => stop.id === bFirstStop.id);
    });
    
    // Create state cards
    states.forEach(state => {
      const card = document.createElement('div');
      card.className = 'card';
      
      // Get completion status for this state
      const completedStops = state.stops.filter(stop => stop.status === 'completed').length;
      const currentStops = state.stops.filter(stop => stop.status === 'current').length;
      const totalStops = state.stops.length;
      
      let stateStatus = 'Upcoming';
      let stateStatusClass = 'text-gray-dark';
      
      if (completedStops === totalStops) {
        stateStatus = 'Completed';
        stateStatusClass = 'text-green-600';
      } else if (completedStops > 0 || currentStops > 0) {
        stateStatus = 'In Progress';
        stateStatusClass = 'text-blue-600';
      }
      
      // Calculate completion percentage
      const completionPercentage = Math.round(((completedStops + currentStops) / totalStops) * 100);
      
      card.innerHTML = `
        <div class="p-4">
          <div class="flex justify-between items-center mb-2">
            <h4 class="font-bold text-lg">${this.getStateName(state.state)}</h4>
            <span class="${stateStatusClass} text-sm font-semibold">${stateStatus}</span>
          </div>
          
          <div class="mb-3">
            <div class="flex justify-between text-sm mb-1">
              <span>${completedStops + currentStops}/${totalStops} stops</span>
              <span>${completionPercentage}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-value" style="width: ${completionPercentage}%"></div>
            </div>
          </div>
          
          <div class="text-sm">
            <div><span class="text-gray-dark">Major stops:</span> ${state.stops.map(s => s.location).join(', ')}</div>
            <div><span class="text-gray-dark">Distance in state:</span> ~${state.totalDistance.toLocaleString()} miles</div>
            <div><span class="text-gray-dark">Highlights:</span> ${this.getStateHighlights(state.state, state.stops)}</div>
          </div>
        </div>
      `;
      
      stateContainer.appendChild(card);
    });
  },
  
  // Get full state name from abbreviation
  getStateName: function(abbreviation) {
    const states = {
      'AL': 'Alabama',
      'AK': 'Alaska',
      'AZ': 'Arizona',
      'AR': 'Arkansas',
      'CA': 'California',
      'CO': 'Colorado',
      'CT': 'Connecticut',
      'DE': 'Delaware',
      'FL': 'Florida',
      'GA': 'Georgia',
      'HI': 'Hawaii',
      'ID': 'Idaho',
      'IL': 'Illinois',
      'IN': 'Indiana',
      'IA': 'Iowa',
      'KS': 'Kansas',
      'KY': 'Kentucky',
      'LA': 'Louisiana',
      'ME': 'Maine',
      'MD': 'Maryland',
      'MA': 'Massachusetts',
      'MI': 'Michigan',
      'MN': 'Minnesota',
      'MS': 'Mississippi',
      'MO': 'Missouri',
      'MT': 'Montana',
      'NE': 'Nebraska',
      'NV': 'Nevada',
      'NH': 'New Hampshire',
      'NJ': 'New Jersey',
      'NM': 'New Mexico',
      'NY': 'New York',
      'NC': 'North Carolina',
      'ND': 'North Dakota',
      'OH': 'Ohio',
      'OK': 'Oklahoma',
      'OR': 'Oregon',
      'PA': 'Pennsylvania',
      'RI': 'Rhode Island',
      'SC': 'South Carolina',
      'SD': 'South Dakota',
      'TN': 'Tennessee',
      'TX': 'Texas',
      'UT': 'Utah',
      'VT': 'Vermont',
      'VA': 'Virginia',
      'WA': 'Washington',
      'WV': 'West Virginia',
      'WI': 'Wisconsin',
      'WY': 'Wyoming',
      'DC': 'District of Columbia'
    };
    
    return states[abbreviation] || abbreviation;
  },
  
  // Get highlights for a state based on its stops
  getStateHighlights: function(state, stops) {
    // Route 66 highlights by state
    const stateHighlights = {
      'IL': 'Route 66 Begin Sign, Gemini Giant, Chain of Rocks Bridge',
      'MO': 'Gateway Arch, Ted Drewes Frozen Custard, Meramec Caverns',
      'OK': 'Blue Whale of Catoosa, Round Barn, Oklahoma Route 66 Museum',
      'TX': 'Cadillac Ranch, Big Texan Steak Ranch, U-Drop Inn',
      'NM': 'Blue Swallow Motel, Route 66 Museum, Santa Fe Plaza',
      'AZ': 'Petrified Forest, Wigwam Motel, Grand Canyon',
      'CA': 'Bagdad Café, Roy Motel & Café, Santa Monica Pier End of Route 66 Sign'
    };
    
    // Return state highlights or extract from stops
    return stateHighlights[state] || stops.map(stop => stop.highlights).filter(h => h).join(', ') || 'None listed';
  }
};

// Initialize itinerary functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  Route66Itinerary.init();
});
