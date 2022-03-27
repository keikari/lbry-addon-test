function createChannelClaimPreview(claim, isReposted, repost_claim) {
	const div = document.createElement("div");
	div.classList.add("preview_div");
	const thumbnail_div = document.createElement("div");
	thumbnail_div.classList.add("thumbnail_div");
	const thumbnail = document.createElement("img");
	thumbnail.classList.add("channel_thumbnail");
	let thumbnail_url = (claim.value.thumbnail ? claim.value.thumbnail.url : "") ;
	thumbnail.src = thumbnail_url;
	thumbnail_div.append(thumbnail);
	const preview_info_div = document.createElement("div");
	preview_info_div.classList.add("preview_info_div");
	const title = document.createElement("h3");
	title.classList.add("title");
	title.innerText = claim.value.title ? claim.value.title : claim.name;
	preview_info_div.append(title);

	// Release time
	let release_text = document.createElement("p");
	release_text.classList.add("release_time");
	release_text.innerText = timeDifference(
		Math.floor(Date.now()/1000),
		claim.meta.creation_timestamp
	);
	preview_info_div.append(release_text);

	//Uploads on channel
	let uploads_count_text = document.createElement("p");
	uploads_count_text.classList.add("uploads_count");
	uploads_count_text.innerText = `${claim.meta.claims_in_channel} Uploads`;
	preview_info_div.append(uploads_count_text);
	
	let preview_details_div = document.createElement("div");
	preview_details_div.classList.add("preview_details_div");

	//Staked
	let staked = claim.meta.effective_amount;
	let staked_text = document.createElement("label");
	staked_text.classList.add("staked_text");
	staked_text.innerText = `Staked: ${staked} LBC`;
	preview_details_div.append(staked_text);

	// Repost info
	if (isReposted) {
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
		preview_info_div.insertBefore(repost_text_div, preview_info_div.firstChild);
	}

	preview_info_div.append(preview_details_div);
	div.append(thumbnail_div);
	div.append(preview_info_div);
	return div;
}
function createCollectionClaimPreview(claim, channel_claim, isReposted, repost_claim = null) {
	const div = document.createElement("div");
	div.classList.add("preview_div");
	const thumbnail_div = document.createElement("div");
	thumbnail_div.classList.add("thumbnail_div");
	const thumbnail = document.createElement("img");
	let thumbnail_url = (claim.value.thumbnail ? claim.value.thumbnail.url : "") ;
	thumbnail.src = thumbnail_url;
	thumbnail_div.append(thumbnail);
	div.append(thumbnail_div);
	const preview_info_div = document.createElement("div");
	preview_info_div.classList.add("preview_info_div");
	const title = document.createElement("h3");
	title.classList.add("title");
	title.innerText = claim.value.title ? claim.value.title : claim.name;
	let channel_name = null;
	// Don't print channel name on channel's page
	if (!channel_claim || !claim.signing_channel || claim.signing_channel.claim_id != channel_claim.claim_id) {
		channel_name = document.createElement("h4");
		channel_name.classList.add("channel_name");
		channel_name.innerText = (claim.signing_channel ? (claim.signing_channel.name ? claim.signing_channel.name : "Unknown") : "Unknown");
	}

	// Release time
	let release_text = document.createElement("p");
	release_text.classList.add("release_time");
	release_text.innerText = timeDifference(
		Math.floor(Date.now()/1000),
		(claim.value.release_time ? claim.value.release_time : claim.meta.creation_timestamp)
	);

	// Claims in list
	let claim_count_text = document.createElement("p");
	claim_count_text.classList.add("claim_count");
	claim_count_text.innerText = `${claim.value.claims.length} claims`;

	//Create details div
	let preview_details_div = document.createElement("div");
	preview_details_div.classList.add("preview_details_div");

	//Staked
	let staked = claim.meta.effective_amount;
	let staked_text = document.createElement("label");
	staked_text.classList.add("staked_text");
	staked_text.innerText = `Staked: ${staked} LBC`;
	preview_details_div.append(staked_text);

	// Repost info
	if (isReposted) {
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
		preview_info_div.insertBefore(repost_text_div, preview_info_div.firstChild);
	}


	preview_info_div.append(title);
	if (channel_name && channel_name.innerText != "Unknown") {
		const channel_link = document.createElement("a");
		channel_link.href = "channel.html?url="+claim.signing_channel.permanent_url;
		channel_link.classList.add("channel_url");
		channel_link.append(channel_name);
		preview_info_div.append(channel_link);
	}
	preview_info_div.append(release_text);
	preview_info_div.append(preview_details_div);
	preview_info_div.append(claim_count_text);
	div.append(preview_info_div);
	return div;

}
function createStreamClaimPreview(claim, channel_claim, isReposted, repost_claim = null) {
	const div = document.createElement("div");
	div.classList.add("preview_div");
	const thumbnail_div = document.createElement("div");
	thumbnail_div.classList.add("thumbnail_div");
	const thumbnail = document.createElement("img");
	let thumbnail_url = (claim.value.thumbnail ? claim.value.thumbnail.url : "") ;
	thumbnail.src = thumbnail_url;
	thumbnail_div.append(thumbnail);
	const preview_info_div = document.createElement("div");
	preview_info_div.classList.add("preview_info_div");
	const title = document.createElement("h3");
	title.classList.add("title");
	title.innerText = claim.value.title ? claim.value.title : claim.name;
	let channel_name = null;
	// Don't print channel name on channel's page
	if (!channel_claim || !claim.signing_channel || claim.signing_channel.claim_id != channel_claim.claim_id) {
		channel_name = document.createElement("h4");
		channel_name.classList.add("channel_name");
		channel_name.innerText = (claim.signing_channel ? (claim.signing_channel.name ? claim.signing_channel.name : "Unknown") : "Unknown");
	}

	// Release time
	let release_text = document.createElement("p");
	release_text.classList.add("release_time");
	release_text.innerText = timeDifference(
		Math.floor(Date.now()/1000),
		(claim.value.release_time ? claim.value.release_time : claim.meta.creation_timestamp)
	);

	// Repost info
	if (isReposted) {
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
		preview_info_div.insertBefore(repost_text_div, preview_info_div.firstChild);
	}

	//Create details div
	let preview_details_div = document.createElement("div");
	preview_details_div.classList.add("preview_details_div");
	//Size
	let size_text = document.createElement("label");
	let size = (claim.value.source ? claim.value.source.size : "?");
	size_text.innerText = (size/1000000000 >= 1 ? (size/1000000000).toFixed(2) + " GB" : (size/1000000).toFixed(2) + " MB");
	preview_details_div.append(size_text);
	//Duration and bitrate
	if (claim.value.stream_type === "video" || claim.value.stream_type == "audio") {
					var duration_text = document.createElement("label");
					duration_text.classList.add("duration_text");
					var duration = (claim.value.video && claim.value.video.duration ? claim.value.video.duration : 
							(claim.value.audio && claim.value.audio.duration ? claim.value.audio.duration : 0));
					let date = new Date(0);
					date.setSeconds(duration);
					let str_start = 11;
					let str_length = 8;
					if (duration < 3600){
										str_start = 14; 
										str_length = 5;
									}
					duration_text.innerText = date.toISOString().substr(str_start,str_length);
					var byterate_text = document.createElement("label");
					let byterate = 0;
					if (duration > 0)
							byterate = ((size/1000000)/duration).toFixed(2);

					byterate_text.innerText = byterate + "MB/s";
					preview_details_div.append(byterate_text);
				}
	//Media type
	let mime_type_text = document.createElement("label");
	mime_type_text.classList.add("mime_type_text");
	let claim_mime_type = (claim.value.source ? claim.value.source.media_type : "Unknown");
	mime_type_text.innerText = claim_mime_type;
	preview_details_div.append(mime_type_text);

	//Price 
	let price = (claim.value.fee ? claim.value.fee.amount
		? claim.value.fee.amount 
		: "Free": "Free");
	let price_text = document.createElement("label");
	price_text.classList.add("price_text");
	price_text.innerText = (price === "Free" ? "Free" : "Fee: " +  price + " LBC");
	preview_details_div.append(price_text);

	if (claim.value.stream_type == "video" || claim.value.stream_type == "audio")
		thumbnail_div.append(duration_text);

	div.append(thumbnail_div);
	preview_info_div.append(title);
	if (channel_name && channel_name.innerText != "Unknown") {
		const channel_link = document.createElement("a");
		channel_link.href = "channel.html?url="+claim.signing_channel.permanent_url;
		channel_link.classList.add("channel_url");
		channel_link.append(channel_name);
		preview_info_div.append(channel_link);
	}
	preview_info_div.append(release_text);
	preview_info_div.append(preview_details_div);
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
	Object.keys(search_params).forEach((key) => {
		console.log(key);
		if (key.match("relative")) {
			let value = search_params[key];
			let date = new Date();
			let time = parseInt(date.getTime() / 1000);
			let time_side = value.side === "ago" ? -1 : 1;
			let check_word = value.side === "ago" ? "over" : "under";
			let prefix = value.direction == check_word ? '<' : ">";
			if (value.amount == 0) {
				search_params[value.real_param] = prefix + time;
				return
			}
			let time_type_in_seconds = 0;
			if (value.type === "hours") {
				time_type_in_seconds = 3600;
			} else if (value.type === "days") {
				time_type_in_seconds = 3600 * 24;
			} else if (value.type === "months") {
				time_type_in_seconds = 3600 * 24 * 30
			}
			let time_change = value.amount * time_type_in_seconds * time_side; 
			//time = `${prefix}${time - time_offset + time_change}`;
			time = `${prefix}${time + time_change}`;
			console.log(time);
			search_params[value.real_param] = time;
		}
	});
	doACall("claim_search", search_params, (response) => {
		addClaimsToList(response, channel_claim, search_params);

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
					addClaimsToList(response, channel_claim, search_params);
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
// Channel claim is optional
function addClaimsToList(obj, channel_claim, search_params) {

	let filtered_txids = JSON.parse(window.localStorage.getItem("filtered_outpoints"));
	const ul = document.querySelector("#claim_list");

	obj.result["items"].forEach((claim) => {
		// Sanitize data in "claim", just to be safe.
		claim = JSON.parse(cleanHTML(JSON.stringify(claim)));

		// If using channel filters and signature is invalid, don't show publishes
		if (claim.signing_channel && (search_params.channel_ids || search_params.channel) && !claim.is_channel_signature_valid) {
			return;
		}
		let isReposted = false;
		if (claim.value_type == "repost") {
			var repost_claim = claim;
			claim = claim.reposted_claim;
			isReposted = true;
			if(!claim)
				return;
		}

		// Check that claim isn't in filter or block list
		if (itemInArray(claim.txid, filtered_txids) || (claim.signing_channel && claim.signing_channel.txid ? itemInArray(claim.signing_channel.txid, filtered_txids) : false)) {
			//return;
		}
		
		// Just create this in somewhere
		const li = document.createElement("li");
		li.classList.add("claim_item");
		if (isReposted)
			li.classList.add("repost");
		if (!(!channel_claim || !claim.signing_channel || claim.signing_channel.claim_id != channel_claim.claim_id) || claim.is_channel_signature_valid === false) {
			li.classList.add("no_channel");
		} else if (!claim.value_type != "channel"){
			li.classList.add("has_channel");
		}



		const a = document.createElement("a");
		let preview_div = "";
		if (claim.value_type == "stream") {
			preview_div = createStreamClaimPreview(claim, channel_claim, isReposted, repost_claim);
			a.href = "video.html?url="+claim.permanent_url;
		} else if (claim.value_type == "channel") {
			preview_div = createChannelClaimPreview(claim, isReposted, repost_claim);
			a.href = "channel.html?url="+claim.permanent_url;
		} else if (claim.value_type == "collection") {
			preview_div = createCollectionClaimPreview(claim, channel_claim, isReposted, repost_claim);
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
			let json_viewer = ul.querySelector(".json_viewer");
			if (!json_viewer) {
				let json_div = document.createElement("div");
				json_div.classList.add("json_viewer");
				json_viewer = new JSONViewer();
				json_div.appendChild(json_viewer.getContainer());
				ul.insertBefore(json_div, hr_div.nextSibling);
				if (repost_claim)
					json_viewer.showJSON(repost_claim, -1, 1);
				else
					json_viewer.showJSON(claim, -1, 1);
			} else {
				json_viewer.remove();
			}
		});
		hr_div.append(hr);

		a.append(preview_div);
		li.append(a);
		ul.append(li);
		ul.append(hr_div);
	});
}

