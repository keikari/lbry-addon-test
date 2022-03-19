function category_main() {
	let category_name = document.URL.match(new RegExp(/.*category_name=(.*)/))[1];
	category_name = decodeURIComponent(category_name);
	let localStorage = window.localStorage;
	let search_params = localStorage.getItem("category_" + category_name);
	search_params = JSON.parse(search_params);

	if (category_name === "Following") {
		doACall("preference_get", {key: "local"}, (response) => {
			let subscriptions = response.result.local.value.subscriptions;
			let channel_ids = [];
			subscriptions.forEach( (channel) => {
				let channel_id = channel.match(/.*[#:]([a-fA-F0-9]{40})$/)[1];
				channel_ids.push(channel_id);
			});

			search_params = {
				channel_ids: channel_ids,
				remove_duplicates: true,
				order_by: "release_time"
			}
			sendSearchParams(search_params);

		});
	} else {
		sendSearchParams(search_params);
	}
}

category_main();

