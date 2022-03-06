var server = "hpag://lbry.com/faq/thumbnails-and-coversttp://localhost:5279";
var current_page = 1;
var last_page = 1;


function listTransactions(obj) {
	let transactions_div = document.querySelector("#transactions_div");
	let tx_table = document.querySelector("#tx_table > tbody");
	tx_table.innerText = "";
	
	obj.items.forEach((tx) => {
		let tr = document.createElement("tr");	
		let td_date = document.createElement("td");
		let td_type = document.createElement("td");
		let td_unlock = document.createElement("td");
		let td_details = document.createElement("td");
		let td_tx = document.createElement("td");
		let td_lbc = document.createElement("td");
		td_lbc.id = "td_lbc";


		var date = new Date(0);
		date.setUTCSeconds(tx.timestamp);
		td_date.innerText = date.toLocaleString('en-GB', { hour12:false } );
		td_type.innerText = ( tx.value_type ? tx.value_type : tx.type );
		td_details.innerText = tx.name;
		if (tx.permanent_url) {
			td_details.innerHTML = cleanHTML("<a href='" + tx.permanent_url + "'>" + tx.name + "</a>");
		}
		td_tx.innerHTML = cleanHTML("<a href='https://explorer.lbry.com/tx/" + tx.txid + "#output-" + tx.nout + "'>" + tx.txid.substr(0,8) + "</a>");
		td_lbc.innerText = ( tx.is_my_output ? tx.amount : (-1 * tx.amount) );

		tr.append(td_date);
		tr.append(td_type);
		if ((tx.type === "support" || tx.value_type === "repost")&&
				tx.is_my_output && !tx.is_spent) {
			let unlock_btn = document.createElement("button");
			unlock_btn.innerText = "Unlock";
			let method = "support_abandon";
			if (tx.value_type === "repost")
				method = "stream_abandon";
			unlock_btn.onclick = () => { 
				doACall(method, {txid: tx.txid, nout: tx.nout}, (response) => {
					if (response.result.height) 
						unlock_btn.remove();
				});
			};
			td_unlock.append(unlock_btn);
		}
		tr.append(td_unlock);
		tr.append(td_details);
		tr.append(td_tx);
		tr.append(td_lbc);
		tx_table.append(tr);

		last_page = obj.total_pages;
	});
	
}

function updateTxList(page = 1) {
	let selector = document.querySelector("#transaction_type_selector");
	let active_filter_btn = document.querySelector(".active_filter_btn");
	let filter = active_filter_btn.value;
	let tx_type = selector.value;
	current_page = page;
	let page_input_text = document.querySelector("#page_input");
	page_input_text.value = current_page;
	let params = {
		exclude_internal_transfers: true,
		is_my_input_or_output: true,
		page_size:50,
		page: current_page
	}
	
	if (tx_type === "sent") {
		delete params.is_my_input_or_output;
		params.is_my_input = true;
		params.is_not_my_output = true;
	
	} else if (tx_type === "received") {
		delete params.is_my_input_or_output;
		params.is_not_my_input = true;
		params.is_my_output = true;
	
	} else if (tx_type !== "all") {
		params.type = tx_type;
	}

	if (filter != "")
		params[filter] = true;

	doACall("txo_list", params, (response) => {
			listTransactions(response.result);
	});
	

}

function main() {
	let transactions_div = document.querySelector("#transactions_div");
	if (!transactions_div) {
		setTimeout(main, 100);
		return;
	}
	let params = {
		exclude_internal_transfers: true,
		is_my_input_or_output: true,
		page_size:50,
		page: 1
	}
	doACall("txo_list", params, (response) => {
			listTransactions(response.result);
	});

	let tx_type_selector = document.querySelector("#transaction_type_selector");
	tx_type_selector.onchange = () => {updateTxList()};

	let filter_btns = document.querySelectorAll(".filter_btn");
	filter_btns.forEach( (btn) => btn.onclick = () => { 
		filter_btns.forEach( (btn) => btn.classList.remove("active_filter_btn"));
		btn.classList.add("active_filter_btn");
		updateTxList();
	});

	let page_input_buttons = document.querySelectorAll(".page_btn");
	page_input_buttons.forEach((input) => {
		input.onclick = () => {
			if (input.id === "next_page_btn" && (current_page <= last_page)) // Allow one empty page
				updateTxList(current_page + 1);
			else if (input.id === "prev_page_btn" && (current_page -1 >= 0))
				updateTxList(current_page - 1);
		}
	});

	let page_text_input = document.querySelector("#page_input");
	page_text_input.addEventListener("keyup", (e) => { if (e.keyCode === 13) {updateTxList(parseInt(page_text_input.value))} });

}
main();
