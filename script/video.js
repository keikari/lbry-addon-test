var lbryUrl = document.URL.match(new RegExp(/lbry:\/\/.*/))[0];
lbryUrl = decodeURIComponent(lbryUrl);
var claim_id = lbryUrl.match(new RegExp(/[a-f|0-9]*$/))[0];
let thumbnail = "";
let localStorage = window.localStorage;

function createDeleteButton(claim) {
	let button = document.createElement("button");
	button.innerHTML = "Delete";
	button.classList.add("content_btn");
	let isDeleted = false;
	button.onclick = () => {
		if (!isDeleted) {
			doACall("file_delete", {claim_id: claim.claim_id}, (response) => {
				if (response.result) {
					let video = document.querySelector("video");
					if (video){
						video.src = "";
						video.load;
					}
					document.querySelector("#content_div").innerHTML = "";
				}
			});
		} else {
			loadFromResolve();	
		}
		isDeleted = !isDeleted;
		button.innerHTML = (!isDeleted ? "Delete" : "Create");
	};
	return button;
}


function createFollowButton(response, obj) {
	let claim = obj.obj;
	let options_div = obj.div;
	let button = document.createElement("button");
	let subscriptions = response.result.local.value.subscriptions;
	let channelURL = claim.signing_channel.permanent_url;
	let isFollowing = subscriptions.includes(channelURL);
	button.innerHTML = (isFollowing ? "Unfollow" : "Follow");
	button.classList.add("content_btn");

	button.onclick = () => { 
		doACall("preference_get", {key: "local"}, (response, channelURL) => {
			let local = response.result.local;
			let subscriptions = local.value.subscriptions;
			isFollowing = subscriptions.includes(channelURL);
			if ( isFollowing ) {
				subscriptions.splice(subscriptions.indexOf(channelURL), 1);
			} else {
				subscriptions.push(channelURL);
			}
			local.value.subscriptions = subscriptions;
			doACall("preference_set", {key: "local", value: local});
			button.innerHTML = (!isFollowing ? "Unfollow" : "Follow");
		}, channelURL);
	};
	options_div.append(button);
}
function createChannelSelector() {
	let channel_selector = document.createElement("select");
	channel_selector.innerHTML = "<option>Searching channels...</option>";
	doACall("channel_list", {no_totals: true}, (response) => {
		channel_selector.innerHTML = "";
		let option = document.createElement("option");
		channel_selector.append(option);
		option.value = "";
		option.innerHTML = "None";
		response.result.items.forEach((item) => {
			let option = document.createElement("option");
			option.value = item.claim_id;
			option.innerHTML = item.name + ":" + item.claim_id.substr(0,1);
			channel_selector.append(option);
		});
	});
	return channel_selector;
}

function createRepostButton(claim) {
	let button = document.createElement("button");
	let main_div = document.querySelector("#main_div");
	button.innerHTML = "Repost";
	button.classList.add("content_btn");

	button.onclick = () => { 
		button.disabled = true;
		let repost_div = document.createElement("div");
		repost_div.id = "repost_div";
		let channel_selector = createChannelSelector();
		channel_selector.id = "channel_selector";
		let name_label = document.createElement("label");
		name_label.id = "name_label";
		name_label.for = "repost_name_input";
		name_label.innerHTML = "Name:";
		let repost_name_input = document.createElement("input");
		repost_name_input.id = "repost_name_input";
		repost_name_input.type = "text";
		repost_name_input.value = claim.name;
		let repost_input_div = document.createElement("div");
		repost_input_div.id = "repost_input_div";
		repost_input_div.append(name_label);
		repost_input_div.append(repost_name_input);
		let bid_label = document.createElement("label");
		bid_label.id = "bid_label";
		bid_label.for = "bid_input"
		bid_label.innerHTML = "Bid:";
		let bid_input = document.createElement("input");
		bid_input.id = "bid_input";
		let repost_bid_div = document.createElement("div");
		repost_bid_div.id = "repost_bid_div";
		repost_bid_div.append(bid_label);
		repost_bid_div.append(bid_input);
		let create_repost_button = document.createElement("button");
		create_repost_button.id = "create_repost_button";
		create_repost_button.innerHTML = "Create Repost";
		create_repost_button.onclick = () => {
			let channel_id = channel_selector.value;
			let name = repost_name_input.value;
			let reposted_claim_id = claim.claim_id;
			let bid = bid_input.value;
			if (!bid.match("[0-9]+\.[0-9]+"))
				bid += ".0";
			params = {
				name: name,
				bid: bid,
				claim_id: reposted_claim_id,
			}
			if (channel_id)
				params.channel_id = channel_id;
			doACall("stream_repost", params, (response) => {
				addNotification(`Repost created of ${name}`, 5000);
				repost_div.remove();
				button.disabled = false;
			});
		};

		let x_button = document.createElement("button");
		x_button.classList.add("x_button");
		x_button.innerHTML = "X";
		
		x_button.onclick = () => {
			repost_div.remove();
			button.disabled = false;
		};

		repost_div.append(x_button);
		repost_div.append(channel_selector);
		repost_div.append(repost_input_div);
		repost_div.append(repost_bid_div);
		repost_div.append(create_repost_button);
		main_div.append(repost_div);
	};
	return button;
}

