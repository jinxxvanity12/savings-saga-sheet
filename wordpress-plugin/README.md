
# Budget Tracker WordPress Plugin

## Installation

1. Build the React application:
   ```
   npm run build
   ```

2. Copy the entire `dist` folder into the `wordpress-plugin` directory.

3. Zip the `wordpress-plugin` directory (now containing the plugin file and the `dist` folder).

4. Upload the zip file to your WordPress site via Plugins > Add New > Upload Plugin.

5. Activate the plugin in your WordPress admin panel.

## Usage

Add the Budget Tracker to any page or post using the shortcode:

```
[budget_tracker]
```

You can customize the container ID and class:

```
[budget_tracker id="custom-id" class="custom-class"]
```

## Troubleshooting

- If the app doesn't appear, check your browser console for errors.
- Make sure the paths to the JS and CSS files in the plugin are correct.
- The app requires a modern browser with JavaScript enabled.

## Customization

To customize the appearance or functionality:
1. Modify the source code
2. Rebuild with `npm run build`
3. Replace the `dist` folder in the plugin directory
4. Reupload the plugin or replace the files on your server
