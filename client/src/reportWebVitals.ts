// import { ReportHandler } from 'web-vitals'; // ReportHandler is likely deprecated or renamed

    // Use a more generic type for the callback as ReportHandler might not exist
    const reportWebVitals = (onPerfEntry?: (metric: any) => void) => {
      if (onPerfEntry && typeof onPerfEntry === 'function') {
        // Import the specific metric functions
        import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
          onCLS(onPerfEntry);
          onFID(onPerfEntry);
          onFCP(onPerfEntry);
          onLCP(onPerfEntry);
          onTTFB(onPerfEntry);
        }).catch(err => {
          console.error("Error loading web-vitals:", err);
        });
      }
    };

    export default reportWebVitals;