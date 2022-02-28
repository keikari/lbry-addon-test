let search_params = {};
let not_tags = [];
let server = "http://localhost:5279";
let xhr = new XMLHttpRequest();

function loadCategory() {
	let text_area = document.querySelector("textarea");
	let category = "";
	let category_name = "";
	let category_params = "";
	if (text_area.value) {
		category = JSON.parse(text_area.value);
		category_name = category.category_name;
		category_params = category.category;
	}

	// Clear old entries
	let option_previews = document.querySelectorAll(".preview_option");
	option_previews.forEach( (preview) => {
		let e = new Event("click");
		if (preview.childNodes.length > 1){
			preview = preview.childNodes[0];
		}
		preview.dispatchEvent(e) 
	});
	let inputs = document.querySelectorAll("input");
	inputs.forEach((input) => {
		if (input.type === "checkbox")
			input.checked = false;
	});
	search_params = {};

	Object.keys(category_params).forEach( (key) => {
		console.log(key + ": " + category_params[key]);
		let value = category_params[key];

		// Deal with claim type check boxes
		if ( key == "claim_type" ) {
			let checkBoxes = document.querySelectorAll("#claim_type_check_box");
			value.forEach((item) => {
				checkBoxes.forEach((checkBox) => {
					if (checkBox.name == item) {
						checkBox.click();
					}
				});
			});
			return;
		}

		// Normal flow for most cases	
		let element = document.querySelector("#"+key);
		if (element){
			let e = "";
			if (element.id == "order_by") {
				e = new Event("change");
			} else if (element.type == "checkbox") { 
				// Deal with on/off params in this block
				e = new Event("click");
				element.checked = value;
				element.dispatchEvent(e);
			} else { 
				e = new Event("keyup");
				e.keyCode = 13;
			}
			if ( Array.isArray(value) ){
				value.forEach( (item) => {
					if (element.id == "order_by") {
						if (item[0] == '^') { 
							item = item.substr(1);
							element.is_ascending = true; // This is set to false after used in getOrderBy()
						} 
					}
					element.value = item;
					element.dispatchEvent(e);
				});
			} else {
				if (element.id.match("amount"))
					element.value = value / 100000000;
				else
					element.value = value;
				element.dispatchEvent(e);
			}
		}
	});
	document.querySelector("#category_name").value = category_name;
}

function exportCategory() {
	let category_text = document.querySelector("textarea");
	let localStorage = window.localStorage;
	let category_name = this.value;
	if (category_name) {
		let category = JSON.parse(localStorage.getItem("category_" + category_name));
		category = JSON.stringify({
			category_name: category_name,
			category: category});
		category_text.value = category;
	} else 
		category_text.value = "";
}

function populateCategorySelector(selector_id) {
	let localstorage = window.localStorage;
	let selector = document.querySelector(selector_id);
	let value = selector.value;
	selector.innerHTML = "";

	let category_names = JSON.parse(window.localStorage.getItem("category_names"));
	// Insert one empty option
	let option = document.createElement("option");
	option.value = "";
	option.innerHTML = "";
	selector.append(option);
	if (category_names) {
		category_names.forEach((name) => {
			option = document.createElement("option");
			option.value = name;
			option.innerHTML = name;
			selector.append(option);
		});
	}
	selector.addEventListener("change", exportCategory);

}

function openPopUp() {
	let pop_up = document.querySelector("#import_export_div");	
	pop_up.hidden = false;
	populateCategorySelector("#pop_up_category_selector");

}


function hidePopUp() {
	let pop_up = document.querySelector("#import_export_div");
	pop_up.hidden = true;

}

function getText(e, elem) {
	if (e.keyCode === 13) {
		let text = elem.value;

		if (text) {
			// Convert from LBC to 1/100,000,000 LBC
			if (elem.classList.contains("is_amount")) {
				let first_char = elem.value.substr(0,1);
				if (first_char * 1 ) 
					text = (elem.value * 100000000).toString();
				else
					text = first_char + (elem.value.substr(1) * 100000000).toString();
			}
			search_params[elem.id] = text;
			text = elem.value;
			let preview_text = document.createElement("label");
			preview_text.classList.add("preview_option");
			preview_text.innerHTML = text + " X";
			preview_text.onclick = () => {
				search_params[elem.id] = null;
				preview_text.remove();
				elem.hidden = false;
				elem.focus();

			};
			elem.hidden = true;
			inputs_div.insertBefore(preview_text, elem); 
		}
	}
}

