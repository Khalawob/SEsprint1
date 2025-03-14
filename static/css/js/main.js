/*
  main.js

  Client-side functionality for the Tag Your Food Item page.
  Provides:
  - Dynamic subcategory loading based on the selected category.
  - Live input validation for the food name field.
  - Optional form submission handling for immediate feedback.
*/

// Function to load subcategories based on the selected category
function loadSubcategories(category) {
    const subcategorySelect = document.getElementById('subcategory');
    
    // Enable the subcategory dropdown and clear its current options
    subcategorySelect.disabled = false;
    subcategorySelect.innerHTML = '';
  
    // Define subcategories for each category.
    // You can later replace this object with an API call if needed.
    const subcategories = {
      fruits: ['Apples', 'Bananas', 'Oranges', 'Grapes'],
      vegetables: ['Carrots', 'Broccoli', 'Spinach', 'Peppers'],
      bakedGoods: ['Bread', 'Pastries', 'Cookies'],
      others: ['Dairy', 'Meat', 'Seafood']
    };
  
    // Retrieve options for the selected category, or use an empty array if none exists
    const options = subcategories[category] || [];
  
    // Add a default option to prompt the user
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select Subcategory';
    subcategorySelect.appendChild(defaultOption);
  
    // Populate the subcategory dropdown with new options
    options.forEach(optionText => {
      const option = document.createElement('option');
      option.value = optionText.toLowerCase();
      option.textContent = optionText;
      subcategorySelect.appendChild(option);
    });
  }
  
  // Ensure the DOM is fully loaded before attaching event listeners
  document.addEventListener('DOMContentLoaded', function() {
    // Live validation for the food name input field
    const foodNameInput = document.getElementById('foodName');
    const foodNameHelp = document.getElementById('foodNameHelp');
  
    if (foodNameInput && foodNameHelp) {
      foodNameInput.addEventListener('input', function() {
        if (foodNameInput.value.trim().length < 3) {
          foodNameHelp.classList.remove('hidden');
        } else {
          foodNameHelp.classList.add('hidden');
        }
      });
    }
  
    // Optional: Form submission handling for final client-side validation
    const tagForm = document.getElementById('tagForm');
    if (tagForm) {
      tagForm.addEventListener('submit', function(event) {
        // Clear any previous notifications
        const successMessage = document.getElementById('successMessage');
        const errorMessage = document.getElementById('errorMessage');
        if (successMessage) successMessage.classList.add('hidden');
        if (errorMessage) errorMessage.classList.add('hidden');
  
        // Validate that the food name is at least 3 characters long
        if (foodNameInput.value.trim().length < 3) {
          event.preventDefault(); // Stop the form submission
          if (errorMessage) {
            errorMessage.textContent = 'Food name must be at least 3 characters.';
            errorMessage.classList.remove('hidden');
          }
        } else {
          // Optionally, you can add further client-side handling here
          // For instance, disable the submit button to prevent multiple submissions
        }
      });
    }
  });
  