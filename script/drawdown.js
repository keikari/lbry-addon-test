/**
 * drawdown.js
 * (c) Adam Leggett
 */

/*This file has been edited */


;function markdown(src) {

	var rx_lt = /</g;
	var rx_gt = />/g;
	var rx_space = /\t|\r|\uf8ff/g;
	var rx_escape = /\\([\\\|`*_{}\[\]()#+\-~])/g;
	var rx_hr = /^([*\-=_] *){3,}$/gm;
	var rx_blockquote = /\n *&gt; *([^]*?)(?=(\n|$){2})/g;
	var rx_list = /\n( *)(?:[*\-+]|((\d+)|([a-z])|[A-Z])[.)]) +([^]*?)(?=(\n|$){2})/g;
	var rx_listjoin = /<\/(ol|ul)>\n\n<\1>/g;
	var rx_highlight = /(^|[^A-Za-z\d\\])(([*_])|(~)|(\^)|(--)|(\+\+)|`)(\2?)([^<]*?)\2\8(?!\2)(?=\W|_|$)/g;
	var rx_code = /\n((```|~~~).*\n?([^]*?)\n?\2|((    .*?\n)+))/g;
	var rx_link = /[^!](\[(.*)\]\((.*)\))/g;
	rx_link = /(([^!])\[((?:!\[[^\]]*?\]\(.*?\)|.)*?)\]\((.*?)\))/g; //Allows images in links(shouldn't be needed anymore, but I may have broke the original one, and this still works)
	var rx_img = /(!\[([^\]]*?)\]\((.*?)\))/g;
	var rx_table = /\n(( *\|.*?\| *\n)+)/g;
	var rx_thead = /^.*\n( *\|( *\:?-+\:?-+\:? *\|)* *\n|)/;
	var rx_row = /.*\n/g;
	var rx_cell = /\||(.*?[^\\])\|/g;
	var rx_heading = /(?=^|>|\n)([>\s]*?)(#{1,6}) (.*?)( #*)? *(?=\n|$)/g;
	var rx_para = /(?=^|>|\n)\s*\n+([^<]+?)\n+\s*(?=\n|<|$)/g;
	var rx_stash = /-\d+\uf8ff/g;

	var rx_http = /https?:\/\/[^\s\n\r<]*/g;
	var rx_n = /\n/g;
	var rx_b = /\*{2}(\*?[^\*]+\*?)\*{2}/g; // Also caches em if same group than b
	var rx_codeline = /`{1,3}([^\n]+?)`{1,3}/g;
	var rx_em = /\*([^\*]+?)\*/g;
	var rx_time = /[0-9]{0,2}:?[0-9]{1,2}:[0-9]{2}/g;



	function replace(rex, fn) {
		src = src.replace(rex, fn);
	}

	function element(tag, content) {
		return '<' + tag + '>' + content + '</' + tag + '>';
	}

	function blockquote(src) {
		return src.replace(rx_blockquote, function(all, content) {
			return element('blockquote', blockquote(highlight(content.replace(/^ *&gt; */gm, ''))));
		});
	}

	function list(src) {
		return src.replace(rx_list, function(all, ind, ol, num, low, content) {
			var entry = element('li', highlight(content.split(
				RegExp('\n ?' + ind + '(?:(?:\\d+|[a-zA-Z])[.)]|[*\\-+]) +', 'g')).map(list).join('</li><li>')));

			return '\n' + (ol
				? '<ol start="' + (num
					? ol + '">'
					: parseInt(ol,36) - 9 + '" style="list-style-type:' + (low ? 'low' : 'upp') + 'er-alpha">') + entry + '</ol>'
				: element('ul', entry));
		});
	}

	function highlight(src) {
		return src.replace(rx_highlight, function(all, _, p1, emp, sub, sup, small, big, p2, content) {
			return _ + element(
				emp ? (p2 ? 'strong' : 'em')
				: sub ? (p2 ? 's' : 'sub')
				: sup ? 'sup'
				: small ? 'small'
				: big ? 'big'
				: 'code',
				highlight(content));
		});
	}

	function unesc(str) {
		return str.replace(rx_escape, '$1');
	}

	var stash = [];
	var si = 0;

	src = '\n' + src + '\n';

	replace(rx_lt, '&lt;');
	replace(rx_gt, '&gt;');
	replace(rx_space, '  ');

	// blockquote
	src = blockquote(src);

	// horizontal rule
	replace(rx_hr, '<hr/>');

	// list
	src = list(src);
	replace(rx_listjoin, '');


	// code
	replace(rx_code, function(all, p1, p2, p3, p4) {
		stash[--si] = element('pre', element('code', p3||p4.replace(/^    /gm, '')));
		return si + '\uf8ff';
	});

	// img
	replace(rx_img, function(all, p1, p2, p3) {
		stash[--si] = '<img src="' + p3 + '" alt="' + p2 + '"/>';
		return si + '\uf8ff';
	});
	// link
	replace(rx_link, function(all, p1, p2, p3, p4) {
		//console.log(all);
		let rx_b = /\*{2}(\*?[^\*]+?\*?)\*{2}/;
		let p3_b_match = p3.match(rx_b);
		if (p3_b_match) {
			p3 = `<b>${p3_b_match[1]}</b>`;
		}
		stash[--si] = p2 + '<a href="' + p4 + '">' + p3 + '</a>';
		return p2 + si + '\uf8ff';
	});

	// bold
	replace(rx_b, function(all, p1) {
		let rx_codeline = /`{1,3}([^\n]+?)`{1,3}/;
		let rx_em = /\*([^\*]+?)\*/;
		let p1_code_match = p1.match(rx_codeline);
		let p1_em_match = p1.match(rx_em);
		if (p1_code_match)
			p1 = `<code>${p1_code_match[1]}</code>`;
		else if (p1_em_match)
			p1 = `<em>${p1_em_match[1]}</em>`;

		stash[--si] = `<b>${p1}</b>`;
		return si + '\uf8ff';
	});

	// codeline
	replace(rx_codeline, function(all, p1) {
		stash[--si] = `<code>${p1}</code>`;
		return si + '\uf8ff';
	});

	// em
	replace(rx_em, function(all, p1) {
		let rx_link = /[^!](\[(.*)\]\((.*)\))/;
		let p1_link_match = p1.match(rx_link);
		//console.log(p1);
		if (p1_link_match) {
			p1 = p1_link_match[2] + '<a href="' + p1_link_match[4] + '">' + p1_link_match[3] + '</a>'
		}
		stash[--si] = `<em>${p1}</em>`;
		return si + '\uf8ff';
	});



	// http(s)
	replace(rx_http, function(all) {
		stash[--si] = '<a href="' + all + '">' + all + '</a>';
		return si + '\uf8ff';
	});

	// time
	replace(rx_time, function(all) {
		console.log(all);
		stash[--si] = '<a class="timestamp" value="' + all + '">' + all + '</a>';
		return si + '\uf8ff';
	});


	// table
	replace(rx_table, function(all, table) {
		var sep = table.match(rx_thead)[1];
		return '\n' + element('table',
			table.replace(rx_row, function(row, ri) {
				return row == sep ? '' : element('tr', row.replace(rx_cell, function(all, cell, ci) {
					return ci ? element(sep && !ri ? 'th' : 'td', unesc(highlight(cell || ''))) : ''
				}))
			})
		)
	});

	// heading
	replace(rx_heading, function(all, _, p1, p2) { return _ + element('h' + p1.length, unesc(highlight(p2))) });

	// \n (breaks heading if before them)
	replace(rx_n, function(all) {
		stash[--si] = '<br>';
		return si + '\uf8ff';
	});

	// paragraph
	replace(rx_para, function(all, content) { return element('p', unesc(highlight(content))) });

	// stash
	//replace(rx_stash, function(all) {if (parseInt(all) == -1) {console.log(`Test ${all}: ${stash[parseInt(all)]}`)}; return stash[parseInt(all)] });

	// Go through stash "recursively"(kind of)
	let loops = 0;
	const max_loops = 5 // Just to prevent infinite loop(though those shouldn't happen)
	let missed_sis = 0;
	do {
		missed_sis = 0;
		for (let i = -1; i >= si; i--) {
			let rx = `${i}\uf8ff`;
			let value = stash[parseInt(rx)];
			if (src.match(rx)) {
				src = src.replace(rx, value);
			} else {
				missed_sis++;
			}
		}
		console.log(loops);
		console.log(si);
	} while (!(missed_sis == 0 || missed_sis == (si * -1) || ++loops >= max_loops));

	return src.trim();
};

