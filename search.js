function getClaimTypeFromUrl(lbryUrl) {
		if (lbryUrl.match(new RegExp(".*@.*")) &&
				!lbryUrl.match(new RegExp(".*//.*/.*")))
				return "channel.html";
		else 
				return "video.html";
}


function createMostSupported(response, lbry_url) {
	let claim = response.result[lbry_url];
	if (claim.value_type === "repost")
		claim = claim.reposted_claim;
	if (txidIsFiltered(claim.txid) || (claim.signing_channel ? txidIsFiltered(claim.signing_channel.txid) : false)) {
		//return;
	}

	let data = claim.value;
	let community_choice_div = document.querySelector("#community_choice_div");
	a = document.querySelector("#community_choice_a");
	a.href = getClaimTypeFromUrl(claim.permanent_url)+"?url="+claim.permanent_url;
	let thumbnail_elem = document.createElement("img");
	let title_elem = document.createElement("h4");
	let release_time_elem = document.createElement("p");

	if (claim.value_type === "channel")
		thumbnail_elem.classList.add("channel");
	thumbnail_elem.src = (data.thumbnail ? data.thumbnail.url : "");
	title_elem.innerHTML = (data.title ? data.title : claim.name);
	release_time_elem.innerHTML = (data.release_time ? data.release_time : claim.meta.creation_timestamp);

	community_choice_div.append(thumbnail_elem);
	community_choice_div.append(title_elem);
	community_choice_div.append(release_time_elem);

	// Make cliking hr show/hide the claim JSON
	const hr_div = document.querySelector("#hr_div");
	const hr = document.createElement("hr");
	hr_div.addEventListener("click", () => {
		let json_viewer = document.querySelector("#main_div > .json_viewer");
		if (!json_viewer) {
			let json_div = document.createElement("div");
			json_div.classList.add("json_viewer");
			json_viewer = new JSONViewer();
			json_div.appendChild(json_viewer.getContainer());
			main_div.insertBefore(json_div, hr_div.nextSibling);
			json_viewer.showJSON(claim, -1, 1);
		} else {
			json_viewer.remove();
		}
	});
	hr_div.append(hr);

}


function search_main() {
	let url = new URL(document.URL);
	let search_term = url.searchParams.get("search_term");
	// If searhing for URL naviagte to page
	if (search_term.match(new RegExp("^lbry://.*"))) {
		let page = getClaimTypeFromUrl(search_term);
		window.location.replace(page+"?url="+search_term);
	}

	let lbry_url = "lbry://"+search_term.replace(/\s|"/g, "");
	doACall("resolve", {urls: lbry_url}, (response) =>{
			createMostSupported(response, lbry_url);
	});

	let search_params = {
		text: search_term,
		claim_type: "stream",
		has_source: true,
		order_by: "trending_score",
		no_totals: true
	}


	sendSearchParams(search_params);
}

search_main();

