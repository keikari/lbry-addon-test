var default_not_tags = ["porn","porno","nsfw","mature","xxx","sex","creampie","blowjob","handjob","vagina","boobs","big boobs","big dick","pussy","cumshot","anal","hard fucking","ass","fuck","hentai"];


var server = window.localStorage.getItem("server_url");
var api_port = window.localStorage.getItem("api_port");
var stream_port = window.localStorage.getItem("stream_port");
if (!server) {
	server = "http://localhost";
}
if (!api_port) {
	api_port = "5279";
}
if (!stream_port) {
	stream_port = "5280";
}

function cleanHTML(text) {
	return DOMPurify.sanitize(text, { USE_PROFILES: { html: true } });
}


function sleep(ms) {
	return new Promise( (resolve) => setTimeout(resolve, ms));
}

function itemInArray(item, array) {
	let L = 0;
	let R = array.length - 1;
	while (L <= R) {
		m = Math.floor((L + R) / 2);
		if ( array[m].substr(0, array[m].length - 2) < item )
			L = m + 1;
		else if ( array[m].substr(0, array[m].length - 2) > item )
			R = m - 1;
		else
			return true;
	}
	return false;
}

function addNotification(text, timeout) {
	let notification_list = window.parent.document.querySelector("#notification_list");
	let notification_item = document.createElement("li");
	notification_item.classList.add("notification_item");
	notification_item.innerText = text;

	notification_item.onclick = () => notification_item.remove();

	//Add count for dublicates
	let notifications = notification_list.querySelectorAll("li");
	for (let i = 0; i < notifications.length; i++) {
		let notification = notifications[i];
		if ( notification.innerText === text || text === notification.innerText.substr(0, notification.innerText.lastIndexOf("("))) {
			let count = notification.innerText.match(new RegExp(/.*\(([0-9]+)\)$/));
			if ( count ) {
				count = parseInt(count[1]) + 1;
			} else {
				count = 2;
			}
			notification_item.innerText = text + "(" + count.toString() + ")";
			notification.remove();
			break;
		}
};


	notification_list.append(notification_item);
	if (timeout)
	  setTimeout(() => {if (notification_item) {notification_item.remove()}}, timeout);

}

function resetNotificationsOnclick() {
	let notification_list = window.parent.document.querySelector("#notification_list");
	let notifications = notification_list.querySelectorAll("li");
	notifications.forEach((notification) => {
		notification.onclick = () => notification.remove();
	});


}


function doACall(method, params, callback = (a, b) => {}, kwargs = {}) {
	let server_url = `${server}:${api_port}`;
	let xhr = new XMLHttpRequest();
	xhr.open("POST", `${server_url}?m=${method}`, true);
	xhr.onreadystatechange = () => {
		if (xhr.readyState === 4 && xhr.status === 200) {
			let response = JSON.parse(xhr.response);
			if (!response.error) {
				callback(response, kwargs);
			} else {
				addNotification(response.error.message);
			}
		}
	};
	xhr.send(JSON.stringify({
		method: method,
		params: params
	}));
}

function timeDifference(current, previous) {
	var secondsPerMinute = 60;

	var secondsPerHour = secondsPerMinute * 60;
	var secondsPerDay = secondsPerHour * 24;
	var secondsPerMonth = secondsPerDay * 30;
	var secondsPerYear = secondsPerDay * 365;

	var elapsed = current - previous;
	let timeTerm = "ago";
	if (elapsed < 0) {
		elapsed *= -1;
		timeTerm = "until release";
	}



	if (elapsed < secondsPerMinute) {
		return Math.floor(elapsed) + ` seconds ${timeTerm}`;
	}

	else if (elapsed < secondsPerHour) {
		return Math.floor(elapsed/secondsPerMinute) + ` minutes ${timeTerm}`;
	}

	else if (elapsed < secondsPerDay ) {
		return Math.floor(elapsed/secondsPerHour ) + ` hours ${timeTerm}`;
	}

	else if (elapsed < secondsPerMonth) {
		return Math.floor(elapsed/secondsPerDay) + ` days ${timeTerm}`;
	}

	else if (elapsed < secondsPerYear) {
		return Math.floor(elapsed/secondsPerMonth) + ` months ${timeTerm}`;
	}

	else {
		return Math.floor(elapsed/secondsPerYear ) + ` years ${timeTerm}`;
	}
}


function getClaimTypeFromUrl(lbryUrl) {
	if (lbryUrl.match(new RegExp(".*@.*")) &&
		!lbryUrl.match(new RegExp(".*//.*/.*")))
		return "channel";
	else
		return "stream";
}

function getPageForUrl(lbryUrl) {
	let claim_type = getClaimTypeFromUrl(lbryUrl);
	if (claim_type === "channel") {
		return "channel.html";
	} else {
		return "video.html";
	}
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

