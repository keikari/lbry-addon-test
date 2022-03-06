
# lbry-addon-test  
  
Other projects used in this:  
JSONViewer https://github.com/LorDOniX/json-viewer  
- create by Roman Makudera 2016 (c)  
- MIT licence, code is free to use  
	
drawdown https://github.com/adamvleggett/drawdown  
- Copyright (c) 2016 Adam Leggett
- [MIT License](https://github.com/adamvleggett/drawdown/blob/master/LICENSE)

DOMPurify https://github.com/cure53/DOMPurify  
- Copyright 2015 Mario Heiderich  
- [Apache License Version 2.0](http://www.apache.org/licenses/LICENSE-2.0) 

<hr> 
 
### This is code for a simple GUI in Firefox that uses local [lbrynet](https://github.com/lbryio/lbry-sdk) daemon to interact with LBRY.   

Very beta, ~~possibly abandoned project(Done quite some time ago, but messy approach I had in this, made me lose interest at the time(css is difficult, and also the other stuff). This repo is just to have some copy of this in somewhere.)~~   
May be fun to check out if you have wanted LBRY in your browser.  

How to use:  
1. Check that it's not coded to steal all your LBC as soon as you start it
2. Download repo and extract it
3. Have LBRY desktop app, or just headless lbrynet running
4. In your Firefox navigate to "about:debugging" -> This Firefox
5. Click "Load Temporary Add-on..." and select the "manifest.json" from where you extraced the repo. 
6. Done! Entering lbry URL ~~to address bar~~(may work) in whatever search engine you prefer, should load into page from add-on showing channel or content associated with the claim.   
Clicking the icon for add-on also should open new tab to add-on page(may not work)  

#### Features:
- search
- advanced search options(can be stored as a "categories")
- view video, audio, markdown(needs polishing) and image files
- repost
- tip/support
- follows(kind of, this uses your "local" prefrences from lbry app)
- delete locally stored blobs
- purchase content(bit odd, but should work)
- very basic UI for transaction history(allows unlocking supports/tips and deleting reposts)
- detailed claim info(can be toggled by clicking the hr(white line) under the claim)  
- enter lbry:// url to some search engine to get directed to add-on page. Can also be get to work more directly from address bar, but I couldn't figure why that works on my main machine, but not on windows.  
- unlock wallet if using headless lbrynet with encrypted wallet(or not to unlock)  

#### Common features that are missing:
- creating/editing/deleting claims
- comments
- dislikes(and likes)
- opening links to new tab may act strange(no search bar)
- lbry urls in address bar may not work
- general elegancy of UI
- general feedback from most actions in on add-on(some error messages and support/tip notifications exist)


#### Known issues:
- add-on page needs to be reloaded once after first launch
- notifications get permanent when navigating to new page
- floating player exists, but isn't that good
- can't be installed persistently(categories won't save and need to be reload on restart)
 
#### Screenshots(So you don't need to install to check it out. Search bar and balance excluded from screenshots)  
  
<img width="500px" src="https://user-images.githubusercontent.com/34790748/156902637-918f4bf8-97be-4588-bf68-a13cadd4b822.png"><img width="500px" src="https://user-images.githubusercontent.com/34790748/156902638-5b21f1b7-4382-4365-a766-bbd248a72801.png">  
<img width="500px" src="https://user-images.githubusercontent.com/34790748/156902640-854e41f1-9394-4676-9ac8-304949320bd9.png"><img width="500px" src="https://user-images.githubusercontent.com/34790748/156902642-bcce20a8-787a-4291-b530-90e7d71e9a09.png">  
</hr>  
  

=====================OLDER================================   
<img width="500px" src="https://user-images.githubusercontent.com/34790748/156160525-1a388886-8ec7-4120-958f-46563675cf36.png">  
Old  
<img width="500px" src="https://user-images.githubusercontent.com/34790748/155859542-061f7b08-ac08-4aef-ba07-2e70af60e0d8.png">
<img width="500px" src="https://user-images.githubusercontent.com/34790748/155859544-ca4138da-f610-476c-a819-ff6368a1058e.png">  
<img width="500px" src="https://user-images.githubusercontent.com/34790748/155859545-07a1f6e6-ebab-4a8b-82a5-9eb69ac1b1db.png">


