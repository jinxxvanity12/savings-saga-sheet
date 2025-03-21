
<?php
/**
 * Plugin Name: Budget Tracker
 * Plugin URI: https://your-site.com/budget-tracker
 * Description: A personal finance management tool for tracking expenses, income, and budget categories.
 * Version: 1.0.0
 * Author: Your Name
 * Text Domain: budget-tracker
 */

// If this file is called directly, abort.
if (!defined('WPINC')) {
    die;
}

/**
 * Register styles and scripts for the Budget Tracker app
 */
function budget_tracker_enqueue_assets() {
    // Get the plugin directory URL
    $plugin_url = plugin_dir_url(__FILE__);
    
    // Enqueue the main CSS file
    wp_enqueue_style(
        'budget-tracker-css',
        $plugin_url . 'dist/assets/index.css',
        array(),
        '1.0.0'
    );
    
    // Enqueue the main JavaScript file
    wp_enqueue_script(
        'budget-tracker-js',
        $plugin_url . 'dist/assets/index.js',
        array(),
        '1.0.0',
        true // Load in footer
    );
}

/**
 * Create a shortcode to embed the Budget Tracker app
 */
function budget_tracker_shortcode($atts) {
    // Parse shortcode attributes
    $attributes = shortcode_atts(array(
        'id' => 'budget-tracker-root',
        'class' => 'budget-tracker-wp-container',
    ), $atts);
    
    // Enqueue the necessary assets
    budget_tracker_enqueue_assets();
    
    // Return the container element where the React app will mount
    return '<div id="' . esc_attr($attributes['id']) . '" class="' . esc_attr($attributes['class']) . '"></div>';
}

// Register the shortcode
add_shortcode('budget_tracker', 'budget_tracker_shortcode');

/**
 * Instructions for how to use the plugin
 */
function budget_tracker_admin_notice() {
    ?>
    <div class="notice notice-info is-dismissible">
        <p><?php _e('Budget Tracker installed! Add it to any page or post using the shortcode: <code>[budget_tracker]</code>', 'budget-tracker'); ?></p>
    </div>
    <?php
}

// Show admin notice upon activation
register_activation_hook(__FILE__, function() {
    add_action('admin_notices', 'budget_tracker_admin_notice');
});