function createSupportButton(claim) {
	let button = document.createElement("button");
	let main_div = document.querySelector("#main_div");
	button.innerHTML = "Support";
	button.classList.add("content_btn");

	button.onclick = () => {
		button.disabled = true;
		let support_div = document.createElement("div");
		support_div.id = "support_div";
		let support_input_div = document.createElement("div");
		support_input_div.id = "support_input_div";
		let support_input = document.createElement("input");
		support_input.id = "support_input";
		let support_button_div = document.createElement("div");
		support_button_div.id = "support_button_div";
		let support_button = document.createElement("button");
		support_button.id = "support_button";
		support_button.innerHTML = "Support";
		support_button.style.width = "50%";
		let tip_button = document.createElement("button");
		tip_button.id = "tip_button";
		tip_button.innerHTML = "Tip";
		tip_button.style.width = "50%";
		let x_button = document.createElement("button");
		x_button.classList.add("x_button");
		x_button.innerHTML = "X";
		let channel_selector = createChannelSelector();
		channel_selector.id = "channel_selector";
		
		x_button.onclick = () => {
			support_div.remove();
			button.disabled = false;
		};

		support_button.onclick = () => {
			let amount =  parseFloat(support_input.value).toFixed(3);
			let params = {
				claim_id: claim.claim_id,
				amount: amount,
				tip: false,
			}
			if (channel_selector.value != "")
				params.channel_id = channel_selector.value;
			doACall("support_create", params);
			addNotification(`Supported claim with ${amount} LBC`, 5000)
			support_div.remove()
			button.disabled = false;
		};

		tip_button.onclick = () => {
			let amount =  parseFloat(support_input.value).toFixed(3);
			let params = {
				claim_id: claim.claim_id,
				amount: amount,
				tip: true,
			}
			if (channel_selector.value != "")
				params.channel_id = channel_selector.value;
			doACall("support_create", params);
			addNotification(`Tipped ${amount} LBC`, 5000)
			support_div.remove()
			button.disabled = false;
		};


		support_div.append(x_button);
		support_div.append(channel_selector);
		support_div.append(support_input_div);
		support_input_div.append(support_input);

		support_div.append(support_button_div);
		support_button_div.append(tip_button);
		support_button_div.append(support_button);

		main_div.append(support_div);

		

	};
	return button;
}

function trackPlayerTime(sd_hash, video) {

	if (video.duration > 300){
		let time = localStorage.getItem(sd_hash);
		if (time)
			video.currentTime = (time - 2 >= 0 ? time - 2 : time);

		setInterval(() => {
			let currentTime = video.currentTime;
			if (currentTime > 30 && ! (currentTime >= (video.duration * 0.9)))
				localStorage.setItem(sd_hash, currentTime);
			else
				localStorage.removeItem(sd_hash);
		}, 3000);
	}

}

function createVideo(obj, metadata) {
	let video = document.createElement("video");
	let content_div = document.querySelector("#content_div");
	video.autoplay = false;
	video.sd_hash = metadata.source.sd_hash;
	let src1 = document.createElement("source");
	src1.src = 'http://localhost:5280/stream/'+video.sd_hash;
	let src2 = document.createElement("source");
	src2.src = 'http://localhost:5280/get/'+obj.name+":"+obj.claim_id;
	video.poster = metadata.thumbnail.url;
	video.controls = true;
	video.style.width="100%";

	video.onloadeddata = () => trackPlayerTime(metadata.source.sd_hash, video);

	video.append(src1);
	video.append(src2);
	content_div.append(video);
}

