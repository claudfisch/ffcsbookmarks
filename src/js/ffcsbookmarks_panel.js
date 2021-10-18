function mainBookmarkPanel( item )
{
	DebugOutput('Panel-Main-function: ' + arguments.callee.name);
	
	//DebugOutput("cmd# Result: " + JSON.stringify( item ) );
	var settings = item.ffcsbookmarksSettings;
	
	if(!settings.url || !settings.ip)
	{
		addNotification('error','Check the options of the extension!');
		return false;
	}
	
	creds = btoa( settings.user + ":" + settings.pass );
	rhost = ( settings.proto ? "https" : "http" ) + "://" + settings.ip + "/" + settings.url;
	
	$('#btnBmSearch').click(function (e)
	{
		/* start the search */
		searchRun();
	});
}

function searchBookmarkFromTagOnly(strTag)
{
	DebugOutput('Panel-Main-function: ' + arguments.callee.name);
	
	/* Clear search-inputs */
	GetDomObj("bmUrl").value = "";
	GetDomObj("bmTitle").value = "";
	
	/* Set search tag */
	GetDomObj("bmTags").value = strTag;
	
	/* Check modSearch to tags */
	$('#modeUrl')[0].checked = false;
	$('#modeTitle')[0].checked = false;
	$('#modeTags')[0].checked = true;
	
	/* start the search */
	searchRun();
}

function searchRun()
{
	DebugOutput('Panel-Main-function: ' + arguments.callee.name);
	var strSearch = "";
	var strSearchUrl = madeSearchReady( "search", new Array( GetDomObj("bmUrl").value ).map(s => s.trim()) );
	var strSearchTitle = madeSearchReady( "search", new Array( GetDomObj("bmTitle").value ).map(s => s.trim()) );
	var strSearchTags = "";
	var strCond = "&conjunction=";
	var strSortBy = "";
	
	if ( GetDomObj("bmTags").value.includes(",") )
		/* more tags */
		strSearchTags = madeSearchReady( "tags", GetDomObj("bmTags").value.split(",").map(s => s.trim()) );
	else
		/* single tag */
		strSearchTags = madeSearchReady( "tags", new Array( GetDomObj("bmTags").value ).map(s => s.trim()) );
	
	if ( $('#modeUrl')[0].checked )
		strSearch += strSearchUrl;
	
	if ( $('#modeTitle')[0].checked )
		strSearch += "&" + strSearchTitle;

	if ( $('#modeTags')[0].checked )
		strSearch += "&" + strSearchTags;
	
	if ( $('#modeOR')[0].checked )
		strCond += "or";
	else
		strCond += "and";
	
	if ( $('#modeUrl')[0].checked )
		strSortBy += "&sortby=url";
	
	if ( $('#modeTitle')[0].checked )
		strSortBy += "&sortby=title";
	
	if ( $('#modeDescr')[0].checked )
		strSortBy += "&sortby=description";
	
	if ( $('#modePublic')[0].checked )
		strSortBy += "&sortby=public";
	
	if ( $('#modeLastmodify')[0].checked )
		strSortBy += "&sortby=lastmodified";
	
	if ( $('#modeClickcount')[0].checked )
		strSortBy += "&sortby=clickcount";
	
	// DebugOutput( 'String Search Url: ' + strSearchUrl );
	// DebugOutput( 'String Search Title: ' + strSearchTitle );
	// DebugOutput( 'ModeOr checked: ' + (  $('#modeOR')[0].checked ? "YES" : "NO" ) );
	// DebugOutput( 'String Search: ' + strSearch );
	// DebugOutput( 'String Cond.: ' + strCond );
	// DebugOutput( 'Sort by: ' + strSortBy );
	
	searchBookmark( strSearch + strCond + strSortBy );
}

