let boolSearchFound = false;

function mainBookmark(item)
{
	DebugOutput('Popup-Main-function: ' + arguments.callee.name);
	
	//DebugOutput("cmd# Result: " + JSON.stringify( item ) );
	var settings = item.ffcsbookmarksSettings;
	
	if(!settings.url || !settings.ip)
	{
		addNotification('error','Check the options of the extension!');
		return false;
	}
	
	creds = btoa( settings.user + ":" + settings.pass );
	rhost = ( settings.proto ? "https" : "http" ) + "://" + settings.ip + "/" + settings.url;
	
	// DebugOutput("Creds: " + creds);
	// DebugOutput("rhost: " + rhost);
	CurrentBrowserTab(fillForm);
	
	$('#btnBmSave').click(function (e)
	{
        addBookmark();
	});
	
	$('#btnBmSearch').click(function (e)
	{
        var strSearch = madeSearchReady( "search", new Array( GetDomObj("bmTitle").value ) );
		searchBookmark( strSearch );
	});
	
	$('#btnBmUpdate').click(function (e)
	{
        updateBookmark();
	});
	
	$('#btnBmDel').click(function (e)
	{
        deleteBookmark();
    });
	
	$('#chkToggleDelete').click(function (e)
	{
		$('#btnBmDel').prop('disabled', function(i, v)
		{ 
			if ( v )
				GetDomObj('chkToggleDelete').innerHTML = "Disable Delete-Button";
			else
				GetDomObj('chkToggleDelete').innerHTML = "Enable Delete-Button";
			return !v;
		});
	});
}

function fillForm(bTab)
{
	DebugOutput('function: ' + arguments.callee.name);
    DebugOutput('URL: ' + bTab.url);
	
	var strSearch = madeSearchReady( "search", new Array( bTab.title ) );
	searchBookmark( strSearch );
	
	if ( !boolSearchFound )
	{
		$('#btnBmDel').hide();
		$('#chkToggleDelete').hide();
		$('#btnBmUpdate').hide();
		
		GetDomObj("bmUrl").value = bTab.url;
		GetDomObj("bmTitle").value = bTab.title;
	}
	else
	{
		$('#btnBmSave').hide();
		$('#btnBmDel').show();
		$('#chkToggleDelete').show();
		$('#btnBmUpdate').show();
		boolSearchFound = false;
	}
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
			addNotification('error','New page without storaged bookmark!');
			return false;
		}
		
		var foundBookmark = result.data[0];
		
		DebugOutput( foundBookmark );
		
		var dAdded = new Date(foundBookmark.added * 1000);
		var added = ISODateString(dAdded);
		
		var dLast = new Date(foundBookmark.lastmodified * 1000);
        var lastmodified = ISODateString(dLast);
		
		/* Bookmark-Values */
		$('#bmID').val(foundBookmark.id);
		$('#bmUrl').val(foundBookmark.url);
		$('#bmTags').val(foundBookmark.tags);
		$('#bmDescr').val(foundBookmark.description);
		
		/* Date-Modifiers */
		$('#bookmarkModify').show();
		$('#bmCreatedAt').text(added);
		$('#bmUpdatedAt').text(lastmodified);
		
		/* Action-Buttons */
		$('#btnBmSave').hide();
		$('#btnBmUpdate').show();
		$('#btnBmDel').show();
		$('#chkToggleDelete').show();
		
		addNotification('success','Bookmark found');
		
		boolSearchFound = true;
	})
	.error(function(XMLHttpRequest, status, errorThrown)
	{
        DebugOutput('ajax error');
        DebugOutput('Status: ' + status.toString());
        DebugOutput('Error: ' + errorThrown.toString());
    });
}

