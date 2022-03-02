
function sendSearchParams(search_params, channel_claim) {
	search_params.page = 1;
	search_params.has_source = true;
	if (!search_params.not_tags)
		search_params.not_tags = [];
	search_params.not_tags = search_params.not_tags.concat(["porn","porno","nsfw","mature","xxx","sex","creampie","blowjob","handjob","vagina","boobs","big boobs","big dick","pussy","cumshot","anal","hard fucking","ass","fuck","hentai"]);
	doACall("claim_search", search_params, (response) => {
		addClaimsToList(response, channel_claim, search_params);
	});
	window.onscroll = () => {
		if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
			search_params.page++;
			doACall("claim_search", search_params, (response) => {
				// Stop looking for more claims when there aren't any
				if (response.result.items.length == 0)
					window.onscroll = null;
				addClaimsToList(response, channel_claim, search_params);
			});
		}
	}
}
// Channel claim is optional
function addClaimsToList(obj, channel_claim, search_params) {

	let filtered_txids = JSON.parse(window.localStorage.getItem("filtered_outpoints"));
	const ul = document.querySelector("#claim_list");

	obj.result["items"].forEach((claim) => {
		// If using channel filters and signature is invalid, don't show publishes
		if (claim.signing_channel && (search_params.channel_ids || search_params.channel) && !claim.is_channel_signature_valid) {
			return;
		}
		let reposted = false;
		if (claim.value_type == "repost") {
			var repost_claim = claim;
			claim = claim.reposted_claim;
			reposted = true;
			if(!claim)
				return;
		}

		if (itemInArray(claim.txid, filtered_txids) || (claim.signing_channel && claim.signing_channel.txid ? itemInArray(claim.signing_channel.txid, filtered_txids) : false)) {
			return;
		}
		
		// Just create this in somewhere
		const li = document.createElement("li");
		li.classList.add("claim_item");

		const a = document.createElement("a");
		if (claim.value_type != "channel")
			a.href = "video.html?url="+claim.permanent_url;
		else 
			a.href = "channel.html?url="+claim.permanent_url;
		a.onclick = () => {
			window.localStorage.setItem(claim.claim_id, JSON.stringify(claim)); // Decoding from link is necessary
		}
		const div = document.createElement("div");
		div.classList.add("preview_div");
		const thumbnail_div = document.createElement("div");
		thumbnail_div.classList.add("thumbnail_div");
		const thumbnail = document.createElement("img");
		let thumbnail_url = (claim.value.thumbnail ? claim.value.thumbnail.url : "") ;
		thumbnail.src = thumbnail_url;
		const preview_info_div = document.createElement("div");
		preview_info_div.classList.add("preview_info_div");
		const title = document.createElement("h3");
		title.classList.add("title");
		title.innerHTML = claim.value.title;
		let channel_name = null;
		// Don't print channel name on channel's page
		if (!channel_claim || !claim.signing_channel || claim.signing_channel.claim_id != channel_claim.claim_id) {
			channel_name = document.createElement("h4");
			channel_name.classList.add("channel_name");
			channel_name.innerHTML = (claim.signing_channel ? (claim.signing_channel.name ? claim.signing_channel.name : "Unknown") : "Unknown");
		} else {
			li.classList.add("no_channel");
		}

		//Create details div
		let preview_details_div = document.createElement("div");
		preview_details_div.classList.add("preview_details_div");
		// Release time
		let release_text = document.createElement("p");
		release_text.classList.add("release_time");
		release_text.innerHTML = timeDifference(
			Math.floor(Date.now()/1000),
			(claim.value.release_time ? claim.value.release_time : claim.meta.creation_timestamp)
		);
		//Size
		let size_text = document.createElement("label");
		let size = (claim.value.source ? claim.value.source.size : "?");
		size_text.innerHTML = (size/1000000000 >= 1 ? (size/1000000000).toFixed(2) + " GB" : (size/1000000).toFixed(2) + " MB");
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
			duration_text.innerHTML = date.toISOString().substr(str_start,str_length);
			var byterate_text = document.createElement("label");
			let byterate = 0;
			if (duration > 0)
				byterate = ((size/1000000)/duration).toFixed(2);

			byterate_text.innerHTML = byterate + "MB/s";
			preview_details_div.append(byterate_text);
		}
		//Media type
		let mime_type_text = document.createElement("label");
		mime_type_text.classList.add("mime_type_text");
		let claim_mime_type = (claim.value.source ? claim.value.source.media_type : "Unknown");
		mime_type_text.innerHTML = claim_mime_type;
		preview_details_div.append(mime_type_text);

		//Price 
		let price = (claim.value.fee ? claim.value.fee.amount
			? claim.value.fee.amount 
			: "Free": "Free");
		let price_text = document.createElement("label");
		price_text.classList.add("price_text");
		price_text.innerHTML = (price === "Free" ? "Free" : price + " LBC");
		price_text.style = "float: right; margin-right: 5px; text-align:right";
		preview_details_div.append(price_text);

		// Repost info
		if (reposted) {
			let repost_channel_name = ( repost_claim.signing_channel ? repost_claim.signing_channel.name : "Unknown" );
			let repost_channel_url = ( repost_claim.signing_channel ? repost_claim.signing_channel.permanent_url : null );
			let repost_text_div = document.createElement("div");
			repost_text_div.classList.add("repost_text_div");
			let a = document.createElement("a");
			if (repost_channel_url)
				a.href = `channel.html?url=${repost_channel_url}`;
			a.innerHTML = repost_channel_name;
			let repost_label = document.createElement("lable");
			repost_label.innerHTML = "Reposted by ";
			repost_label.append(a);
			repost_text_div.append(repost_label);
			preview_info_div.insertBefore(repost_text_div, preview_info_div.firstChild);

			li.classList.add("repost");

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

		thumbnail_div.append(thumbnail);
		if (claim.value.stream_type == "video" || claim.value.stream_type == "audio")
			thumbnail_div.append(duration_text);
		div.append(thumbnail_div);
		preview_info_div.append(title);
		if (channel_name && channel_name.innerHTML != "Unknown") {
			const channel_link = document.createElement("a");
			channel_link.href = "channel.html?url="+claim.signing_channel.permanent_url;
			channel_link.classList.add("channel_url");
			channel_link.append(channel_name);
			preview_info_div.append(channel_link);
		}
		preview_info_div.append(release_text);
		preview_info_div.append(preview_details_div);
		div.append(preview_info_div);
		a.append(div);
		li.append(a);
		ul.append(li);
		ul.append(hr_div);
	});
}

