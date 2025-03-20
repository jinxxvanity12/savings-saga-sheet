
<?php
/**
 * Budget Tracker PHP Integration
 * 
 * This file allows you to embed the Budget Tracker React app into PHP websites.
 * 
 * Usage:
 * 1. Include this file in your PHP application: include('path/to/php-wrapper.php');
 * 2. Call the function anywhere you want to render the app: budget_tracker_app();
 */

function budget_tracker_app($config = []) {
    $default_config = [
        'container_id' => 'budget-tracker-root',
        'container_class' => 'budget-tracker-wp-container',
        'assets_path' => './assets', // Path to your built React app assets
    ];
    
    $config = array_merge($default_config, $config);
    
    // Create container with the right ID for the React app to mount to
    echo '<div id="' . $config['container_id'] . '" class="' . $config['container_class'] . '"></div>' . PHP_EOL;
    
    // Include the built JavaScript and CSS
    echo '<script src="' . $config['assets_path'] . '/index.js" defer></script>' . PHP_EOL;
    echo '<link rel="stylesheet" href="' . $config['assets_path'] . '/index.css">' . PHP_EOL;
    
    // Add initialization script
    echo '<script>
        document.addEventListener("DOMContentLoaded", function() {
            console.log("Budget Tracker initialized in PHP environment");
        });
    </script>' . PHP_EOL;
}
?>