function createDocument(obj, metadata) {
	let stream_url = 'http://localhost:5280/stream/'+metadata.source.sd_hash;
	let get_url = 'http://localhost:5280/get/'+obj.name+":"+obj.claim_id;
	let tried = false;

	let xhr = new XMLHttpRequest();
	xhr.open("GET", stream_url, true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4 && xhr.status === 206) {
			let content_div = document.querySelector("#content_div");
			content_div.innerHTML = markdown(xhr.response);
			content_div.classList.add("text_div");
		} else if (xhr.readyState === 4 && xhr.status === 404 && !tried) {
			xhr.open("GET", get_url, true);
			tried = true;
			xhr.send();
		}
	};
	xhr.send();

}

function createPdf(obj, metadata) {
	let name = obj.name || obj.claim_name;
	let get_url = 'http://localhost:5280/get/'+name+":"+obj.claim_id;
	let content_div = document.querySelector("#content_div");
	let iframe = document.createElement("iframe");
	iframe.src = get_url;
	iframe.classList.add("pdf_iframe");
	content_div.append(iframe);

}

function createImage(obj, metadata) {
	console.log("image");
	let content_div = document.querySelector("#content_div");
	let img = document.createElement("img");
	let get_url = 'http://localhost:5280/get/'+obj.name+":"+obj.claim_id;
	img.src = get_url;

	content_div.append(img);
}

function setInfo(obj, metadata) {
	console.log(obj);
	let details_div = document.querySelector("#details_div");
	details_div.innerHTML = "";
	let right_div = document.createElement("div");
	right_div.id = "right_div";

	// Info text div
	let info_div = document.createElement("div");
	info_div.id = "info_div";

	// Title
	let title = (metadata.title);
	let title_text = document.createElement("h3");
	title_text.id = "title_text";
	title_text.innerText = title;
	info_div.append(title_text);
	window.top.document.title = title;
	

	// Channel
	let channel = "Anonymous";
	let channel_url = "";
	if (obj.is_channel_signature_valid) {
		channel = obj.signing_channel.name;
		channel_url = obj.signing_channel.permanent_url;
	}
	let channel_link = document.createElement("a");
	channel_link.id = "channel_link";
	let channel_text = document.createElement("h4");
	channel_text.id = "channel_text";
	channel_link.href = "channel.html?url="+channel_url;
	channel_text.innerHTML = channel;
	channel_link.append(channel_text);
	info_div.append(channel_link);

	// URL
	let url_text = document.createElement("p");
	url_text.id = "url_text";
	let url = obj.canonical_url;
	if (!obj.is_channel_signature_valid)
		url = obj.short_url;
	url_text.innerHTML = url;
	info_div.append(url_text);

	// Claim_id
	let claim_id_text = document.createElement("p");
	claim_id_text.id = "claim_id_text";
	let claim_id = obj.claim_id;
	claim_id_text.innerHTML = claim_id;
	info_div.append(claim_id_text);

	details_div.append(info_div);

	let options_div = document.createElement("div");
	options_div.id = "options_div";
	
	if (obj.signing_channel)
		doACall("preference_get", {key: "local"}, createFollowButton, {"obj": obj, "div": options_div});
	options_div.append(createRepostButton(obj));
	options_div.append(createSupportButton(obj));
	options_div.append(createDeleteButton(obj));

	right_div.append(options_div);

	// LBC 
	let LBC_text = document.createElement("p");
	LBC_text.id = "LBC_text";
	let LBC_amount = parseFloat(obj.meta.support_amount) + parseFloat(obj.amount);
	LBC_text.innerHTML = LBC_amount.toFixed(2).toString() + " LBC";

	right_div.append(LBC_text);

	details_div.append(right_div);

	// Set json
	let hr_div = document.querySelector("#hr_div");
	hr_div.addEventListener("click", () => {
		let json_viewer = document.querySelector(".json_viewer");
		if (!json_viewer) {
			let json_div = document.createElement("div");
			json_div.classList.add("json_viewer");
			json_viewer = new JSONViewer();
			json_div.appendChild(json_viewer.getContainer());
			main_div.insertBefore(json_div, document.querySelector("#description_div"));
			json_viewer.showJSON(obj, -1, 1);
		} else {
			json_viewer.remove();
		}
	});

	// Add description
	let description = metadata.description;
	if (description) {
		description_div = document.querySelector("#description_div");
		description_div.innerHTML = markdown(description);
		let timestamps = description_div.querySelectorAll(".timestamp");
		timestamps.forEach((timestamp) => {
			let video = document.querySelector("video");
			let times = timestamp.innerText.match(/([0-9]{1,2}):([0-9]{2}):([0-9]{2})|([0-9]{1,2}):([0-9]{2})[^:]?/);
			let time = parseInt(((times[1] | 0) * 3600)) + parseInt((( (times[2]| 0) + (times[4] | 0) ) * 60)) + parseInt((times[3]|0) + (times[5]|0));
			timestamp.innerHTML = "<u>" + timestamp.innerHTML + "</u>";
			timestamp.onclick = () => {video.currentTime = time; video.play();};
		});
		//description_div.classList.add("text_div");
	}

}

