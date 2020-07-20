/*
*   Initialisation Content Script, injected at page load
*/

window.contentScriptLoaded = false;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    
    switch(request.type){
        case 'CHECK_CONTENT_SCRIPT':
            sendResponse({
                type: 'CHECK_CONTENT_SCRIPT_RESPONSE',
                contentScriptLoaded: window.contentScriptLoaded || false,
            });
        break;
    }
    
});