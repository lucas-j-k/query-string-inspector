/*
*   Script to inject into the web page
*/

import tippy, { inlinePositioning } from 'tippy.js';

let queryStringInspectorActive = false;

// Set global contentScriptLoaded to true the first time it is injected into the page, so we know not to re-inject this script
// Background script checks this value when the browser icon is clicked
window.contentScriptLoaded = true;

    // Initialise tippy to attach tooltips to the links on the page
function activate(){
    const links = document.querySelectorAll('a');
    const iconPath = chrome.runtime.getURL("icons/icon-vector.svg");
    tippy(links, {
        content(link) {
            
            const button = document.createElement('button');
            const icon = document.createElement('img');
            icon.setAttribute('src', iconPath);
            button.appendChild(icon);
            button.addEventListener('click', function(){
                const linkDetails = getLinkDetails(link);
                // Send message to background script, to store link details and trigger new tab
                chrome.runtime.sendMessage({
                    type: 'SET_DATA',
                    payload: linkDetails,
                });
            });
            return button;
        },
        onShow(target){
            target.reference.classList.add("query-string-inspector-active-link");
        },
        onHide(target){
            target.reference.classList.remove("query-string-inspector-active-link");
        },
        allowHTML: true,
        interactive: true,
        duration: 0,
        placement: 'top',
        theme: 'query-string-inspector',
        inlinePositioning: true,
        plugins: [inlinePositioning],
        arrow: false,
        offset: [0, 0],
        appendTo: document.body,
    });
}

// Remove tooltips from the links on page
function deactivate(){
    const links = document.querySelectorAll('a');
    for(const link of links){
        if(link._tippy){
            link._tippy.destroy();
        }
    };
}



/*
    Message Listener
*/
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

    switch(request.type){
        case 'CHECK_CONTENT_SCRIPT':
            // Background is checking if this content script is already present on the page, to prevent re-injecting
            sendResponse({
                contentScriptLoaded: window.contentScriptLoaded,
            });
            break;

        case 'TOGGLE_TOOLTIPS':
            // Background script telling content script to toggle tooltips on/off based on current state
            if(queryStringInspectorActive){
                deactivate();
                sendResponse({
                    type: 'TOGGLE_TOOLTIPS_RESPONSE',
                    active: false,
                });
                queryStringInspectorActive = false;
            } else {
                activate();
                sendResponse({
                    type: 'TOGGLE_TOOLTIPS_RESPONSE',
                    active: true,
                });
                queryStringInspectorActive = true;
            };
            break;
    }
});


/*  Deconstruct a link anchor tag into the properties we want to display
    This is then sent to the background script, to be forwarded to the results page for display

    returns:
    {
        url: "full link url"
        params: {
            queryStringKey: queryStringValue,
        }
    }
*/
function getLinkDetails(linkTag) {

    const linkDetails = {};

    linkDetails['url'] = linkTag.getAttribute('href');
    try {

        const resolvedUrl = linkTag.href;

        const url = new URL(resolvedUrl);

        const queryObj = new URLSearchParams(url.search);

        const queryParams = {};
    
        for(const [key, value] of queryObj){
            queryParams[key] = value;
        }
        linkDetails['params'] = queryParams;
    } catch (e) {
        console.error(e);
    }
   
    return linkDetails;
}