function loadFromClaim(claim) {
	if (!document.querySelector("#content_div")){
		setTimeout(() => {loadFromClaim(claim)}, 100);
		return
	}
	
	let mime_type = claim.value.source.media_type;
	if (mime_type.match(new RegExp("video/")) ||
		mime_type.match(new RegExp("audio/")))
		createVideo(claim, claim.value);
	else if (mime_type == "text/markdown")
		createDocument(claim, claim.value);
	else if (mime_type.match(new RegExp("image/")))
		createImage(claim, claim.value);
	else if (mime_type.match(new RegExp("application/pdf")))
		createPdf(claim, claim.value);

	setInfo(claim, claim.value);
}

function handlePaidContent(claim) {
	let content_div = document.querySelector("#content_div");
	let purchase_button = document.createElement("button");
	purchase_button.id = "purchase_button";
	purchase_button.innerHTML = "(EXPERIMENTAL: This works, but you may need to reload page or click \"Delete\"/\"Create\" for content to show)<br>Click to purchase access for " + (claim.value.fee.amount) + " LBC";
	let params = {
		claim_id: claim.claim_id,
		override_max_key_fee: false,
	}
	purchase_button.addEventListener("click", () => {
		doACall("purchase_create", params, (response) => {
			console.log(response);
			if (response.error && response.error.data.name === "KeyFeeAboveMaxAllowedError")
			{
				purchase_button.innerHTML = response.error.message + " Click to buy anyway";
				params.override_max_key_fee = true;
			} else {
				purchase_button.remove();
				loadFromResolve();
			}
		});
	});
	content_div.append(purchase_button);


}

function loadFromResolve() {
	doACall("resolve", {urls: lbryUrl, include_purchase_receipt: true}, (response) => {
			let obj = response;
			obj = obj.result[lbryUrl];
			let metadata = obj.value;
			if (obj.value_type == "repost"){
				obj = obj.reposted_claim;
				metadata = obj.value;
			}
			if (obj.value_type === "collection") {
				let main_div = document.querySelector("#main_div");
				let div = document.createElement("div");
				let claim_list = document.createElement("ul");
				claim_list.id = "claim_list";
				div.append(claim_list);
				main_div.append(div);
				sendSearchParams({claim_ids: obj.value.claims});
			} else if (!obj.value.fee || !obj.value.fee.amount || obj.purchase_receipt) {
				console.log("hmm");
				lbryUrl = obj.permanent_url;
				claim_id = obj.claim_id;
				doACall("get", {uri: lbryUrl}, (response) => {
					let obj = response;
					obj = obj.result;
					console.log(obj);
					let mime_type = obj.mime_type;
					if (mime_type.match(new RegExp("video/")) ||
						mime_type.match(new RegExp("audio/")))
						createVideo(obj, obj.metadata);
					else if (mime_type == "text/markdown")
						createDocument(obj, obj.metadata);
					else if (mime_type.match(new RegExp("image/")))
						createImage(obj, obj.metadata);
					else if (mime_type.match(new RegExp("application/pdf")))
						createPdf(obj, obj.metadata);
				});
			} else if (obj.value.fee) {
				// Hande paid content
				handlePaidContent(obj);
			}

			
			setInfo(obj, metadata);
		
	});
}


let claim = JSON.parse(localStorage.getItem(claim_id));
if (claim && !claim.value.fee) {
	console.log("loaded from claim");
	loadFromClaim(claim);
} else {
	// Fee will be dealt in here
	console.log("resolved");
	loadFromResolve();
}
