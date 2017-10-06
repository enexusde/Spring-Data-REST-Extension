var headerValue = undefined;
chrome.webRequest.onHeadersReceived.addListener(function(details) {
	if (details.statusCode != 200) {
		return;
	}
    if (details.tabId !== -1) {
    	var headers = details.responseHeaders;    	for (var i = 0; i < headers.length; ++i) {
            var header = headers[i];
            if (header.name.toLowerCase() === 'content-type') {
               headerValue = header.value;
            }
        };
       
    }
}, {
    urls: ['*://*/*'],
    types: ['main_frame']
}, ['responseHeaders']);

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab){
	if (headerValue !== undefined) {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {contentType: headerValue});
		});
    }
});
