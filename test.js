function isValidUrlChar(c) {
	switch (c) {
		case '?':
		case '&':
		case ';':
			return false;
	}
	return true;
}

function hexStrToAsciiStr(str) {
	let tempStr = str.toString();
	let asciiStr = "";
	for (let i = 0; i < tempStr.length; i++) {
		if (tempStr[i] == '%') {
			let char = String.fromCharCode(parseInt(tempStr.substr(++i, 2), 16));
			if (!isValidUrlChar(char))
				break;
			asciiStr += char;
			i++; //No reasong to check following char 
		}
		else if (isValidUrlChar(tempStr[i])) {
			asciiStr += tempStr[i];
		}
		else {
			break;
		}
	}
	return asciiStr;

}


function tryToGetLbryUrl(url) {
	let lbryUrl = url.match(/lbry.*/);
	return hexStrToAsciiStr(lbryUrl);

}

function doCall(server, url, callback) {
		var xhr = new XMLHttpRequest();
		xhr.open("POST", server, true);
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.setRequestHeader('Data-Type', 'json');
		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4 && xhr.status === 200) {
				callback(xhr.response);
			}
		};
		xhr.send(JSON.stringify({
		method: "resolve",
		params: {
			"urls": url}
	}));

}

var tabIds = [];
function doLBRY(tabId, changeInfo, tab) {
	if (tab.url.match(new RegExp("^lbry.*")) ||
		(changeInfo.url && changeInfo.url.match(new RegExp("^(?!https://odysee.com)+.*lbry%3A%2F%2F.*")))) {
		// This prevents somekind of looping(I think)
		if (!tabIds.includes(tabId)) {
			tabIds.push(tabId);
			setTimeout(() => {tabIds.splice(tabIds.indexOf(tabId), 1)}, 2000);
			let url = tryToGetLbryUrl(decodeURIComponent(tab.url));
			let page = "main.html";
			browser.tabs.update(tabId, {
				url: page+"?url="+url,
			});
		}
	}
}

browser.browserAction.onClicked.addListener(() => {browser.tabs.create({ url: "lbry://"})});

browser.tabs.onUpdated.addListener(doLBRY);

