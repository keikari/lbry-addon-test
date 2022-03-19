var lbryUrl = document.URL.match(new RegExp(/lbry:\/\/.*/))[0];
lbryUrl = decodeURIComponent(lbryUrl);
let server = "http://localhost";
var iframe;
var localStorage = window.localStorage;

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

function floatToMainPlayer(video) {
	let floating_player = document.querySelector("#floating_player");
	if (floating_player.sd_hash === video.sd_hash && floating_player.currentTime != 0) {
		window.localStorage.setItem(video.sd_hash, floating_player.currentTime + 2);
		floating_player.pause();
		floating_player.id = "";
		video.play();
		video.currentTime = floating_player.currentTime;
	}
	floating_player.id = "floating_player";
	floating_player.hidden = true;
	floating_player.style.height = "0px";
	floating_player.src = "";
	floating_player.sd_hash = "";
	clearInterval(floating_player.interval);
}

function doSearch() {
		var search_text = document.querySelector("#search_input").value;
		let page = getClaimTypeFromUrl(search_text);
		page = "search.html";
		iframe.src = page + "?search_term=" + search_text;
}

function trackPlayerTime(sd_hash, video, setTime) {
	if (!video.duration){
		setTimeout(() => trackPlayerTime(sd_hash, video, setTime), 200);
		console.log("Looking for floating_player duration");
		return;
	}
	console.log("Floating player duration: " + video.duration);
	if (video.duration > 300){
		let time = localStorage.getItem(sd_hash);
		if (time && setTime)
			video.currentTime = (time - 2 >= 0 ? time - 2 : time);

		if (video.interval)
			clearInterval(video.interval);
		video.interval = setInterval(() => {
			let currentTime = video.currentTime;
			if (currentTime > 30 && ! (currentTime >= (video.duration * 0.9)))
				localStorage.setItem(sd_hash, currentTime);
			else
				localStorage.removeItem(sd_hash);
		}, 3000);
	}
}

function moveVideoToFloatingPlayer(sd_hash, time) {
	if (time === 0)
		return;
	let floating_player = document.querySelector("#floating_player");
	let video = iframe.contentWindow.document.querySelector("video");
	floating_player.src = server+":5280/stream/"+sd_hash;
	floating_player.currentTime = time;
	floating_player.hidden = false;
	floating_player.controls = true;
	floating_player.sd_hash = sd_hash;
	floating_player.style = "";
	trackPlayerTime(sd_hash, floating_player, false);
	if (!video.isPaused)
		floating_player.play();

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

function handleFloatingPlayer(interval_id = null) {
	let video = iframe.contentWindow.document.querySelector("video");
	let isVideoPage = iframe.contentWindow.document.documentURI.match("video.html");;
	if (!video && isVideoPage) {
		if (interval_id == null) {
			interval_id = setInterval(() => handleFloatingPlayer(interval_id), 500);
			setTimeout(() => clearInterval(interval_id), 1000 * 10); // Wait video for max 10s
		}
	} else if (video) {
		clearInterval(interval_id);
		let sd_hash = video.sd_hash;
		floating_player = document.querySelector("#floating_player");
		if (floating_player.sd_hash == sd_hash) {
			floatToMainPlayer(video);
		} else if (floating_player.src || floating_player.querySelector("source")) {
			video.onplay = () => {floatToMainPlayer(video)};
		}
		let body = iframe.contentWindow.document.querySelector("body");
		body.onunload = () => {
			video = iframe.contentWindow.document.querySelector("video");
			if (video) {
				let time = video.currentTime;
				console.log("Time: " + time);
				if (!video.paused)
					moveVideoToFloatingPlayer(sd_hash, time)
			}
		};
	}

}

window.onload = () => {
	window.document.title = "LBRY";
	iframe = document.querySelector("iframe");
	let page = getClaimTypeFromUrl(lbryUrl);
	console.log("window loaded");

	listCategories();

	let floating_player = document.querySelector("#floating_player");
	floating_player.parentElement.style.height = 0;
	floating_player.style.height = 0;

	let count = 0;
	handleFloatingPlayer();

	iframe.onload = function () {
		let is_content_page = iframe.contentDocument.documentURI.match("video.html");
		let is_channel_page = iframe.contentDocument.documentURI.match("channel.html");
		if (!is_content_page && !is_channel_page) {
			window.document.title = "LBRY";
		}
		handleFloatingPlayer();
		updateWalletBalance();
		listCategories();
		count = 0;
	};

	//Load start page
	iframe.src = page + "?url=" + lbryUrl;

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
};
