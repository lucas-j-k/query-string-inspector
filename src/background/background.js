/*
*   Background Scripts
*/


/*
* State - Store the incoming link details from the content script on-page, so we can pass to the result page once loaded
*/
const state = {
  dataStore: {
    current: null,
  },
}


/*
* Message Listeners
*/

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

  switch(request.type){
    case 'SET_DATA':
      // Content script is sending through data for a clicked link - store in background state, ready to forward to results tab
      state.dataStore.current = request.payload;
      chrome.tabs.create({
        url: '../results/results.html',
        'index': sender.tab.index + 1,
        'openerTabId': sender.tab.id, 
      });
      break;

    case 'GET_DATA':
      // Results page tab is ready, and is requesting the link data - send it in response
      sendResponse({
        payload: state.dataStore.current
      });
      break;
  }

});



/*
* Browser Action Event Handlers
*/

chrome.browserAction.onClicked.addListener(function(currentTab){
  // Check if content has been injected into current tab. I
  // If so, send the toggle tooltips command. If not, inject the script first and then send the tooltip command
  chrome.tabs.sendMessage(currentTab.id, {
    type: 'CHECK_CONTENT_SCRIPT',
  }, function(response) {
        if(!response.contentScriptLoaded){
          chrome.tabs.executeScript(currentTab.id, {
            file: 'content/content.js'
          }, function(){
            triggerToggle(currentTab.id);
          });

        } else {
          triggerToggle(currentTab.id);
        }

    });
  });



/*
* Utilities
*/

// Send a message to content script to toggle the tooltips - update the browser badge to reflect current on/off state
function triggerToggle(tabId){
  chrome.tabs.sendMessage(tabId, {
    type: 'TOGGLE_TOOLTIPS',
  }, function(response) {
    const badgeText = response.active ? 'ON' : '';
    chrome.browserAction.setBadgeText({
        text: badgeText, 
        tabId: tabId,
      });
  })
};
  