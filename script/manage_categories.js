var default_category = {
	use_default_not_tags: true,
};
var category_search_params = Object.assign({}, default_category);

function deleteCategory() {
	let localStorage = window.localStorage;
	let text_area = document.querySelector("textarea");
	if (text_area.value) {
		let	category = JSON.parse(text_area.value);
		let category_list = JSON.parse(localStorage.getItem("category_names"));
		category_list.splice(category_list.indexOf(category.category_name), 1);
		localStorage.setItem("category_names", JSON.stringify(category_list));
		localStorage.removeItem(`category_${category.category_name}`);

		if (category.category_name != "") {
			addNotification(`Deleted category ${category.category_name}`, 3000);
		}
	}
}
function loadCategory() {
	let text_area = document.querySelector("textarea");
	if (text_area.value) {
		let	category = JSON.parse(text_area.value);
		fillFormFields(category);
	}
}

function getTimeParamAndType(category_params) {
	let time_params = ["release_time", "timestamp", "creation_timestamp"];
	for (let i = 0; i < time_params.length; i++) {
		let time_param = time_params[i]
		if (category_params[`relative_${time_param}`]) {
			return {time_param: time_param, time_type: "relative_time"};
		} else if (category_params[time_param]) {
			return {time_param: time_param, time_type: "unix_time"};
		}
	}
	return null;
}

function openTimeInputField(time_type, time_param) {
	let time_input_toggles = document.querySelectorAll(".time_span_toggle");
	time_input_toggles.forEach((toggle) => {
		let toggle_time_param = toggle.parentElement.id;
		let toggle_time_type = toggle.getAttribute("time_type");
		if (time_param == toggle_time_param && time_type == toggle_time_type) {
			toggle.click();
		}
	});
}
function handleTimeInputField(category_params) {
	let time_type_and_param = getTimeParamAndType(category_params);
	if (time_type_and_param === null) {
		return;
	}
	let time_type = time_type_and_param.time_type;
	let time_param = time_type_and_param.time_param;
	openTimeInputField(time_type, time_param);

	let time_input_div = document.querySelector(`.time_input.${time_param}`);
	console.log(time_type);
	if (time_type === "unix_time") {
		let time_input = time_input_div.querySelector("input");
		time_input.value = category_params[time_param];
	} else if (time_type === "relative_time") {
		let relative_time_params = category_params[`relative_${time_param}`];
		let time_detail_selectors = time_input_div.querySelectorAll("select");
		let time_amount_input = time_input_div.querySelector("input");
		time_amount_input.value = relative_time_params.amount;
		time_detail_selectors.forEach((selector) => {
			Object.keys(relative_time_params).forEach( (key) => {
				if (selector.classList.contains(`time_${key}`)) {
					selector.value = relative_time_params[key];
				}
			});
		});
	}
	let time_set_btn = time_input_div.querySelector("button");
	time_set_btn.click();
}

function fillFormFields(category) {
	console.log(category);
	category_name = category.category_name;
	category_params = category.category ? category.category : category;
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
	category_search_params = {};

	// Only able to handle one time type (release, creation, last-updated)
	handleTimeInputField(category_params);

	Object.keys(category_params).forEach( (key) => {
		console.log(key + ": " + category_params[key]);
		let value = category_params[key];

		// Deal with claim type check boxes
		if ( key == "claim_type" ) {
			let checkBoxes = document.querySelectorAll(".claim_type_check_box");
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
				if (element.id.match("amount") && element.id != "fee_amount") {
					let value_prefix = "";
					if (isNaN(value)) {
						let rx = /([<>=]{0,2})([0-9]+)/;
						[_, value_prefix, value] = value.match(rx);
					}
					element.value = `${value_prefix}${value / 100000000}`;
				} else {
					element.value = value;
				}
				element.dispatchEvent(e);
			}
		}
	});
	console.log(category_name);
	if (category_name != "_temp_") {
		document.querySelector("#category_name").value = category_name;
	}
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
		category_text.value = '{"category_name":"","category":{}}';
}

