
/**
 * PHP Deployment Script for Budget Tracker
 * 
 * This script helps prepare the build for PHP integration
 * Run with: node php-deploy.js
 */

const fs = require('fs');
const path = require('path');

// Create PHP integration instructions file
const instructions = `
# PHP Integration Guide for Budget Tracker

## Option 1: Using the provided PHP wrapper

1. Copy the 'dist' folder to your PHP project
2. Include the php-wrapper.php file in your PHP application:
   \`\`\`php
   include('path/to/php-wrapper.php');
   \`\`\`
3. Call the function where you want to render the app:
   \`\`\`php
   budget_tracker_app([
     'assets_path' => '/path/to/dist' // Update this path
   ]);
   \`\`\`

## Option 2: Manual integration

1. Add this HTML where you want the app to appear:
   \`\`\`html
   <div id="budget-tracker-root" class="budget-tracker-wp-container"></div>
   <script src="/path/to/dist/index.js" defer></script>
   <link rel="stylesheet" href="/path/to/dist/index.css">
   \`\`\`

## Important Notes

- The app uses local storage for data persistence
- Make sure the assets paths are correct
- Use relative or absolute paths based on your PHP application structure
`;

// Write the instructions file
try {
  if (!fs.existsSync('php-integration')) {
    fs.mkdirSync('php-integration');
  }
  fs.writeFileSync('php-integration/README.md', instructions);
  console.log('PHP integration guide created successfully.');
} catch (err) {
  console.error('Error creating PHP integration guide:', err);
}

// Create example PHP file
const examplePhp = `<?php
// Example usage of Budget Tracker in a PHP application
$page_title = "Budget Tracker";
include('header.php'); // Your site header

// Include the Budget Tracker wrapper
include('path/to/php-wrapper.php');

// Render the Budget Tracker app
?>
<div class="my-php-container">
  <h1>My Budget Tracker</h1>
  <?php budget_tracker_app([
    'assets_path' => '/assets/budget-tracker'
  ]); ?>
</div>
<?php
include('footer.php'); // Your site footer
?>`;

try {
  fs.writeFileSync('php-integration/example.php', examplePhp);
  console.log('PHP example file created successfully.');
} catch (err) {
  console.error('Error creating PHP example file:', err);
}

console.log('PHP deployment preparation complete!');
