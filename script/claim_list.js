function createChannelUploadsCount(claim) {
	let uploads_count_text = document.createElement("p");
	uploads_count_text.classList.add("uploads_count");
	uploads_count_text.innerText = `${claim.meta.claims_in_channel} Uploads`;
	return uploads_count_text;
}

function createChannelPreviewInfoDiv(claim, is_reposted, repost_claim) {
	const preview_info_div = createPreviewInfoDiv();
	const title = createClaimPreviewTitle(claim);
	const release_text = createClaimPreviewReleaseTime(claim);
	let uploads_count_text = createChannelUploadsCount(claim);
	const preview_details_div = createChannelPreviewDetailsDiv(claim);

	if (is_reposted) {
		const repost_text_div = createRepostInfoDiv(claim, repost_claim);
		preview_info_div.insertBefore(repost_text_div, preview_info_div.firstChild);
	}
	preview_info_div.append(title);
	preview_info_div.append(uploads_count_text);
	preview_info_div.append(release_text);
	preview_info_div.append(preview_details_div);
	return preview_info_div;
}

function createStakedAmountLabel(claim) {
	let staked = claim.meta.effective_amount;
	let staked_text = document.createElement("label");
	staked_text.classList.add("staked_text");
	staked_text.innerText = `Staked: ${staked} LBC`;
	return staked_text;
}

function createChannelPreviewDetailsDiv(claim) {
	let preview_details_div = document.createElement("div");
	preview_details_div.classList.add("preview_details_div");

	let staked_text = createStakedAmountLabel(claim);
	preview_details_div.append(staked_text);
	return preview_details_div;

}

function isStream(claim) {
	return claim.value_type === "stream";
}

function isCollection(claim) {
	return claim.value_type === "collection";
}

function isChannel(claim) {
	return claim.value_type === "channel";
}

function createClaimsInListParagrpah(claim) {
	let claim_count_text = document.createElement("p");
	claim_count_text.classList.add("claim_count");
	claim_count_text.innerText = `${claim.value.claims.length} claims`;
	return claim_count_text;
}

function createCollectionPreviewInfoDiv(claim, is_reposted, repost_claim) {
	const preview_info_div = createPreviewInfoDiv();
	const title = createClaimPreviewTitle(claim);
	const release_text = createClaimPreviewReleaseTime(claim);
	const channel_link = createClaimPreviewChannelLink(claim);
	const claims_in_list = createClaimsInListParagrpah(claim);
	const preview_details_div = createChannelPreviewDetailsDiv(claim);

	if (is_reposted) {
		const repost_text_div = createRepostInfoDiv(claim, repost_claim);
		preview_info_div.insertBefore(repost_text_div, preview_info_div.firstChild);
	}
	preview_info_div.append(title);
	preview_info_div.append(channel_link);
	preview_info_div.append(claims_in_list);
	preview_info_div.append(release_text);
	preview_info_div.append(preview_details_div);
	return preview_info_div;
}


function createClaimPreviewDiv() {
	const div = document.createElement("div");
	div.classList.add("preview_div");
	return div;
}

function createThumbnailDiv(claim) {
	const thumbnail_div = document.createElement("div");
	thumbnail_div.classList.add("thumbnail_div");
	const thumbnail = document.createElement("img");
	const thumbnail_url = (claim.value.thumbnail ? claim.value.thumbnail.url : "") ;
	thumbnail.src = thumbnail_url;
	thumbnail_div.append(thumbnail);

	if (claimTypeHasDuration(claim)) {
		const duration_text = createClaimPreviewDuration(claim);
		thumbnail_div.append(duration_text);
	}


	return thumbnail_div;
}

function createClaimPreviewTitle(claim) {
	const title = document.createElement("h3");
	title.classList.add("title");
	title.innerText = claim.value.title ? claim.value.title : claim.name;
	return title;
}

function createClaimPreviewChannelName(claim) {
	let	channel_name = document.createElement("h4");
	channel_name.classList.add("channel_name");
	channel_name.innerText = (claim.signing_channel ? (claim.signing_channel.name ? claim.signing_channel.name : claim.signing_channel.channel_id) : "");
	return channel_name;
}