function populateCategorySelector(selector_id) {
	let localstorage = window.localStorage;
	let selector = document.querySelector(selector_id);
	let value = selector.value;
	selector.innerText = "";

	let category_names = JSON.parse(window.localStorage.getItem("category_names"));
	// Insert one empty option
	let option = document.createElement("option");
	option.value = "";
	option.innerText = "";
	selector.append(option);
	if (category_names) {
		category_names.forEach((name) => {
			option = document.createElement("option");
			option.value = name;
			option.innerText = name;
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

function convertAmountToDewies(amount) {
	let dewies = 0;
	let first_char = amount.substr(0,1);
	if (first_char * 1)
		dewies = (amount * 100000000).toString();
	else
		dewies = first_char + (amount.substr(1) * 100000000).toString();

	return dewies;
}

function getText(e, elem) {
	if (e.keyCode === 13) {
		let text = elem.value;

		if (text) {
			// Convert from LBC to 1/100,000,000 LBC
			if (elem.classList.contains("is_amount")) {
				text = convertAmountToDewies(text);
			}
			category_search_params[elem.id] = text;
			let preview_text = document.createElement("label");
			preview_text.classList.add("preview_option");
			preview_text.innerText = text + " X";
			preview_text.onclick = () => {
				category_search_params[elem.id] = null;
				preview_text.remove();
				elem.style.visibility = "";
				elem.style.height = "";
				elem.focus();
			};
			elem.style.visibility = "hidden";
			elem.style.height = 0;
			elem.parentElement.insertBefore(preview_text, elem); 
		}
	}
}

function getNumber(e, elem) {
	if (e.keyCode === 13) {
		let text = elem.value;
		if (text) {
				category_search_params[elem.id] = parseInt(text);
			let preview_text = document.createElement("label");
			preview_text.classList.add("preview_option");
			preview_text.innerText = text + " X";
			preview_text.onclick = () => {
				category_search_params[elem.id] = null;
				preview_text.remove();
				elem.hidden = false;
				elem.focus();

			};
			elem.hidden = true;
			elem.parentElement.insertBefore(preview_text, elem); 
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
			let claim = (obj[text] ? obj[text]
				:	obj.items[0] ? obj.items[0]
				: null);
			console.log(claim);
			if (claim == null || !claim.error) {
				let channel_list = (category_search_params[this.id] ? category_search_params[this.id] : []);
				let claim_id = claim?.permanent_url.match(/[0-9A-Fa-f]{40}$/)[0] || text;
				if (!channel_list.includes(claim_id)) {
					channel_list.push(claim_id);
					category_search_params[this.id] = channel_list;

					let preview_text = document.createElement("label");
					preview_text.classList.add("preview_option");
					if (claim) {
						preview_text.innerText = claim.short_url.replace('#', ':').substr(7) + " X";
					} else {
						preview_text.innerText = claim_id + " X";
					}
					preview_text.onclick = () => {
						preview_text.remove();
						console.log("id: " + this.id);
						category_search_params[this.id].splice(category_search_params[this.id].indexOf(claim_id), 1);
					};
					this.value = "";
					this.parentElement.insertBefore(preview_text, this.nextSibling); 
				} else {
					addNotification(`"${claim.short_url.replace('#', ':').substr(7)}" already in list`, 3000);
				}
				console.log(category_search_params[this.id]);
			} else {
				addNotification(claim.error.text, 3000);
			}
		});
	}
}

function getOrderBy() {
	let text = this.value;
	if (text != "empty") {
		let order_bys = (category_search_params.order_by ? category_search_params.order_by : []);
		order_bys.push(text)
		category_search_params.order_by = order_bys;

		let entry_div = document.createElement("div");
		let preview_text = document.createElement("label");
		let order_button = document.createElement("button");

		if (this.is_ascending) {
			this.is_ascending = false;
			text = text;
			preview_text.innerText = "^" + text + " X";
			preview_text.value = "^" + text;
			order_button.innerText = "ASC";
		} else {
			preview_text.innerText = text + " X";
			preview_text.value = text;
			order_button.innerText = "DESC";
		}
		entry_div.classList.add("preview_option");
		order_button.id = "order_button";
		order_button.onclick = () => {
			console.log(category_search_params);
			for (let i = 0; i < category_search_params.order_by.length; i++) {
				let order_by = category_search_params.order_by[i];
				let desc_order = text;
				let asc_order = "^" + text;
				let order = "";
				if (order_by == desc_order){
					order =  asc_order;
					order_button.innerText = "ASC";
				} else if (order_by == asc_order) {
						order =  desc_order;
						order_button.innerText = "DESC";
				} else {
					continue;
				}
					category_search_params.order_by[i] = order;
					preview_text.value = order;
					preview_text.innerText = order + " X";
					return;
			}
		}

		let options = document.querySelectorAll("#order_by > option");
		preview_text.onclick = () => {
			category_search_params.order_by.splice(category_search_params.order_by.indexOf(preview_text.value), 1);
			preview_text.remove();
			order_button.remove();
			entry_div.remove();
			options.forEach((option) => {
			if (option.text == text) {
					option.hidden = false;
			}
		});

		};
		entry_div.append(preview_text);
		entry_div.append(order_button);
		this.parentElement.insertBefore(entry_div, this.nextSibling); 
		this.value = "empty";
		options.forEach((option) => {
				console.log(text);
			if (option.text == text) {
				option.hidden = true;
			}
		});
	}
}


function getClaimType() {
	let claim_types = (category_search_params.claim_type ? category_search_params.claim_type : []);
	if (this.checked && !claim_types.includes(this.name)){
		claim_types.push(this.name);
	} else if (!this.checked) {
		claim_types.splice(claim_types.indexOf(this.name), 1);
	}
	category_search_params.claim_type = claim_types;
}


function getTextArray(e, elem) {
	if (e.keyCode === 13) {
		let text = elem.value;
		let search_param = elem.id;
		if (text) {
			if (elem.classList.contains("is_amount")) {
				text = convertAmountToDewies(text);
			}
			let array_items = category_search_params[search_param] ? category_search_params[search_param] : [];
			if (!array_items.includes(text)) {
				array_items.push(text);
				category_search_params[search_param] = array_items;
				let preview_text = document.createElement("label");
				preview_text.classList.add("preview_option");
				preview_text.innerText = text + " X";
				preview_text.onclick = () => {
					preview_text.remove();
					category_search_params[search_param].splice(category_search_params[search_param].indexOf(text), 1);
					elem.focus();
				};
				elem.parentElement.insertBefore(preview_text, elem.nextSibling); 
				elem.value = "";
			} else {
				addNotification(`"${text}" already in list`, 3000);
			}
		}
	}
}

function getCheckBox() {
	category_search_params[this.id] = this.checked;
}

function doSearch(category_params = null) {
	document.querySelector("#claim_list").innerText = "";
	console.log(category_search_params);
	if (category_params === null) {
		category_params = category_search_params;
		category_params.page = 1;
	}
	sendSearchParams(category_params, {}, true);
}

function saveCategory(is_temp_category = false) {
	let localStorage = window.localStorage;
	let category_name = "";
	let category_name_input = document.querySelector("#category_name");
	console.log(is_temp_category);
	if (!is_temp_category) {
		category_name = category_name_input.value;
		delete category_search_params.page; // Page is only used for testing, doesn't need to be saved
	} else {
		category_name = "_temp_";
		console.log(category_search_params);
	}
	if (category_name) {
		let category_names = JSON.parse(localStorage.getItem("category_names"));
		let action = "Updated";
		if (!category_names) {
			category_names = [];
		}
		if (!category_names.includes(category_name)) {
			action = "Saved";
			category_names.push(category_name);
			category_names.sort();
		}
		localStorage.setItem("category_names", JSON.stringify(category_names));
		localStorage.setItem("category_" + category_name, JSON.stringify(category_search_params));
		if (!is_temp_category) {
			addNotification(`${action} "${category_name}"`, 2000); 
		}
	}
}

function createTimeLabel(param) {
	let preview_text = document.createElement("label");
	preview_text.classList.add("preview_option");
	preview_text.classList.add(param.replace("relative_", ""));
	let text = category_search_params[param];

	let prefix = "";
	let value = category_search_params[param]; 
	if (isNaN(category_search_params[param]) && !(category_search_params[param] instanceof Object)) {
		prefix = value.substr(0,1);
		value = parseInt(value.substr(1));
	}
	let date = new Date(value*1000);
	let timezone_offset = date.getTimezoneOffset() * 60;
	if (param.match("relative"))
	{
		text = `${value.direction} ${value.amount} ${value.type} ${value.side}`;
	} else if ((value - timezone_offset) % (60 * 60 * 24) === 0) {
		text = date.toLocaleString();
	}
	preview_text.innerText = text + " X";
	preview_text.onclick = () => {
		preview_text.remove();
		delete category_search_params[param]
	};

	return preview_text;
}

function createTimeInput(time_type, time_param) {
	//Delete existing time input for param
	try {
		document.querySelector(`.time_input.${time_param}`).remove();
	} catch {}

	let time_input_div = document.createElement("div");
	time_input_div.classList.add("time_input"); 
	time_input_div.classList.add(time_param); 
	let label = document.createElement("label");
	let confirm_btn = document.createElement("button");
	confirm_btn.innerText = "Set";
	if (time_type === "relative_time") {
		label.innerText = "Relative time:";

		let time_direction_input = document.createElement("select");
		let time_direction_options = ["over", "under"];
		time_direction_input.classList.add("time_direction");
		time_direction_options.forEach(time_option => {
			let option = document.createElement("option");
			option.value = time_option;
			option.innerText = time_option;
			time_direction_input.append(option);
		});
		
		let time_amount_input = document.createElement("input");
		time_amount_input.type = "text";
		time_amount_input.classList.add("time_amount");
		
		let time_type_input = document.createElement("select");
		let time_options = ["hours", "days", "months", "years"];
		time_type_input.classList.add("time_type");
		time_options.forEach(time_option => {
			let option = document.createElement("option");
			option.value = time_option;
			option.innerText = time_option;
			time_type_input.append(option);
		});

		let time_side_input = document.createElement("select");
		let time_side_options = ["ago", "to release"];
		time_side_input.classList.add("time_side");
		time_side_options.forEach(time_option => {
			let option = document.createElement("option");
			option.value = time_option;
			option.innerText = time_option;
			time_side_input.append(option);
		});

		confirm_btn.onclick = () => {
			let amount = time_amount_input.value;
			let type = time_type_input.value;
			let direction = time_direction_input.value;
			let side = time_side_input.value;
			category_search_params[`relative_${time_param}`] = { 
				amount: amount,
				type: type,
				direction: direction,
				side: side,
				real_param: time_param
			}
			console.log(category_search_params);
			let preview_text = createTimeLabel(`relative_${time_param}`);
			time_type_label.parentElement.insertBefore(preview_text, time_type_label.nextSibling);
			time_input_div.remove();
		}
		time_input_div.append(label);
		time_input_div.append(time_direction_input);
		time_input_div.append(time_amount_input);
		time_input_div.append(time_type_input);
		time_input_div.append(time_side_input);

	} else if (time_type === "fixed_time") {
		label.innerText = "Fixed time:";

		let time_direction_input = document.createElement("select");
		let time_direction_options = ["since", "before"];
		time_direction_input.classList.add("time_direction");
		time_direction_options.forEach(time_option => {
			let option = document.createElement("option");
			option.value = time_option;
			option.innerText = time_option;
			time_direction_input.append(option);
		});

		let time_date_input = document.createElement("input");
		time_date_input.type = "date";

		confirm_btn.onclick = () => {
			let prefix = time_direction_input.value === "since" ? '>' : '<';
			let date_offset = new Date(time_date_input.valueAsNumber).getTimezoneOffset() * 60;
			let time = (time_date_input.valueAsNumber/1000) + date_offset;
			category_search_params[time_param] = prefix + time;
			console.log(category_search_params);
			let preview_text = createTimeLabel(time_param);
			time_type_label.parentElement.insertBefore(preview_text, time_type_label.nextSibling);
			time_input_div.remove();
		};
		time_input_div.append(label);
		time_input_div.append(time_direction_input);
		time_input_div.append(time_date_input);

	} else if (time_type === "unix_time") {
		label.innerText = "Unix time:";
		let time_input = document.createElement("input");
		confirm_btn.onclick = () => {
			category_search_params[time_param] = time_input.value;
			console.log(category_search_params);
			let preview_text = createTimeLabel(time_param);
			time_type_label.parentElement.insertBefore(preview_text, time_type_label.nextSibling);
			time_input_div.remove();
		};
		time_input_div.append(label);
		time_input_div.append(time_input);

	}
	let time_type_label = document.querySelector(`#${time_param}`);
	time_input_div.append(confirm_btn);
	time_type_label.parentElement.insertBefore(time_input_div, time_type_label.nextSibling);

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

	let delete_btn = document.querySelector("#delete_button");
	delete_button.onclick = deleteCategory;


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
	let claim_type_check_boxes = document.querySelectorAll(".claim_type_check_box");
	claim_type_check_boxes.forEach((check_box) => {
		check_box.addEventListener("click", getClaimType);
	});

	//Get time inputs
	let time_input_toggles = document.querySelectorAll(".time_span_toggle");
	time_input_toggles.forEach((toggle) => {
		let time_param = toggle.parentElement.id;
		let time_type = toggle.getAttribute("time_type");
		toggle.onclick = () => {
			let preview_texts = document.querySelectorAll(".preview_option");
			preview_texts.forEach((preview) => {
				if (preview.classList.contains(time_param)) {
					delete category_search_params[time_param]
					delete category_search_params[`relative_${time_param}`]
					preview.remove();
				}
			});
			createTimeInput(time_type, time_param);
		};
	});
	

	//Set show time div spans
	let time_div_spans = document.querySelectorAll(".show_time_settings_span");
	time_div_spans.forEach( (span) => {
		span.onclick = () => {
			let target_div_name = span.parentElement.getAttribute("for");
			let target_div = document.querySelector(`#${target_div_name}`);
			target_div.hidden = !target_div.hidden;
		};
	});

	// Load last tested category
	let temp_category = JSON.parse(localStorage.getItem("category__temp_"));
	if (temp_category) {
		let category = {"category_name": "_temp_", category: temp_category};
		fillFormFields(category);
		doSearch(temp_category);
	}


	// Set test button
	let test_button = document.querySelector("#test_button");
	test_button.onclick = () => {
		saveCategory(is_temp = true);
		doSearch();
	};

	// Set clear button
	let clear_button = document.querySelector("#clear_params_btn");
	clear_button.onclick = () => {
		let category = {"category_name": "", "category": default_category};
		fillFormFields(category);
		saveCategory(is_temp = true)
	};

	// Set save button
	let save_button = document.querySelector("#save_button");
	save_button.onclick = () => saveCategory(is_temp = false);


	// Set show advanced params toggle
	let advanced_params_span = document.querySelector("#show_advanced_params_span");
	advanced_params_span.onclick = (e) => {
		let advanced_params_div = document.querySelector("#advanced_input_div");
		advanced_params_div.hidden = !advanced_params_div.hidden;
		e.target.innerText = advanced_params_div.hidden ? "show" : "hide";
	};


}
main();
