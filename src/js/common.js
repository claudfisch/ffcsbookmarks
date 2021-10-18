/* Variables */
let isDebugging = true;
let isReady = false;
jQuery.support.cors = true;
let creds;
let rhost;
let intSearchLimit = 20;

/* functions */
function DebugOutput( strMessage ){if( isDebugging ) console.log( strMessage );}
function GetDomObj( strID ){ return document.getElementById( strID ); }
function CreateDomObj( strDomType ){ return document.createElement( strDomType ); }

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

    var div = document.getElementById('notification');
    div.innerHTML = "";

    var d = document.createElement("div");
    if(type == "success") d.className = "notify";
    if(type == "error") d.className = "alarm";

    var span = document.createElement("span");
    span.textContent = message;

    div.appendChild(d).appendChild(span);
    $('#notification').show(0).delay(2500).hide(0);
}