function linkifyChannelName(channel_name, claim) {
	const channel_link = document.createElement("a");
	channel_link.href = "channel.html?url="+claim.signing_channel.permanent_url;
	channel_link.classList.add("channel_url");
	channel_link.append(channel_name);
	return channel_link;
	
}

function maybeLinkifyChannelName(channel_name, claim) { 
	let channel_link = null;
	if (channel_name && channel_name.innerText !== "") {
		channel_link = linkifyChannelName(channel_name, claim);
	} else {
		channel_link = channel_name;
	}
	return channel_link;
}

function createClaimPreviewChannelLink(claim) {
	const channel_name = createClaimPreviewChannelName(claim);
	const channel_link = maybeLinkifyChannelName(channel_name, claim);
	return channel_link;
}

function createClaimPreviewReleaseTime(claim) {
	let release_text = document.createElement("p");
	release_text.classList.add("release_time");
	release_text.innerText = timeDifference(
		Math.floor(Date.now()/1000),
		(claim.value.release_time ? claim.value.release_time : claim.meta.creation_timestamp)
	);
	return release_text;
}

function createRepostInfoDiv(claim, repost_claim) {
		let repost_channel_name = ( repost_claim.signing_channel ? repost_claim.signing_channel.name : "Unknown" );
		let repost_channel_url = ( repost_claim.signing_channel ? repost_claim.signing_channel.permanent_url : null );
		let repost_text_div = document.createElement("div");
		repost_text_div.classList.add("repost_text_div");
		let a = document.createElement("a");
		if (repost_channel_url)
			a.href = `channel.html?url=${repost_channel_url}`;
		a.innerText = repost_channel_name;
		let repost_label = document.createElement("label");
		repost_label.innerText = "Reposted by ";
		repost_label.append(a);
		repost_text_div.append(repost_label);
		return repost_text_div;
}

function createPreviewInfoDiv() {
	const preview_info_div = document.createElement("div");
	preview_info_div.classList.add("preview_info_div");
	return preview_info_div;
}

function createStreamPreviewInfoDiv(claim, is_reposted, repost_claim) {
	const preview_info_div = createPreviewInfoDiv();
	const title = createClaimPreviewTitle(claim);
	const channel_link = createClaimPreviewChannelLink(claim);
	const release_text = createClaimPreviewReleaseTime(claim);
	const preview_details_div = createPreviewDetailsDiv(claim);

	if (is_reposted) {
		const repost_text_div = createRepostInfoDiv(claim, repost_claim);
		preview_info_div.insertBefore(repost_text_div, preview_info_div.firstChild);
	}
	preview_info_div.append(title);
	preview_info_div.append(channel_link);
	preview_info_div.append(release_text);
	preview_info_div.append(preview_details_div);
	return preview_info_div;
}


function getDuration(claim) {
	let duration = claim.value.video && claim.value.video.duration ? claim.value.video.duration : 
		(claim.value.audio && claim.value.audio.duration ? claim.value.audio.duration : 0);
	return duration;
	
}

function getSize(claim) {
	let size = (claim.value.source ? claim.value.source.size : "?");
	return size;
}

function formatSizeToHumanReadeable(size) {
	return (size/1000000000 >= 1 ? (size/1000000000).toFixed(2) + " GB" : (size/1000000).toFixed(2) + " MB");
}

function createClaimPreviewDuration(claim) {
	var duration_text = document.createElement("label");
	duration_text.classList.add("duration_text");
	let duration = getDuration(claim);
	let date = new Date(0);
	date.setSeconds(duration);
	let str_start = 11;
	let str_length = 8;
	if (duration < 3600){
						str_start = 14; 
						str_length = 5;
					}
	duration_text.innerText = date.toISOString().substr(str_start,str_length);

	return duration_text;

}

function claimTypeHasDuration(claim) {
	return claim.value.stream_type === "video" || claim.value.stream_type === "audio";
}

function createClaimPreviewByteRate(claim) {
	let duration = getDuration(claim);
	let size = getSize(claim);
	var byterate_text = document.createElement("label");
	let byterate = 0;
	if (duration > 0)
		byterate = ((size/1000000)/duration).toFixed(2);
	byterate_text.innerText = byterate + "MB/s";

	return byterate_text;
}

function createClaimPreviewSize(claim) {
	let size_text = document.createElement("label");
	let size = getSize(claim);
	size_text.innerText = formatSizeToHumanReadeable(size);

	return size_text;
}

