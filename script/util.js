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
	notification_item.innerHTML = text;

	notification_item.onclick = () => notification_item.remove();

	//Add count for dublicates
	let notifications = notification_list.querySelectorAll("li");
	for (let i = 0; i < notifications.length; i++) {
		let notification = notifications[i];
		if ( notification.innerHTML === text || text === notification.innerHTML.substr(0, notification.innerHTML.lastIndexOf("("))) {
			let count = notification.innerHTML.match(new RegExp(/.*\(([0-9]+)\)$/));
			if ( count ) {
				count = parseInt(count[1]) + 1;
			} else {
				count = 2;
			}
			notification_item.innerHTML = text + "(" + count.toString() + ")";
			notification.remove();
			break;
		}
	};


	notification_list.append(notification_item);
	if (timeout)
	  setTimeout(() => {if (notification_item) {notification_item.remove()}}, timeout);

}


function doACall(method, params, callback = (a, b) => {}, kwargs = {}) {
	let server = "http://localhost:5279";
	let xhr = new XMLHttpRequest();
	xhr.open("POST", server, true);
	xhr.onreadystatechange = () => {
		if (xhr.readyState === 4 && xhr.status === 200) {
			let response = JSON.parse(xhr.response);
			if (!response.error) {
				callback(JSON.parse(xhr.response), kwargs);
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
		return "channel.html";
	else
		return "video.html";
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