function addBookmark(bTab)
{
	DebugOutput('function: ' + arguments.callee.name);
	// DebugOutput('RHOST: ' + rhost);
	// DebugOutput('Creds: ' + creds);
	DebugOutput( GetDomObj('bmTags').value.split(',') );
	
	var bmUrl = $('#bmUrl').val().trim().replace(/\/$/, "");
	DebugOutput('BookmarkUrl: ' + bmUrl);
	
	$.ajax({
        url: rhost + "/bookmark",
        method: "POST",
        //basic authentication
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + creds);
        },
        data: {
            "url": bmUrl,
            "title": $('#bmTitle').val(),
            "description": $('#bmDescr').val(),
			"tags": GetDomObj('bmTags').value.split(',').map(s => s.trim()),
            "is_public": true
        },
        dataType: 'json',
    })
	.success(function(result)
	{
		DebugOutput('success');
        DebugOutput(result);
        var bookmark = result.item;
        if(bookmark.id)
		{
            $('#btnBmSave').hide();
			$('#btnBmUpdate').show();
            $('#btnBmDel').show();
			$('#chkToggleDelete').show();
            $('#bmID').val(bookmark.id);
            addNotification('success','Saved');
        } 
		else
		{
            addNotification('error','Not saved');
        }
	})
	.error(function(XMLHttpRequest, status, errorThrown){
        DebugOutput('ajax error');
        DebugOutput('Status: ' + status.toString());
        DebugOutput('Error: ' + errorThrown.toString());
		addNotification('error','No nextcloud service found!');
    });
}

function updateBookmark()
{
	DebugOutput('function: ' + arguments.callee.name);
	if( $('#bmID').val().length == 0 )
	{
        DebugOutput('No bookmark ID found');
        return false;
    }
	
	bookmarkID = $('#bmID').val();
	DebugOutput('DomObj Bookmark-ID: ' + bookmarkID);
	
	$.ajax({
        method: "PUT",
        url: rhost + "/bookmark/" + bookmarkID,
        //basic authentication
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + creds);
        },
		data: {
            "url": $('#bmUrl').val(),
            "title": $('#bmTitle').val(),
            "description": $('#bmDescr').val(),
			"tags": GetDomObj('bmTags').value.split(','),
            "is_public": true
        },
        dataType: 'json'
    })
	.success(function(result)
	{
        //CurrentBrowserTab(fillForm);
		$('#btnBmSave').hide();
		$('#btnBmUpdate').show();
		$('#btnBmDel').show();
		$('#chkToggleDelete').show();
        addNotification('success','Bookmark is updated');
    })
	.error(function(XMLHttpRequest, status, errorThrown)
	{
        DebugOutput('ajax error');
        DebugOutput('Status: ' + status.toString());
        DebugOutput('Error: ' + errorThrown.toString());
		addNotification('error','Bookmark update is canceled');
    });
}

function deleteBookmark()
{
    DebugOutput('function: ' + arguments.callee.name);
	
    if( $('#bmID').val().length == 0 )
	{
        DebugOutput('No bookmark ID found');
        return false;
    }
	
	bookmarkID = $('#bmID').val();
	DebugOutput('DomObj Bookmark-ID: ' + bookmarkID);
	
	$.ajax({
        method: "DELETE",
        url: rhost + "/bookmark/" + bookmarkID,
        //basic authentication
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + creds);
        }
    })
	.success(function(result)
	{
        CurrentBrowserTab(fillForm);
        $('#btnBmDel').hide();
		$('#chkToggleDelete').hide();
		$('#btnBmUpdate').hide();
        $('#btnBmSave').show();
        addNotification('success','Bookmark is now deleted');
    })
	.error(function(XMLHttpRequest, status, errorThrown)
	{
        DebugOutput('ajax error');
        DebugOutput('Status: ' + status.toString());
        DebugOutput('Error: ' + errorThrown.toString());
		addNotification('error','Bookmark delete is canceled');
    });
}

/*
	Wait for full-loaded addon-page
*/
document.addEventListener("DOMContentLoaded", function(event)
{
	DebugOutput("DOM ready");
	GetBrowserInfos(mainBookmark);
});