function createClaimPreviewMimeType(claim) {
	let mime_type_text = document.createElement("label");
	mime_type_text.classList.add("mime_type_text");
	let claim_mime_type = (claim.value.source ? claim.value.source.media_type : "Unknown");
	mime_type_text.innerText = claim_mime_type;
	return mime_type_text;
}


function createClaimPreviewPriceText(claim) {
	let price = (claim.value.fee ? claim.value.fee.amount
		? claim.value.fee.amount 
		: "Free": "Free");
	let currency = claim.value?.fee?.currency;
	let price_text = document.createElement("label");
	price_text.classList.add("price_text");
	price_text.innerText = (price === "Free" ? "Free" : `Fee: ${price} ${currency}`);

	return price_text;
}

function createPreviewDetailsDiv(claim) {
	let preview_details_div = document.createElement("div");
	preview_details_div.classList.add("preview_details_div");

	let size_text = createClaimPreviewSize(claim);
	let byterate_text = null;
	if (claimTypeHasDuration(claim)) {
		byterate_text = createClaimPreviewByteRate(claim);
	}
	let mime_type_text = createClaimPreviewMimeType(claim);
	let price_text = createClaimPreviewPriceText(claim);

	preview_details_div.append(size_text);
	byterate_text && preview_details_div.append(byterate_text);
	preview_details_div.append(mime_type_text);
	preview_details_div.append(price_text);

	return preview_details_div;
}

function createClaimPreview(claim, is_reposted, repost_claim = null) {
	const div = createClaimPreviewDiv();
	const thumbnail_div = createThumbnailDiv(claim);

	let preview_info_div = null;
	if (isStream(claim)) {
		preview_info_div = createStreamPreviewInfoDiv(claim, is_reposted, repost_claim);
	} else if (isCollection(claim)) {
		preview_info_div = createCollectionPreviewInfoDiv(claim, is_reposted, repost_claim);
	} else if (isChannel(claim)) {
		preview_info_div = createChannelPreviewInfoDiv(claim, is_reposted, repost_claim);
	}

	div.append(thumbnail_div);
	div.append(preview_info_div);
	return div;
}


function sendSearchParams(_search_params, channel_claim, is_temp_category = false) {
	let search_params = Object.assign({}, _search_params); //To get shallow copy
	window.onscroll = null; // Restore scroll functionality between new searches
	if (!search_params.page) {
		search_params.page = 1;
	}
	search_params.no_totals = true;
	if (search_params.use_default_not_tags) {
		search_params.not_tags = Array.isArray(search_params.not_tags) ? search_params.not_tags : [];
		search_params.not_tags = search_params.not_tags.concat(default_not_tags);
	}
	// Handle relative time params
	Object.keys(search_params).forEach((key) => {
		if (key.match("relative")) {
			let value = search_params[key];
			let date = new Date();
			let time = parseInt(date.getTime() / 1000);
			let date_obj = {
				years: date.getFullYear(),
				months: date.getMonth(),
				days: date.getDate(),
				hours: date.getHours(),
				minutes: date.getMinutes()
			};
			let time_side = value.side === "ago" ? -1 : 1; // Is wanted timepoint in the past or future
			let check_word = value.side === "ago" ? "over" : "under"; // No sure why, but this seems to work so it must make sense
			let prefix = value.direction == check_word ? '<' : ">";
			if (value.amount == 0) {
				// Time is now, no need for fanciness
				search_params[value.real_param] = prefix + time;
				return
			}

			date_obj[value.type] += value.amount * time_side; // Time side means positive or negative change
			let new_date = new Date(
				date_obj.years,
				date_obj.months,
				date_obj.days,
				date_obj.hours,
				date_obj.minutes,
			);
			time = parseInt(new_date.getTime() / 1000);
			time = `${prefix}${time}`;
			search_params[value.real_param] = time;
		}
	});
	doACall("claim_search", search_params, (response) => {
		addClaimsToList(response, search_params);

		function getNextResultPage() {
			if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
				// Disable scroll to only allow one call at time
				window.onscroll = null;
				search_params.page++; 
				doACall("claim_search", search_params, (response) => {
					// Restore onscroll functionality if there may be more results
					if (response.result.items.length != 0) {
						setTimeout(() => {window.onscroll = getNextResultPage}, 100);
					}
					addClaimsToList(response, search_params);
					if (is_temp_category && search_params.page > 2) {
						_search_params.page = search_params.page - 1; //Update page value in original params, this is so going back from opened video gets you back in same plac
						localStorage.setItem("category__temp_", JSON.stringify(_search_params));
					}
				});
			}
		}
		window.onscroll = getNextResultPage;
	});
}

