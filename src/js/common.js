/* Variables */
let isDebugging = false;
let isReady = false;
jQuery.support.cors = true;
let creds;
let rhost;
let intSearchLimit = 20;

/* functions */
function DebugOutput( strMessage ){if( isDebugging ) console.log( strMessage );}
function GetDomObj( strID ){ return document.getElementById( strID ); }
function CreateDomObj( strDomType ){ return document.createElement( strDomType ); }

function SendAjaxRequest( strJsonRequest, funcOnSuccess, funcOnError )
{
	$.ajax( strJsonRequest )
	.success( funcOnSuccess )
	.error( funcOnError );
}

function AjaxResultValid( objAjaxResult )
{
	DebugOutput('common-function: ' + arguments.callee.name);
	/*
	if(objAjaxResult.status == 'error')
	{
		addNotification('error', "[500] Server Error: " + objAjaxResult.message);
		return false;
	}
	*/
	DebugOutput(objAjaxResult);
	
	/* Tags - result */
	if( typeof(objAjaxResult) == typeof(undefined))
	{
		addNotification('error','No result found!');
		return false;
	}
	
	if ( typeof(objAjaxResult) == typeof(Array) )
		return objAjaxResult;
	
	/* Bookmarks - result.data */
	if(typeof objAjaxResult.data == 'undefined')
	{
		addNotification('error','No data found!');
		return false;
	}
	
	if ( typeof(objAjaxResult.data) == typeof(Array) )
		return objAjaxResult;
	
	return new Array();
}

function ajaxErrorRequest(XMLHttpRequest, status, errorThrown)
{
	DebugOutput('ajax error');
	DebugOutput('Status: ' + status.toString());
	DebugOutput('Error: ' + errorThrown.toString());
}

/* ===============  TAGS - Begins =============== */
function GetAllTags()
{
	DebugOutput('function: ' + arguments.callee.name );
		
	var URL = rhost + "/tag";

	SendAjaxRequest({
        url: URL,
        method: "GET",
        //basic authentication
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + creds);
        },
    },tagSuccessRequest,ajaxErrorRequest);
}

//How to call it - tag must to exists: EditTag("Lieferservice","Delivery Service");
function EditTag(strOldTag,strNewTag)
{
	var URL = rhost + "/tag/" + strOldTag;
	
	SendAjaxRequest({
		url: URL,
        method: "PUT",
        //basic authentication
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + creds);
        },
		data: { "name": strNewTag },
		dataType: 'json',
	}, editTagSuccessRequest, ajaxErrorRequest);
}

function DeleteTag(strDeleteTag)
{
	var URL = rhost + "/tag/" + strDeleteTag;
	
	SendAjaxRequest({
		url: URL,
        method: "DELETE",
        //basic authentication
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + creds);
        },
	}, editTagSuccessRequest, ajaxErrorRequest);
}

function editTagSuccessRequest(result)
{
	DebugOutput('common-function: ' + arguments.callee.name);
	DebugOutput('Status: ' + result.status );
	
	if ( result.status.toString().includes('success') )
		addNotification('success', 'Tag action done');
	else
		addNotification('error', 'Ups, tag action canceled');
}
/* ===============  TAGS - Ends =============== */

function GetBrowserInfos(funcCall)
{
	DebugOutput('function: ' + arguments.callee.name );
	var strUseragent = navigator.userAgent;
	browser = new ChromePromise();
	
	/* .then(onSuccess,onError); */
	browser.storage.local.get('ffcsbookmarksSettings').then(funcCall);		
}

function CurrentBrowserTab(callback)
{
    DebugOutput('function: ' + arguments.callee.name);
    var queryInfo = { active: true, currentWindow: true };

    var bTab = chrome.tabs.query(queryInfo, function(tabs)
	{
        var bTab = 
		{
            url: tabs[0].url,
            title: tabs[0].title
        }
        callback(bTab);
    });
}

function madeSearchReady( strSearchType, arrSearchElements )
{
	/*
		Example:
		tags[]=firsttag&tags[]=secondtag&...
		search[]=url&search[]=title&search[]=description
	*/
	/*
	var defaultBaseString = strSearchType + "[]=";
	var strSearch = "";
	
	for ( var index = 0; index < arrSearchElements.length; index++ )
	{
		if ( strSearch.length > 0 )
			strSearch += "&" + defaultBaseString + arrSearchElements[index];
		else
			strSearch += defaultBaseString + arrSearchElements[index];
	}
	
	return strSearch;
	*/
	
	return strSearchType + "[]=" + arrSearchElements.join('&' + strSearchType + "[]=");
	//DebugOutput("Join test: " + strSearchTest );
}

// https://gist.github.com/tored/3868138
function ISODateString(d)
{
    function pad(n)
	{
        return n < 10 ? '0' + n : n;
    }
    return d.getUTCFullYear() + '-' +
            pad(d.getUTCMonth()+1) + '-' +
            pad(d.getUTCDate()) + 'T' +
            pad(d.getUTCHours()) + ':' +
            pad(d.getUTCMinutes()) + ':' +
            pad(d.getUTCSeconds()) + 'Z';
}

// https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/notifications
// This could become a browser notification
function addNotification(type, message)
{
    DebugOutput('function: ' + arguments.callee.name);

    var div = GetDomObj('notification');
    div.innerHTML = "";

    var d = CreateDomObj("div");
	d.className = ( type == "success" ? "notify" : "alarm" );
	
	DebugOutput("Classname: " + d.className);
	
    var span = CreateDomObj("span");
    span.textContent = message;
	
	DebugOutput("Spantext: " + span.textContent);

    div.appendChild(d).appendChild(span);
    $('#notification').show(0).delay(2500).hide(0);
}