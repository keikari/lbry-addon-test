let lbryUrl = document.URL.match(new RegExp(/lbry:\/\/.*/))[0];
lbryUrl = decodeURIComponent(lbryUrl);
let channel = lbryUrl.match(new RegExp(/@.*/))[0];
let server = "http://localhost:5279";
let channel_claim = {};
let page = 1;


function setInfo(obj) {
	obj = obj.result[lbryUrl];
	channel_claim = obj;
	console.log(obj);

	let profile_img = (obj.value.thumbnail ? obj.value.thumbnail.url : "");
	let title = (obj.value.title ? obj.value.title : obj.name);

	let profile_img_elem = document.querySelector("#channel_thumbnail");
	profile_img_elem.src = profile_img;

	let title_elem = document.querySelector("#channel_title");
	title_elem.innerHTML = title;
	
}

let xhr2 = new XMLHttpRequest();
xhr2.open("POST", server, true);
xhr2.onreadystatechange = function() {
	if (xhr2.readyState === 4 && xhr2.status === 200) {
		search_params = {
			"channel": channel,
			"order_by": "release_time",
			"page": page++
		}
		let obj = JSON.parse(xhr2.response);
		setInfo(obj);
		sendSearchParams(search_params, obj.result[lbryUrl])
		
	}
};
xhr2.send(JSON.stringify({
	method: "resolve",
	params: {
		"urls": lbryUrl}
}));