function sanitizeClaimJSON(claim) {
	return JSON.parse(cleanHTML(JSON.stringify(claim)));
}

// Channel claim is optional
function addClaimsToList(obj, search_params) {

	let filtered_txids = JSON.parse(window.localStorage.getItem("filtered_outpoints"));
	const ul = document.querySelector("#claim_list");

	obj.result["items"].forEach((claim) => {
		claim = sanitizeClaimJSON(claim);

		// If using channel filters and signature is invalid, don't show publishes
		if (!search_params.show_invalid_signatures && claim.signing_channel && (search_params.channel_ids || search_params.channel) && !claim.is_channel_signature_valid) {
			return;
		}

		let is_reposted = false;
		if (claim.value_type == "repost") {
			var repost_claim = claim;
			claim = claim.reposted_claim;
			is_reposted = true;
			if(!claim)
				return;
		}

		// Check that claim isn't in filter or block list
		let is_filtered = false;
		if (itemInArray(claim.txid, filtered_txids) || (claim.signing_channel && claim.signing_channel.txid ? itemInArray(claim.signing_channel.txid, filtered_txids) : false)) {
			is_filtered = true
		}

		// Add mature class
		let is_mature = false;
		if (claim.value.tags?.some(r => default_not_tags.includes(r))) {
			is_mature = true;
		}
			

		
		// Just create this in somewhere
		const li = document.createElement("li");
		li.classList.add("claim_item");
		if (is_filtered) {
			li.classList.add("filtered_item");
		}
		else if (is_mature) {
			li.classList.add("mature_item");
		}
		if (is_reposted) {
			li.classList.add("repost");
		}
		if (!claim.signing_channel && claim.value_type !== "channel" ) {
			li.classList.add("no_channel");
		} else {
			li.classList.add("has_channel");
		}
		if (claim.value_type === "collection") {
			li.classList.add("collection");
		}



		const a = document.createElement("a");
		const preview_div = createClaimPreview(claim, is_reposted, repost_claim);
		if (claim.value_type == "stream") {
			a.href = "video.html?url="+claim.permanent_url;
		} else if (claim.value_type == "channel") {
			a.href = "channel.html?url="+claim.permanent_url;
		} else if (claim.value_type == "collection") {
			a.href = "video.html?url="+claim.permanent_url; // Also hadles collections
		}
		a.onclick = () => {
			window.localStorage.setItem(claim.claim_id, JSON.stringify(claim)); // This is used to speed up the loading of page
		}
		// Make cliking hr show/hide the claim JSON
		const hr_div = document.createElement("div");
		const hr = document.createElement("hr");
		hr_div.classList.add("hr_div");
		hr_div.addEventListener("click", () => {
			let json_viewers = ul.querySelectorAll(".json_viewer");
			let was_json_viewer_closed = false;
			for (let i = 0; i < json_viewers.length; i++) {
				let json_viewer = json_viewers[i];
				if (json_viewers[i].classList.contains(`.${claim.name}${claim.claim_id}`)) {
					json_viewers[i].remove();
					was_json_viewer_closed = true;
				}
			}

			if (!was_json_viewer_closed) {
				let json_div = document.createElement("div");
				json_div.classList.add("json_viewer");
				json_div.classList.add(`.${claim.name}${claim.claim_id}`);
				json_viewer = new JSONViewer();
				json_div.appendChild(json_viewer.getContainer());
				ul.insertBefore(json_div, hr_div.nextSibling);
				if (repost_claim)
					json_viewer.showJSON(repost_claim, -1, 1);
				else
					json_viewer.showJSON(claim, -1, 1);
			}
		});
		hr_div.append(hr);

		a.append(preview_div);
		li.append(a);
		ul.append(li);
		ul.append(hr_div);
	});
}

