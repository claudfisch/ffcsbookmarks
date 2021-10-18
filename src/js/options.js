isDebugging = true;

function DebugOutput( strMessage ){if( isDebugging ) console.log( strMessage );}

function GetDomObj( strID ){ return document.getElementById( strID ); }

function SetNotificationMessage( strMessage, strClasses, intWaitingTimeSecs )
{
	 var notification = GetDomObj('notification');
	 notification.textContent = strMessage;
     notification.className = strClasses;
     notification.style.display = 'block';
	 setTimeout(function(){notification.style.display = 'none';}, intWaitingTimeSecs * 1000);
}

function CheckStorageVars( objBrowserSettingVar, strDomID, strDefaulValue )
{
	if ( objBrowserSettingVar ) 
		GetDomObj( strDomID ).value = objBrowserSettingVar;
	else
		GetDomObj( strDomID ).value = strDefaulValue;
}

function GetBrowser()
{
    var objWebbrowser, objUseragent = navigator.userAgent;
    if(objUseragent.indexOf("Firefox") > -1)
        objWebbrowser = new ChromePromise();
	
	DebugOutput( "[BROWSER] found: " + objWebbrowser );
	//DebugOutput( "[USERAGENT] found: " + objUseragent );
    return objWebbrowser;
}

// Is it chrome or not
browser = GetBrowser();
DebugOutput( "[BROWSER] found: " + browser );

document.querySelector('#saveSettings').addEventListener('click', () => {
	DebugOutput( '[SAVE] Button action');
	
	browser.storage.local.set(
	{
		ffcsbookmarksSettings:
		{
			proto: GetDomObj('modeProtocol').checked,
			ip: GetDomObj('srvIP').value,
			url: GetDomObj('apiUrl').value,
			user: GetDomObj('user').value,
			pass: GetDomObj('pass').value,
			//sidebar: GetDomObj('modeSidebar').checked
		}
	}).then(function(result)
	{
		SetNotificationMessage('Saved', 'boxed success', 2);
	});
});	
	
browser.storage.local.get('ffcsbookmarksSettings').then(function(result)
{	
	var settings = result.ffcsbookmarksSettings;
	
	if ( settings )
	{
		CheckStorageVars(settings.ip, 'srvIP', 'domainexample.com');
		CheckStorageVars(settings.url, 'apiUrl', '/index.php/apps/bookmarks/public/rest/v2');
		CheckStorageVars(settings.user, 'user', 'Nextcloud username');
		CheckStorageVars(settings.pass, 'pass', 'Nextcloud password');
		GetDomObj('modeProtocol').checked = settings.proto;
		//GetDomObj('modeSidebar').checked = settings.sidebar;
		DebugOutput( '[LOAD] Local settings found: ' + JSON.stringify( settings ) );
	}
	else
	{
		CheckStorageVars(false, 'srvIP', 'domainexample.com');
		CheckStorageVars(false, 'apiUrl', '/index.php/apps/bookmarks/public/rest/v2');
		CheckStorageVars(false, 'user', 'Nextcloud username');
		CheckStorageVars(false, 'pass', 'Nextcloud password');
		//GetDomObj('modeProtocol').checked = true;
		//GetDomObj('modeSidebar').checked = false;
		DebugOutput( '[LOAD] Local settings not found!');
	}
});
