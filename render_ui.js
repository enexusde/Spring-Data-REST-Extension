function repairUrl(url){
	if(url === undefined) {
		return undefined;
	}
	return url.split('{?')[0];
}
var appenders = {};
appenders.string = function(val) {
	var time = Date.parse(val);
	if(time > 0){
		var t = jQuery('<input type=datetime>');
		t.attr({
			value:val
		})
		return t;
	}
	return jQuery('<input>').val(val);
}
appenders.number = function(number){
	return jQuery('<input type=number>').val(number)
}
function transformCamelCase(txt){
	return txt.split(/(?=[A-Z])/).join(" ");
}

appenders.boolean = function(val) {
	return jQuery('<input type=checkbox>').val(val);
}
appenders.object = function(val) {
	if(val === null){
		return jQuery('<i>null</i>')
	}
	if (typeof val.length === 'number') {
		if (val.length === 0) {
			return jQuery('<i>No entries</i>')
		}
	}
	return jQuery('<textarea>===</textarea>')
}
var json;
function clickPage(evt) {
	var target = jQuery(evt.target);
	console.log(target);
	var pageNo = target.attr('page') * 1;
	document.location.href = '?page=' + pageNo;
}
function loadScrollbar() {
	var first = $('<button id=first>').attr('page', 0).text(1);
	var prev = $('<button id=prev>').text("<");
	var next = $('<button id=next>').text(">");
	var last = $('<button id=last>').attr('page', json.page.totalPages-1).text(
			json.page.totalPages-1);
	var pagelist = $('<div id=pagelist>');
	pagelist.append(first);
	
	for (var pageNo = 2; pageNo < json.page.totalPages - 1; pageNo++) {
		var page = $('<button>').text(pageNo);
		if (pageNo - 1 === json.page.number) {
			page.addClass('active');
		}
		page.attr({
			page : pageNo - 1
		});
		page.one({
			click : clickPage
		})
		pagelist.append(page);
	}
	first.one({
		click : clickPage
	});
	last.one({
		click : clickPage
	});
	pagelist.append(last);
	if (json.page.number < json.page.totalPages - 4) {
		last.addClass('more');
	}
	if (json.page.number == 0) {
		first.addClass('active');
	}
	if (json.page.number == json.page.totalPages - 1) {
		last.addClass('active');
	}
	var t = jQuery('html > div.spring-data-rest-extension');
	if(json.page.number > 1) {
		t.append(prev);
	}
	
	if(json.page.number < json.page.totalPages) {
		t.append(next);
	}
	t.append(pagelist);
	var e = jQuery('html > div.spring-data-rest-extension #pagelist button.active');
	pagelist[0].scrollLeft = 0;
	var buttonLeft = e.position().left;
	var scrollMiddle = pagelist.width() / 2;
	if (buttonLeft > scrollMiddle) {
		first.addClass('more');
		pagelist[0].scrollLeft = buttonLeft - scrollMiddle + json.page.number * 5;
	}
}
function loadTable(embedded) {
	var caption;
	var table = jQuery('<table id=tbl>');
	var tr = jQuery('<tr>');
	var thead = jQuery('<thead>');
	var tbody = jQuery('<tbody>');
	thead.append(tr);
	table.append(thead);
	table.append(tbody);
	var elements;
	var somethingToSee = false;
	for ( var name in embedded) {
		elements = embedded[name];
		for ( var e in elements) {
			for ( var idx in elements[e]) {
				if (idx === '_links') {
					for ( var rel in elements[e][idx]) {
						if (rel === 'self') {
						} else {
							tr.append(jQuery('<th class=relat>').text(transformCamelCase(rel)));
							somethingToSee = true;
						}
					}
				} else {
					tr.append(jQuery('<th>').text(transformCamelCase(idx)));
					somethingToSee = true;
				}
			}
			break;
		}
		break;
	}
	for ( var e in elements) {
		var element = elements[e];
		var tr = jQuery('<tr>')
		tbody.append(tr);

		for ( var idx in element) {
			if (idx == '_links') {
				for ( var name in element[idx]) {
					if(name !== 'self'){
						var link = element[idx][name];
						var href = link.href;
						var a = jQuery('<a>');
						a.text('The '+transformCamelCase(name));
						a.attr('href', href);
						tr.append(jQuery('<td>').append(a));
						somethingToSee = true;
					}
				}
			} else {
				var data = element[idx];
				var type = typeof data + "";
				var cell = appenders[type] && appenders[type](data);
				tr.append(jQuery('<td>').append(cell));
				somethingToSee = true;
			}
		}
	}
	if (!somethingToSee) {
		jQuery('.spring-data-rest-extension').append(
				jQuery('<span>').text('Empty'));
	}
	if (caption === undefined) {
		caption = 'Spring Data Rest Repository';
	}
	document.title = transformCamelCase(caption);
	var h1 = jQuery('<h1>').text(transformCamelCase(caption));
	return [h1,table];
}
function createTR(val, caption){
	var tr = jQuery('<tr>');
	var type = typeof val + "";
	var element = appenders[type](val);
	tr.append(jQuery('<th>').text(caption));
	tr.append(jQuery('<td>').append(element));
	return tr;
}
function loadElement() {
	var somethingToSee = false;
	var table = jQuery('<table id=det>');
	var tbody = jQuery('<tbody>');
	table.append(tbody);
	var caption = undefined;
	for ( var name in json) {
		var prop = json[name];
		if (name === '_embedded') {
			jQuery('.spring-data-rest-extension').append(loadTable(prop));
			somethingToSee = true;
			caption = Object.keys(prop)[0];
		} else if (name === '_links') {
			for ( var linkName in prop) {
				if (linkName !== 'self') {
					var link = prop[linkName];
					if(repairUrl(link.href) == document.location.href) {
						caption = linkName;
					} else {
						var tr = jQuery('<tr>');
						var href = link.href;
						var a = jQuery('<a>');
						a.text('Link');
						if (link.templated === true) {
							href = repairUrl(href);
						}
						a.attr('href', href);
						tr.append(jQuery('<th>').text(transformCamelCase(linkName)));
						tr.append(jQuery('<td>').append(a));
						tbody.append(tr);
						somethingToSee = true;
					}
				}
			}
		} else if (name === 'content') {
			for ( var keyName in prop) {
				var e = prop[keyName];
				tbody.append(createTR(e, transformCamelCase(keyName)));
				somethingToSee = true;
			}
		} else {
			
			tbody.append(createTR(prop, transformCamelCase(name)));
			somethingToSee = true;
		}
	}
	var lst = [];
	if (caption === undefined) {
		caption = 'Spring Data Rest Repository';
	}
	document.title = transformCamelCase(caption);
	var h1 = jQuery('<h1>').text(transformCamelCase(caption));
	lst.push(h1);
	if (!somethingToSee) {
		lst.push(jQuery('<span>').text('Nothing here...'));
	}
	lst.push(table);
	return lst;
}
function parseJson(inPre) {
	if (inPre) {
		json = jQuery.parseJSON($('body pre').first().text());
	}else{
		json = jQuery.parseJSON(jQuery('body').html())
	}
	if(json != undefined) {
		jQuery(document.body).addClass('no-scroll')
	}
	console.log(json);
}
function removeWait() {
	jQuery('div.wait').remove();
}

