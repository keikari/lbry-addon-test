var lbryUrl = document.URL.match(new RegExp(/lbry:\/\/.*/))[0];
lbryUrl = decodeURIComponent(lbryUrl);
var iframe;
var floating_player;
var localStorage = window.localStorage;

class FloatingPlayer {
	constructor() {
		this.video_element = document.querySelector("#floating_player");
		this.sd_hash = null;
		this.video_duration = 0;
		this.start_timestamp = 0;
		this.video_element.onloadeddata = () =>  {this.doOnLoadedData()};

		this.time_tracker_interval_id = null;
	}

	doOnLoadedData() {
		console.log("Floating player loaded");
		this.video_element.currentTime = this.start_timestamp;
		this.updateDuration();
		this.startSavingTimestamp();
	}

	close() {
		this.stopSavingTimestamp();
		this.video_element.pause();
		this.video_element.style.height = 0;
		this.video_element.hidden = true;
	}

	show() {
		this.updateSource();
		this.video_element.play();
		this.video_element.controls = true;
		this.video_element.style = "";
		this.video_element.hidden = false;
	}

	updateSource() {
		this.video_element.src = `${server}:${stream_port}/stream/${this.sd_hash}`;
	}

	updateDuration() {
		this.video_duration = this.video_element.duration;
	}

	startSavingTimestamp() {
		if (this.getDuration() > 300) {
			this.time_tracker_interval_id = setInterval(() => {
				let currentTime = this.getCurrentTime();
				if (currentTime <= (this.video_duration * 0.9))
					localStorage.setItem(this.sd_hash, currentTime);
				else
					localStorage.removeItem(this.sd_hash);
			}, 1000 * 1);
		}
	}

	stopSavingTimestamp() {
		clearInterval(this.time_tracker_interval_id);
	}

	hasSource() {
		return this.video_element.src != "";
	}

	getCurrentTime() {
		return this.video_element.currentTime;
	}

	getDuration() {
		return this.video_duration;
	}


	getSd_hash() {
		return this.sd_hash;
	}

	setStartTime(time) {
		this.start_timestamp = time;
	}
	setSd_hash(sd_hash) {
		console.log("Sd_hash set");
		this.sd_hash = sd_hash;
	}

};


function createCategoryItem(name) {
	let category_list_item = document.createElement("p");
	category_list_item.id = "category_list_item";
	category_list_item.innerText = name;
	if (name == "Manage Categories") {
		category_list_item.onclick = () => { 
			localStorage.removeItem("category__temp_");
			iframe.src = "manage_categories.html"
		};
	} else {
		category_list_item.onclick = () => { iframe.src = "category.html?category_name="+name  };
	}
	return category_list_item;
}

function listCategories() {
	let side_bar_div = document.querySelector("#side_bar");
	side_bar_div.innerText = "";
	let category_names = ["Following"];
	category_names = category_names.concat(JSON.parse(localStorage.getItem("category_names")));
	console.log(category_names);

	let items = [];
	if (category_names) {
		category_names.forEach((category_name) => {
			if (category_name !== "_temp_")
				items.push(createCategoryItem(category_name));
		});
	}
	items.push(createCategoryItem("Manage Categories"));

	items.forEach( (item) => {side_bar_div.append(item)} );

	// Toggle sidebar
	let side_bar_toggle_btn = document.querySelector("#toggle_side_bar_div");
	let hide_btn_text = document.querySelector("#hide_btn_text");
	console.log(localStorage.getItem("side_bar_hidden"));
	side_bar_div.hidden = localStorage.getItem("side_bar_hidden") === "true";
	if (!side_bar_div.hidden) {
		side_bar_div.style.display = "inline-block";
		hide_btn_text.style.opacity = 1.0;
	} else {
		hide_btn_text.style.opacity = 0.0;
		iframe.classList.remove("side_bar_visible");
		iframe.classList.add("side_bar_hidden");
	}
	side_bar_toggle_btn.onclick = () => {
		if (!side_bar_div.style.display) {
			localStorage.setItem("side_bar_hidden", false);
			side_bar_div.hidden = !side_bar_div.hidden;
			hide_btn_text.style.opacity = 1.0;
			side_bar_div.style.display = "inline-block";
			hide_btn_text.style.display = "inline";
			iframe.classList.remove("side_bar_hidden");
			iframe.classList.add("side_bar_visible");
		} else {
			side_bar_div.style.display = "";
			hide_btn_text.style.display = "";
			side_bar_div.hidden = !side_bar_div.hidden;
			hide_btn_text.style.opacity = 0.0;
			localStorage.setItem("side_bar_hidden", true);
			iframe.classList.remove("side_bar_visible");
			iframe.classList.add("side_bar_hidden");
		}
	};

}

