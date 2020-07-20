/*
*   Script for the results page
*/

const elements = {
    fullLinkBox: document.querySelector('#full-link-box'),
    resultsTable: document.querySelector('#results-table'),
}

chrome.runtime.sendMessage({
    type: 'GET_DATA',
}, function(response){
    renderResults(response.payload);
});

function renderResults(linkData) {

    // Inject full link into page heading
    elements.fullLinkBox.innerText = linkData.url;

    // Inject result rows into table panel
    for (const key in linkData.params) {
        const row = buildRow(key, linkData.params[key]);
        elements.resultsTable.appendChild(row);
    }
}


function buildRow(key, value) {
    const row = buildCustomElement('div', null, {
        class: 'flex border-t border-ambient py-2'
    });
    const keyCol = buildCustomElement('div', key, {class: 'flex-1 text-primary break-all'});
    const valCol = buildCustomElement('div', value, {class: 'flex-1 break-all'});

    row.appendChild(keyCol);
    row.appendChild(valCol);

    return row
}

function buildCustomElement (tagName, innerText, attributes) {
    
    const el = document.createElement(tagName);
    
    if(innerText) el.innerText = innerText;

    if (attributes) {
        for (const key in attributes) {
            el.setAttribute(key, attributes[key]);
        }
    }
    return el;
}
