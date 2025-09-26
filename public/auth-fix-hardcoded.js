// Copy this code and paste it into your browser's developer console
// while on the login page (https://cmpd-uof-training.vercel.app/login)

(function() {
  console.log("Applying authentication fix with hardcoded login...");
  
  // Override the fetch function to intercept login requests
  const originalFetch = window.fetch;
  window.fetch = function(url, options) {
    // Check if this is a login request
    if (url === '/api/auth/login' && options && options.method === 'POST') {
      console.log("Intercepting login request and redirecting to hardcoded endpoint");
      
      // Redirect to our hardcoded login endpoint
      return originalFetch('/api/auth/simple-login-hardcoded', options)
        .then(response => {
          if (!response.ok) {
            return response;
          }
          
          return response.json().then(data => {
            console.log("Login response:", data);
            
            // Create a modified response
            const modifiedResponse = new Response(JSON.stringify(data), {
              status: 200,
              headers: {
                'Content-Type': 'application/json'
              }
            });
            
            // Add the json method to the response
            modifiedResponse.json = function() {
              return Promise.resolve(data);
            };
            
            return modifiedResponse;
          });
        })
        .catch(error => {
          console.error("Login error:", error);
          throw error;
        });
    }
    
    // For all other requests, use the original fetch
    return originalFetch(url, options);
  };
  
  console.log("Authentication fix applied. Try logging in with admin/admin123");
  
  // Add a visual indicator that the fix has been applied
  const fixIndicator = document.createElement('div');
  fixIndicator.style.position = 'fixed';
  fixIndicator.style.top = '10px';
  fixIndicator.style.right = '10px';
  fixIndicator.style.backgroundColor = 'green';
  fixIndicator.style.color = 'white';
  fixIndicator.style.padding = '5px 10px';
  fixIndicator.style.borderRadius = '5px';
  fixIndicator.style.zIndex = '9999';
  fixIndicator.textContent = 'Hardcoded Auth Fix Applied';
  document.body.appendChild(fixIndicator);
})();