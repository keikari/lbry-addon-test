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


// Takes  json object as param, will only be stored, other wiser will update the prefrences on lbrynet
//function applyPreferences(_preferences) {
//	let localStorage = window.localStorage;
//	let preferences = _preferences;
//
//	// Get/set preferences 
//	if (preferences) {
//		localStorage.setItem("preferences", JSON.stringify(preferences));
//	} else {
//		preferences = JSON.parse(localStorage.getItem("preferences"));
//		let server = "http://localhost:5279";
//		let xhr = new XMLHttpRequest();
//		xhr.open("POST", server, true);
//		console.log(preferences);
//	}
//
//	// Apply preferences
//	let channel_ids = [];
//	let channels = preferences.result.local.subscriptions;
//	let category_name = "Following";
//	let category_names= JSON.parse(localStorage.getItem("category_names"));
//	let following_filter = {};
//	console.log(channels);
//
//	// Create/update "Following" category if there are any channels in subscriptions
//	if (channels) {
//		channels.forEach( (channel) => {
//			if (channel)
//				channel_ids.push(channel.match(/[^:#]*[:#]?([0-9A-Fa-f]{40})/)[1]);
//		});
//
//		following_filter = {
//			channel_ids: channel_ids,
//			order_by: "release_time",
//			has_source: true
//		};
//
//		// Add "Following" as first category or remove it if there are no follows
//		if (!category_names) {
//			category_names = [category_name];
//		} else if (category_names[0] != category_name) {
//				category_names.splice(0, 0, category_name);
//		}
//	} else if (category_names[0] == category_name) {
//		category_names.splice(0, 1);
//	}
//
//	// Store category_names
//	localStorage.setItem("category_names", JSON.stringify(category_names));
//	localStorage.setItem("category_" + category_name, JSON.stringify(following_filter));
//
//
//}
function timeDifference(current, previous) {
	var secondsPerMinute = 60;

	var secondsPerHour = secondsPerMinute * 60;
	var secondsPerDay = secondsPerHour * 24;
	var secondsPerMonth = secondsPerDay * 30;
	var secondsPerYear = secondsPerDay * 365;

	var elapsed = current - previous;

	if (elapsed < secondsPerMinute) {
		return Math.floor(elapsed) + ' seconds ago';   
	}

	else if (elapsed < secondsPerHour) {
		return Math.floor(elapsed/secondsPerMinute) + ' minutes ago';   
	}

	else if (elapsed < secondsPerDay ) {
		return Math.floor(elapsed/secondsPerHour ) + ' hours ago';   
	}

	else if (elapsed < secondsPerMonth) {
		return Math.floor(elapsed/secondsPerDay) + ' days ago';   
	}

	else if (elapsed < secondsPerYear) {
		return Math.floor(elapsed/secondsPerMonth) + ' months ago';   
	}

	else {
		return Math.floor(elapsed/secondsPerYear ) + ' years ago';   
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