function searchBookmark(strSearch)
{
	DebugOutput('function: ' + arguments.callee.name );
	
	var URL = rhost + "/bookmark?" + strSearch + "&limit=" + intSearchLimit;

	$.ajax({
        url: URL,
        method: "GET",
        //basic authentication
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + creds);
        },
    })
	.success(function(result)
	{
		if(result.status == 'error')
		{
            addNotification('error', "[500] Server Error: " + result.message);
			return false;
        }
		
		DebugOutput(result.status);
		if(typeof result.data[0] == 'undefined')
		{
			addNotification('error','No bookmark found!');
			return false;
		}

		/* Get DIV-Box for search result and empty it for the new results */
		var bookmarksHolder = GetDomObj("wrapper");
		bookmarksHolder.innerHTML = "";
				
		var index = 0;
		
		for ( foundBookmark of result.data )
		{
			var card = CreateDomObj("div");
			card.id = "myCard";
			card.className = "card";
			card.setAttribute("style", "width: 31rem;");
			
			var cardBody = CreateDomObj("div");
			cardBody.className = "card-body";
			
			var cardTitle = CreateDomObj("h5");
			cardTitle.className = "card-title";
			cardTitle.innerHTML = foundBookmark.title;
			
			var cardSubtitle = CreateDomObj("h6");
			cardSubtitle.className = "card-subtitle mb-2 text-muted";
			cardSubtitle.innerHTML = "Lastmodified: " + ISODateString(new Date(foundBookmark.lastmodified * 1000));

			var cardText = CreateDomObj("p");
			cardText.className = "card-text";
			cardText.innerHTML = foundBookmark.description;
			
			var cardLink01 = CreateDomObj("a");
			cardLink01.className = "card-link";
			cardLink01.href = foundBookmark.url;
			cardLink01.target = "_blank";
			cardLink01.innerHTML = "Go to";
			
			var cardListGroup = CreateDomObj("ul");
			cardListGroup.className = "list-group list-group-flush";
			
			if ( foundBookmark.tags.length > 0 )
			{
				var cardListGroupHeader = CreateDomObj("div");
				cardListGroupHeader.className = "card-header";
				cardListGroupHeader.innerHTML = "Tags";
				cardListGroup.appendChild(cardListGroupHeader);

				for ( tag of foundBookmark.tags )
				{
					var cardListGroupItemButton = CreateDomObj("button");
					cardListGroupItemButton.type = "button";
					cardListGroupItemButton.id = tag.replace(" ", "_");
					cardListGroupItemButton.className = "btn btn-warning";
					cardListGroupItemButton.innerHTML = tag;
					
					var cardListGroupItem = CreateDomObj("li");
					cardListGroupItem.className = "list-group-item";
					cardListGroupItem.appendChild(cardListGroupItemButton);
					cardListGroup.appendChild(cardListGroupItem);
				}
			}
			
			cardBody.appendChild(cardTitle);
			cardBody.appendChild(cardSubtitle);
			cardBody.appendChild(cardText);
			cardBody.appendChild(cardListGroup);
			cardBody.appendChild(cardLink01);
			card.appendChild(cardBody);

			bookmarksHolder.appendChild(card);
		}
		
		addNotification('success','Bookmark found');
		GetAllTags(foundBookmark.tags);
	})
	.error(function(XMLHttpRequest, status, errorThrown)
	{
        DebugOutput('ajax error');
        DebugOutput('Status: ' + status.toString());
        DebugOutput('Error: ' + errorThrown.toString());
    });
}

function GetAllTags()
{
	DebugOutput('function: ' + arguments.callee.name );
		
	var URL = rhost + "/tag?";

	$.ajax({
        url: URL,
        method: "GET",
        //basic authentication
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + creds);
        },
    })
	.success(function(result)
	{
		if(result.status == 'error')
		{
            addNotification('error', "[500] Server Error: " + result.message);
			return false;
        }
		
		DebugOutput(result.status);
		
		/* Result is a string seperated by comma */
		DebugOutput('data: ' + result );
		if(typeof result == 'undefined')
		{
			addNotification('error','No tags found!');
			return false;
		}
		
		for( tag of result.toString().split(",") )
		{
			DebugOutput('>> Tagname: ' + tag );

			$('#' + tag.replace(" ", "_")).click(function()
			{
				searchBookmarkFromTagOnly(this.id.toString().replace("_"," "));
			});
		}
	})
	.error(function(XMLHttpRequest, status, errorThrown)
	{
        DebugOutput('ajax error');
        DebugOutput('Status: ' + status.toString());
        DebugOutput('Error: ' + errorThrown.toString());
    });
}

/*
	Wait for full-loaded addon-page
*/
document.addEventListener("DOMContentLoaded", function(event)
{
	DebugOutput("DOM ready");
	GetBrowserInfos(mainBookmarkPanel);
});