var HAL_JSON_REGEX = 'application\/hal\\+json.*';
var HTML_REGEX = 'text\/html.*';
var loaded = false;
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	if (typeof msg.contentType === 'string'
			&& msg.contentType.match(HAL_JSON_REGEX) && !loaded) {
		loaded = true;
		var root = jQuery("<div>").addClass('spring-data-rest-extension');
		jQuery('html').append(root);
		var wait = jQuery('<div>').addClass('wait');
		root.append(wait);
		jQuery(function() {
			parseJson(true);
			removeWait();
			if (typeof json.page !== 'undefined') {
				loadScrollbar();
				jQuery('.spring-data-rest-extension').append(loadTable(json._embedded));
			} else {
				jQuery('.spring-data-rest-extension').append(loadElement());
			}
		});
	}
	if (typeof msg.contentType === 'string'
			&& msg.contentType.match(HTML_REGEX) && !loaded) {
		loaded = true;
		jQuery(function() {
			parseJson(false);
			if (json !== undefined) {
				var root = jQuery("<div>").addClass('spring-data-rest-extension');
				jQuery('html').append(root);
				removeWait();
				if (typeof json.page !== 'undefined') {
					loadScrollbar();
					jQuery('.spring-data-rest-extension').append(loadTable(json._embedded));
				} else {
					jQuery('.spring-data-rest-extension').append(loadElement());
				}
			}
		});
	}
});