function getNumber(e, elem) {
	if (e.keyCode === 13) {
		//let elem = document.querySelector(elem_id);
		let text = elem.value;
		if (text) {
			search_params[elem.id] = parseInt(text);
			let preview_text = document.createElement("label");
			preview_text.classList.add("preview_option");
			preview_text.innerHTML = text + " X";
			preview_text.onclick = () => {
				search_params[elem.id] = null;
				preview_text.remove();
				elem.hidden = false;
				elem.focus();

			};
			elem.hidden = true;
			inputs_div.insertBefore(preview_text, elem); 
		}
	}
}

function getChannelUrl(e) {
	if (e.keyCode === 13) {
		let text = this.value;
		let rx_claim_id = /^[0-9A-Fa-f]{40}$/;
		let rx_resolvable = /(^lbry:\/\/@[^\/\s@:#]+([:#]?[0-9A-Fa-f]{0,40})?$)|(^@[^\/@:#\s]+[:#]?[0-9A-Fa-f]{0,40}$)/;
		let json = {};
		if (text.match(rx_resolvable)) {
			json = {method: "resolve", params: { urls: text}};
		} else if (text.match(rx_claim_id)) {
			json = {method: "claim_search", params: { claim_id: text }};
		} else {
			text = "@" + text;
			json = {method: "resolve", params: { urls: text}};
		}
		doACall(json.method, json.params, (response) => {
			let obj = response.result;			
			console.log(obj);
			let lbry_url = (obj[text] ? obj[text].permanent_url
				:	obj.items[0] ? obj.items[0].permanent_url 
				: null);
			console.log(lbry_url);
			if (lbry_url) {
				let channel_list = (search_params[this.id] ? search_params[this.id] : []);
				let claim_id = lbry_url.match(/[0-9A-Fa-f]{40}$/)[0];
				if (!channel_list.includes(claim_id)) {
					channel_list.push(claim_id);
					search_params[this.id] = channel_list;

					let preview_text = document.createElement("label");
					preview_text.classList.add("preview_option");
					preview_text.innerHTML = lbry_url + " X";
					preview_text.onclick = () => {
						preview_text.remove();
						console.log("id: " + this.id);
						search_params[this.id].splice(search_params[this.id].indexOf(claim_id), 1);
					};
					this.value = "";
					inputs_div.insertBefore(preview_text, this.nextSibling); 

				}
				console.log(search_params[this.id]);
			}
		});
	}
}

function getOrderBy() {
	let text = this.value;
	if (text != "empty") {
		let order_bys = (search_params.order_by ? search_params.order_by : []);
		order_bys.push(text)
		search_params.order_by = order_bys;

		let entry_div = document.createElement("div");
		let preview_text = document.createElement("label");
		let order_button = document.createElement("button");

		if (this.is_ascending) {
			this.is_ascending = false;
			preview_text.innerHTML = "^" + text + " X";
			preview_text.value = "^" + text;
			order_button.innerHTML = "ASC";
		} else {
			preview_text.innerHTML = text + " X";
			preview_text.value = text;
			order_button.innerHTML = "DESC";
		}
		entry_div.classList.add("preview_option");
		order_button.id = "order_button";
		order_button.onclick = () => {
			console.log(search_params);
			for (let i = 0; i < search_params.order_by.length; i++) {
				let order_by = search_params.order_by[i];
				let desc_order = text;
				let asc_order = "^" + text;
				let order = "";
				if (order_by == desc_order){
					order =  asc_order;
					order_button.innerHTML = "ASC";
				} else if (order_by == asc_order) {
						order =  desc_order;
						order_button.innerHTML = "DESC";
				} else {
					continue;
				}
					search_params.order_by[i] = order;
					preview_text.value = order;
					preview_text.innerHTML = order + " X";
					return;
			}
		}

		let options = document.querySelectorAll("#order_by > option");
		preview_text.onclick = () => {
			search_params.order_by.splice(search_params.order_by.indexOf(preview_text.value), 1);
			preview_text.remove();
			order_button.remove();
			entry_div.remove();
			options.forEach((option) => {
			if (option.text == text)
					option.hidden = false;
		});

		};
		entry_div.append(preview_text);
		entry_div.append(order_button);
		inputs_div.insertBefore(entry_div, this.nextSibling); 
		this.value = "empty";
		options.forEach((option) => {
			if (option.text == text)
				option.hidden = true;
		});
	}
}


function getClaimType() {
	let claim_types = (search_params.claim_type ? search_params.claim_type : []);
	if (this.checked && !claim_types.includes(this.name)){
		claim_types.push(this.name);
	} else if (!this.checked) {
		claim_types.splice(claim_types.indexOf(this.name), 1);
	}
	search_params.claim_type = claim_types;
}


function getTextArray(e, elem) {
	if (e.keyCode === 13) {
		let text = elem.value;
		let search_param = elem.id;
		if (text) {
			let array_items = search_params[search_param] ? search_params[search_param] : [];
			if (!array_items.includes(text)) {
				array_items.push(text);
				search_params[search_param] = array_items;
				let preview_text = document.createElement("label");
				preview_text.classList.add("preview_option");
				preview_text.innerHTML = text + " X";
				preview_text.onclick = () => {
					preview_text.remove();
					search_params[search_param].splice(search_params[search_param].indexOf(text), 1);
					elem.focus();
				};
				inputs_div.insertBefore(preview_text, elem.nextSibling); 
				elem.value = "";
			}
		}
	}
}

function getCheckBox() {
	search_params[this.id] = this.checked;	
}

function doSearch() {
		document.querySelector("#claim_list").innerHTML = "";
		sendSearchParams(search_params);
}

function saveCategory() {
	let localStorage = window.localStorage;
	let category_name_input = document.querySelector("#category_name");
	let category_name = category_name_input.value;
	delete search_params.page; // Page is only used for testing, doesn't need to be saved
	if (category_name) {
		let category_names = JSON.parse(localStorage.getItem("category_names"));
		if (!category_names)
			category_names = [];
		category_names.push(category_name);
		category_names.sort();
		localStorage.setItem("category_names", JSON.stringify(category_names));
		localStorage.setItem("category_" + category_name, JSON.stringify(search_params));
		category_name_input.value = "";
	}

}

function main() {
	let inputs_div = document.querySelector("#inputs_div");
	if (!inputs_div) {
		setTimeout(main, 100);
		return;
	}

	// Set export/import button
	let open_pop_up_button = document.querySelector("#import_export_category_button");
	open_pop_up_button.onclick = openPopUp;

	// Set div buttons

	let import_category_button = document.querySelector("#import_category_button");
	import_category_button.onclick = loadCategory;


	let x_button = document.querySelector("#hide_button");
	x_button.onclick = hidePopUp;


	let getTextInputs = document.querySelectorAll(".get_text");
	getTextInputs.forEach( (input) => {
		input.addEventListener("keyup", (e) => getText(e, input));
	});

	let getIntInputs = document.querySelectorAll(".get_int");
	getIntInputs.forEach( (input) => {
		input.addEventListener("keyup", (e) => getNumber(e, input));
	});

	let getTextArrayInputs = document.querySelectorAll(".get_text_array");
	getTextArrayInputs.forEach( (input) => {
		input.addEventListener("keyup", (e) => getTextArray(e, input));
	});

	let getCheckBoxInputs = document.querySelectorAll(".get_check_box");
	getCheckBoxInputs.forEach( (input) => {
		input.addEventListener("click", getCheckBox)
	});

	//Get channel_ids
	let channel_input = document.querySelector("#channel_ids");
	channel_input.addEventListener("keyup", getChannelUrl);

	let not_channel_input = document.querySelector("#not_channel_ids");
	not_channel_input.addEventListener("keyup", getChannelUrl);

	// Get order_by
	let order_by_selector = document.querySelector("#order_by");
	order_by_selector.addEventListener("change", getOrderBy);

	//Get claim type
	let claim_type_check_boxes = document.querySelectorAll("#claim_type_check_box");
	claim_type_check_boxes.forEach((check_box) => {
		check_box.addEventListener("click", getClaimType);
	});


	// Set test button
	let test_button = document.querySelector("#test_button");
	test_button.onclick = doSearch;

	// Set save button
	let save_button = document.querySelector("#save_button");
	save_button.onclick = saveCategory;

}
main();
