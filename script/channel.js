
function setInfo(claim) {
	console.log(claim);

	let profile_img = (claim.value.thumbnail ? claim.value.thumbnail.url : "");
	let title = (claim.value.title ? claim.value.title : claim.name);

	let profile_img_elem = document.querySelector("#channel_thumbnail");
	profile_img_elem.src = profile_img;

	let title_elem = document.querySelector("#channel_title");
	title_elem.innerHTML = title;
	
}

function channel_main() {
	let lbryUrl = document.URL.match(new RegExp(/lbry:\/\/.*/))[0];
	lbryUrl = decodeURIComponent(lbryUrl);
	let channel = lbryUrl.match(new RegExp(/@.*/))[0];

	doACall("resolve", {urls: lbryUrl}, (response) => {
			search_params = {
				channel: channel,
				order_by: "release_time",
			};
			let channel_claim = response.result[lbryUrl];
			setInfo(channel_claim);
			sendSearchParams(search_params, channel_claim);

	});
}

channel_main();

