# lbry-addon-test  
  
Other projects used in this:  
JSONViewer https://github.com/LorDOniX/json-viewer  
- create by Roman Makudera 2016 (c)  
- MIT licence, code is free to use  
	
drawdown https://github.com/adamvleggett/drawdown  
- Copyright (c) 2016 Adam Leggett
- MIT License

<hr>

Very beta, possibly abandoned project(Done quite some time ago, this repo is just to have some copy of this in somewhere.) Maybe be fun to check out if you have wanted LBRY in your browser.  
This includes code for simple GUI in Firefox that uses local [lbrynet](https://github.com/lbryio/lbry-sdk) daemon to interact with LBRY.  

How to use:  
1. Check that it's not coded to steal all your LBC as soon as you start it
2. Download repo
3. Have LBRY desktop app, or just headless lbrynet running
4. In your Firefox navigate to "about:debugging" -> This Firefox
5. Click "Load Temporary Add-on..." and select the "manifest.json" from the repo. 
6. Done! Entering lbry URL to address bar or in what ever search engine you prefer, should load into page from extension showing channel or content associated with the claim.
Clicking the icon for add-on also should open new tab

Features:
- search
- advanced search options(can be stored as a "categories")
- view video, audio, markdown and image files
- repost
- tip/support
- follows(kind of, this uses your "local" prefrences from lbry app)
- delete locally stored blobs
- purchase content(bit odd, but should work)
- very basic UI for transaction history(allows unlocking supports/tips and deleting reposts)
- detailed claim info(can be toggled by clicking the hr(white line) under the claim)
- can probably open lbry:// urls from address bar(firefox doesn't support this, so it's a bit hacky)(if your browser directs you to LBRY desktop app, you may need to set "network.protocol-handler.expose.lbry: true" in about:config, or set the Firefox as the default application for LBRY links) 
- dark theme?
- unlock wallet if using headless lbrynet with encrypted wallet(or not to unlock)

Common features that are missing:
- creating/editing/deleting claims
- comments
- dislikes(and likes)
- opening links to new tab may act strange(no search bar)
- general elegancy of UI
- general feedback of most actions


Known issues:
- pages need to be reloaded after first launch
- notifications get permanent when navigating to new page
- floating player exists, but isn't that good
- can't be installed(categories won't save and need to be reload on restart)