function updateWalletBalance() {
	let wallet_btn = document.querySelector("#wallet_btn");
	doACall("wallet_balance", {}, (response) => {
		let available_balance = parseFloat(response.result.available).toFixed(2).toString();
		let total_balance = parseFloat(response.result.total).toFixed(2).toString();
		wallet_btn.innerText = available_balance + "/" + total_balance  + " LBC";
	});
}

function doSearch() {
		var search_text = document.querySelector("#search_input").value;
		let page = getPageForUrl(search_text);
		page = "search.html";
		iframe.src = page + "?search_term=" + search_text;
}

function getBlockLists() {
	let xhr = new XMLHttpRequest();
	let server = "https://api.odysee.com/file/list_blocked";
	let filtered_claims = [];
	xhr.open("GET", server);
	xhr.onreadystatechange = () => {
		if (xhr.readyState === 4 && xhr.status === 200) {
			let obj = JSON.parse(xhr.response);
			filtered_claims = filtered_claims.concat(obj.data.outpoints);
			if (xhr.responseURL == "https://api.odysee.com/file/list_blocked") {
				server = "https://api.odysee.com/file/list_filtered";
				xhr.open("GET", server);
				xhr.send();
			} else if (xhr.responseURL == "https://api.odysee.com/file/list_filtered") {
				filtered_claims.sort();
				localStorage.setItem("filtered_outpoints", JSON.stringify(filtered_claims));
			}
		}
	};
	xhr.send();

}


function getVideoPlayerFromIframe(iframe) {
	let video = iframe.contentWindow.document.querySelector("video");
	return video;

}
function isIframeVideoPage(iframe) {
	let is_video_page = iframe.contentWindow.document.documentURI.match("video.html");
	return is_video_page;
}

function isVideoInFloatingPlayerSameAsVideo(video) {
	console.log(floating_player.getSd_hash());
	console.log(video.sd_hash);
	return floating_player.getSd_hash() == video.sd_hash;
}

function moveVideoToFloatingPlayer(video) {
	if (!video.paused) {
		floating_player.setSd_hash(video.sd_hash);
		floating_player.setStartTime(video.currentTime);
		floating_player.show();
	}
}

function setVideoToBeMovedInFloatingPlayerWhenNavigatingElsewhere(video) {
	let body = iframe.contentWindow.document.querySelector("body");
	body.onunload = () => moveVideoToFloatingPlayer(video);
}

function copyTimeFromFloatingPlayerToVideoElement(video) {
	console.log(floating_player.getCurrentTime());
	video.currentTime = floating_player.getCurrentTime();
}

function setFloatingPlayerToCloseOnVideoElementOnplay(video) {
	video.onplay = () => { 
		floating_player.close();
		video.onplay = "";
	};
}

function continueVideoFromFloatingPlayerInVideoElement(video) {
	copyTimeFromFloatingPlayerToVideoElement(video);
	floating_player.close();
	video.play();
}

