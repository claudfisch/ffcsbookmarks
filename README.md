# ffcsbookmarks
Firefox clientside bookmarks of nextcloud

## Extension contains
> Popup: only the rights to add, modify and delete bookmarks


> Sidebar: only the rights to search a list of bookmarks

## Available features
- add bookmark
- search bookmark by url,title,tag
- search results tags clickable and search instantly all bookmarks with that tag
- modify bookmark
- delete bookmark
- Tag add
- Tag modify
- Tag delete

## Missing features **(needed ??)**
- Folder create
- Folder modify
- Folder delete
- Add a bookmark to an exists Folder

## Screenshots

### Addon - Settings
![](screenshots/addon\_settings.png)

### Popup - without saved bookmark
![](screenshots/Popup\_BookmarkNotAdded.png)

### Popup - with saved bookmark
![](screenshots/Popup\_BookmarkAdded.png)

### Popup - Modify Tag
![](screenshots/Popup\_TagModifying.png)

### Sidebar - open with hotkey Ctrl+Shift+Y
![](screenshots/Sidebar\_Empty.png)

### Sidebar - with search results
![](screenshots/Sidebar\_SearchResults.png)

## Disclaimer
**Ready for using**. Fast as possible but network connection have to hight too.

## Info
I modified the browser extension from this 'https://github.com/damko/freedommarks-browser-webextension'.
I modified the Github-User 'damko' file 'https://github.com/damko/freedommarks-browser-webextension/blob/master/src/js/FreedomMarks.js' .
So, that he has a working solution of my hard work to get it working correctly, too

## Installation
Your Nextcloud-Server should installed the package bookmarks otherwise this addon is useless.
1. Clone the repo into a favourite folder of your choice.
2. Open up firefox and type into addressbar "about:debugging" and hit return/enter without the quotes!
3. On the new page click on the left side on "This firefox".
4. The right side page should changed. Hit the button "Load temporary add-on". Go to the folder from task 1. and click the json file "manifest.json".
5. The add-on should loaded now. In the symbol-bar should show a bookmark icon and with Ctrl+Shift+Y should show the sidebar.
6. Done

> More info with pics here:
> Exact the same like by 'https://github.com/damko/freedommarks-browser-webextension' - scroll down at bottom! Find the debugging thing and you get my extension working.

## Feedback
Let me know your issues if they show up.
You think there is a missing thing - let me know and I put it into the add-on.

