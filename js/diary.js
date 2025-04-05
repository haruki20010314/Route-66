/**
 * Route 66 Journey - Diary JavaScript
 * Handles diary entries display and management
 */

const Route66Diary = {
  entriesPerPage: 3,
  currentPage: 1,
  
  // Initialize diary functionality
  init: async function() {
    // Wait for Route66 data to be available
    if (!Route66.data) {
      await Route66.loadTravelData(); // データをロード
    }

    const currentPage = Route66.getCurrentPage();

    // Handle different pages
    if (currentPage === 'index.html' || currentPage === '') {
      this.displayDiaryEntries();
      this.setupLoadMoreButton();
    } else if (currentPage === 'add-entry.html') {
      this.setupAddEntryForm();
    }
  },
  
  // Display diary entries on the homepage
  displayDiaryEntries: function() {
    console.log('Diary entries:', Route66.data.entries);
    const diaryContainer = document.getElementById('diary-entries');
    if (!diaryContainer) return;

    // Check if entries exist and are iterable
    if (!Array.isArray(Route66.data.entries)) {
      console.log('Route66.data:', Route66.data);
      console.log('Diary entries:', Route66.data ? Route66.data.entries : 'Route66.data is undefined');
      console.error('Diary entries are not available or not iterable.');
      diaryContainer.innerHTML = '<p class="text-red-500">Failed to load diary entries.</p>';
      return;
    }

    // Clear existing entries
    diaryContainer.innerHTML = '';

    // Render entries
    Route66.data.entries.forEach(entry => {
      const entryElement = document.createElement('div');
      entryElement.className = 'diary-entry';
      entryElement.innerHTML = `
        <h3>${entry.title || 'Untitled'}</h3>
        <p>${entry.date || 'No date available'}</p>
        <p>${entry.content || 'No content available'}</p>
      `;
      diaryContainer.appendChild(entryElement);
    });
  },
  
  // Setup Load More button
  setupLoadMoreButton: function() {
    const loadMoreBtn = document.getElementById('load-more-entries');
    if (!loadMoreBtn) return;
    
    loadMoreBtn.addEventListener('click', () => {
      this.currentPage++;
      this.displayDiaryEntries();
    });
  },
  
  // Setup Add Entry form
  setupAddEntryForm: function() {
    // Populate location select
    this.populateLocationSelect();
    
    // Setup form event listeners
    const form = document.getElementById('new-entry-form');
    if (!form) return;
    
    // Set today's date as default
    const dateInput = document.getElementById('entry-date');
    if (dateInput) {
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];
      dateInput.value = formattedDate;
    }
    
    // Preview button
    const previewBtn = document.getElementById('preview-entry');
    if (previewBtn) {
      previewBtn.addEventListener('click', this.previewEntry.bind(this));
    }
    
    // Close preview button
    const closePreviewBtn = document.getElementById('close-preview');
    if (closePreviewBtn) {
      closePreviewBtn.addEventListener('click', () => {
        document.getElementById('preview-modal').style.display = 'none';
      });
    }
    
    // Confirm save button
    const confirmSaveBtn = document.getElementById('confirm-save');
    if (confirmSaveBtn) {
      confirmSaveBtn.addEventListener('click', () => {
        document.getElementById('preview-modal').style.display = 'none';
        form.dispatchEvent(new Event('submit'));
      });
    }
    
    // Form submission
    form.addEventListener('submit', this.saveEntry.bind(this));
    
    // Add another entry button
    const addAnotherBtn = document.getElementById('add-another');
    if (addAnotherBtn) {
      addAnotherBtn.addEventListener('click', () => {
        document.getElementById('success-message').style.display = 'none';
        form.reset();
        
        // Set today's date again
        if (dateInput) {
          const today = new Date();
          const formattedDate = today.toISOString().split('T')[0];
          dateInput.value = formattedDate;
        }
      });
    }
  },
  
  // Populate location select dropdown
  populateLocationSelect: function() {
    const locationSelect = document.getElementById('location-select');
    if (!locationSelect) return;
    
    // Clear options
    locationSelect.innerHTML = '';
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select a location';
    locationSelect.appendChild(defaultOption);
    
    // Get stops with distances
    const stops = Route66.calculateDistances();
    
    // Add options for each stop
    stops.forEach(stop => {
      const option = document.createElement('option');
      option.value = stop.id;
      option.textContent = `${stop.location}, ${stop.state}`;
      option.dataset.stop = JSON.stringify(stop);
      locationSelect.appendChild(option);
    });
    
    // Handle selection change
    locationSelect.addEventListener('change', () => {
      const selectedOption = locationSelect.options[locationSelect.selectedIndex];
      const locationDetails = document.getElementById('location-details');
      
      if (selectedOption.value) {
        // Parse stop data
        const stop = JSON.parse(selectedOption.dataset.stop);
        
        // Update location details
        document.getElementById('selected-location').textContent = `${stop.location}, ${stop.state}`;
        document.getElementById('selected-date').textContent = Route66.formatDate(stop.date);
        document.getElementById('selected-progress').textContent = `${stop.progressPercentage}% of journey`;
        document.getElementById('selected-distance-from-start').textContent = 
          `${stop.distanceFromStart.toLocaleString()} miles`;
        document.getElementById('selected-distance-to-end').textContent = 
          `${stop.distanceToEnd.toLocaleString()} miles`;
        
        // Show details
        locationDetails.style.display = 'block';
      } else {
        locationDetails.style.display = 'none';
      }
    });
  },
  
  // Preview entry before saving
  previewEntry: function(e) {
    e.preventDefault();
    
    // Get form values
    const title = document.getElementById('entry-title').value;
    const date = document.getElementById('entry-date').value;
    const content = document.getElementById('entry-content').value;
    const tags = document.getElementById('entry-tags').value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag);
    const image = document.getElementById('entry-image').value || 
      'https://images.unsplash.com/photo-1533592584442-d4c03ec1afd9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';
    
    // Get selected location
    const locationSelect = document.getElementById('location-select');
    const selectedOption = locationSelect.options[locationSelect.selectedIndex];
    
    if (!title || !date || !content || !selectedOption.value) {
      alert('Please fill in all required fields and select a location.');
      return;
    }
    
    // Parse stop data
    const stop = JSON.parse(selectedOption.dataset.stop);
    
    // Create preview HTML
    const previewContent = document.getElementById('preview-content');
    previewContent.innerHTML = `
      <div class="mb-6">
        <img src="${image}" alt="${title}" class="w-full h-64 object-cover rounded-lg mb-4">
        <h2 class="text-2xl font-bold mb-2">${title}</h2>
        <p class="text-gray-dark mb-4">
          <i class="ri-map-pin-line mr-1"></i>${stop.location}, ${stop.state} • ${Route66.formatDate(date)}
        </p>
        <div class="whitespace-pre-wrap mb-4">${content.replace(/\n/g, '<br>')}</div>
        <div class="flex flex-wrap gap-2">
          ${tags.map(tag => `<span class="bg-gray-100 text-gray-dark px-2 py-1 rounded-full">${tag}</span>`).join('')}
        </div>
      </div>
    `;
    
    // Show preview modal
    document.getElementById('preview-modal').style.display = 'flex';
  },
  
  // Save entry
  saveEntry: function(e) {
    e.preventDefault();
    
    // Get form values
    const title = document.getElementById('entry-title').value;
    const date = document.getElementById('entry-date').value;
    const content = document.getElementById('entry-content').value;
    const tagsInput = document.getElementById('entry-tags').value;
    const tags = tagsInput 
      ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) 
      : [];
    const image = document.getElementById('entry-image').value || null;
    
    // Get selected location
    const locationSelect = document.getElementById('location-select');
    const selectedOption = locationSelect.options[locationSelect.selectedIndex];
    
    if (!title || !date || !content || !selectedOption.value) {
      alert('Please fill in all required fields and select a location.');
      return;
    }
    
    // Parse stop data
    const stop = JSON.parse(selectedOption.dataset.stop);
    
    // Create entry object
    const entry = {
      title,
      date,
      content,
      tags,
      image,
      location: {
        city: stop.location,
        state: stop.state,
        coordinates: stop.coordinates
      }
    };
    
    // Save entry
    const saved = Route66.saveCustomDiaryEntry(entry);
    
    if (saved) {
      // Show success message
      document.getElementById('success-message').style.display = 'flex';
    } else {
      alert('Failed to save entry. Please try again.');
    }
  }
};

// Initialize diary functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  Route66Diary.init();
});
