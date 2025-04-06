# BMS Digital Signage - Mi TV Stick Web Implementation Guide

This document provides specific guidance for implementing the BMS Digital Signage System as a web application for Mi TV Stick devices.

## Web-Based Implementation for Mi TV Stick

### Why Web-Based is Ideal

The BMS Digital Signage System will be implemented as a web application for Mi TV Stick devices for these key reasons:

1. **Simplicity of Deployment**: Access immediately via URL without installation
2. **Centralized Updates**: All displays update simultaneously when the web server is updated
3. **Easy Management**: Single codebase for both display and admin interfaces
4. **Direct Control**: Changes pushed instantly to all store displays
5. **Storage Efficiency**: No space consumed on the Mi TV Stick device
6. **Flexible Access**: Can be accessed from any browser if needed

## Mi TV Stick Browser Setup

### Initial Device Configuration

1. Connect the Mi TV Stick to the TV's HDMI port
2. Power on and connect to the store's WiFi network
3. Open the pre-installed browser app (or install Google Chrome)
4. Navigate to your BMS Digital Signage URL
5. Bookmark the URL for easy access

### Browser Configuration

For optimal performance on Mi TV Stick browsers:

1. **Enable JavaScript**: Ensure JavaScript is enabled in browser settings
2. **Clear Cache**: Periodically clear browser cache to prevent memory issues
3. **Disable Screensaver**: Configure TV settings to prevent screen timeout
4. **Disable Browser Navigation**: Hide or disable address bar and navigation when possible

## Web App Optimization for TV Display

### TV-Specific CSS
Styles to improve readability and layout on large screens (like increased font sizes) are included in `client/src/index.css` within a `@media screen and (min-width: 1280px)` block. Key classes targeted include `.product-name` and `.product-price`.

### Fullscreen Mode
The `SlideShow.tsx` component includes a `toggleFullscreen` function triggered by pressing the 'f' key or clicking the fullscreen button (which appears on mouse movement). Most browsers require user interaction to enter fullscreen mode initially.

### Remote Control / Keyboard Navigation
The `SlideShow.tsx` component listens for keyboard events:
-   `ArrowRight`: Advances to the next slide.
-   `ArrowLeft`: Goes to the previous slide.
-   `f` or `F`: Toggles fullscreen mode.
Standard TV remotes often send these arrow key codes.

## Performance Optimization

### Memory Management
To prevent potential browser memory issues during long-running display sessions, the main `Display.tsx` component includes logic to automatically refresh the page every 4 hours.

### Image Optimization
Images are loaded via the `ProductImage.tsx` component, which constructs the full Supabase URL. Ensure images uploaded to Supabase are reasonably sized for web display (e.g., not excessively large dimensions or file sizes). Supabase storage can optionally perform image transformations (resizing, quality adjustments) via URL parameters if further optimization is needed, but this is not currently implemented in the `ProductImage` component.

### Animation Handling
Slide transitions and component animations are managed using the `framer-motion` library. Animations are generally kept simple (e.g., fades) to ensure smooth performance on less powerful devices like the Mi TV Stick.

## Admin Access from Store

To allow store staff to access admin while maintaining display for customers:

1. **Hidden Admin Button**: Show admin button only on cursor movement
2. **Secure Login**: Require password for admin access
3. **Quick Return**: Add prominent "Return to Display" button in admin interface

## Daily Operations Guide

### Starting the Display Each Day

1. Turn on the TV and ensure Mi TV Stick is powered
2. Select the Mi TV Stick input on TV
3. Open the browser (Chrome recommended)
4. Navigate to bookmarked BMS Digital Signage URL
5. Click "Start Presentation" to enter fullscreen mode

### Admin Tasks for Store Staff

1. Move cursor to reveal admin button
2. Click admin button and enter credentials
3. Make necessary updates to products or announcements
4. Preview changes in display mode
5. Click "Return to Display" and enter fullscreen mode

## Troubleshooting Common Issues

### Display Freezes or Slows Down
- Refresh the browser page
- Clear browser cache through settings
- Restart the Mi TV Stick (unplug power, wait 10 seconds, reconnect)

### Content Not Updating
- Check internet connection
- Verify admin changes were published
- Manually refresh the browser

### Fullscreen Mode Not Working
- Ensure browser has permission to enter fullscreen
- Try using the fullscreen button rather than auto-fullscreen
- Check if TV's aspect ratio settings are affecting display

## Backup Display Option

For cases where the browser becomes unresponsive:

1. Keep a backup URL written down near the TV
2. Bookmark a simple static version of the display as fallback
3. Consider setting up a second Mi TV Stick pre-configured as backup