function prepareVideoPlayerForFloating(video) {
	if (isVideoInFloatingPlayerSameAsVideo(video)) {
		continueVideoFromFloatingPlayerInVideoElement(video);
	} else {
		setFloatingPlayerToCloseOnVideoElementOnplay(video);
	}
	setVideoToBeMovedInFloatingPlayerWhenNavigatingElsewhere(video);

}
async function tryToGetVideoPlayerFromIframe(iframe) {
	while (true) {
		let video = getVideoPlayerFromIframe(iframe);
		if (video) {
			return video;
		}
		await sleep(100);
	}
}

function handleFloatingPlayer(iframe) {
	if (isIframeVideoPage(iframe)) {
		tryToGetVideoPlayerFromIframe(iframe).then( (video) => prepareVideoPlayerForFloating(video) );
	}
}

function checkIsIframePageExpectedToUpdateWindowTitle() {
	let iframe = document.querySelector("iframe");
	// Only video.html and channel.html pages should update title
	let is_content_page = iframe.contentDocument.documentURI.match("video.html");
	let is_channel_page = iframe.contentDocument.documentURI.match("channel.html");

	return (is_content_page || is_channel_page)
}

function setWindowTitle () {
	let will_iframe_update_window_title = checkIsIframePageExpectedToUpdateWindowTitle();
	if (!will_iframe_update_window_title) {
		window.document.title = "LBRY";
	}
}



function setIframeOnLoad(iframe) {
	iframe.onload = () => {
		setWindowTitle();
		handleFloatingPlayer(iframe);
		updateWalletBalance();
		listCategories();
	};
}

function setupMainIframe() {
	iframe = document.querySelector("iframe");
	setIframeOnLoad(iframe);

}

window.onload = () => {
	floating_player = new FloatingPlayer();
	setWindowTitle();
	setupMainIframe();
	handleFloatingPlayer(iframe);
	//setupFloatingPlayer();
	listCategories();

//	let floating_player = document.querySelector("#floating_player");
//	floating_player.parentElement.style.height = 0;
//	floating_player.style.height = 0;
	floating_player.close();


	//Load start page
	let page_name = getPageForUrl(lbryUrl);
	iframe.src = page_name + "?url=" + lbryUrl;

	// Search bar
	document.querySelector("button").onclick = doSearch;
	document.querySelector("#search_input").addEventListener("keyup", (e) => {
		if (e.keyCode === 13)
			doSearch();
	});

	// Wallet stuff
	let wallet_btn = document.querySelector("#wallet_btn");
	let unlock_btn = document.querySelector("#unlock_btn");
	doACall("wallet_status", {}, (response) => {
		if (response.result.is_locked) {
			wallet_btn.innerText = "Wallet(Locked)";
			unlock_btn.onclick = () => {
				let password_input = document.querySelector("#password_input");
				if (password_input) {
					password_input.remove();
					return;
				}
				password_input = document.createElement("input");
				password_input.type = "password";
				password_input.id = "password_input";
				password_input.addEventListener("keyup", (e) => {
					if (e.keyCode === 13) {
						doACall("wallet_unlock", {password: password_input.value}, (response) => {
							if (response.result) {
								password_input.remove();
								unlock_btn.remove();
							} else {
								password_input.style.background = "#eaa";
							}
						});
					}
				});
				document.body.append(password_input);
				password_input.focus();
			};

		} else {
			unlock_btn.remove();
		}

	updateWalletBalance();
	});
	wallet_btn.onclick = () => { iframe.src = "transactions.html" };

	getBlockLists();

	let set_server_btn = document.querySelector("#set_server_btn");
	set_server_btn.onclick = () => {
		let server_url = document.querySelector("#server_url").value;
		let api_port = document.querySelector("#api_port").value;
		let stream_port = document.querySelector("#stream_port").value;

		if (server_url != "") {
			localStorage.setItem("server_url", server_url);
		} else {
			localStorage.removeItem("server_url");
		}
		if (api_port != "") {
			localStorage.setItem("api_port", api_port);
		} else {
			localStorage.removeItem("api_port");
		}
		if (stream_port != "") {
			localStorage.setItem("stream_port", stream_port);
		} else {
			localStorage.removeItem("stream_port");
		}
	}
};
