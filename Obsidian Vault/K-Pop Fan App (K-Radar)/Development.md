**INTRO:**
- [x] Create an environment (prepare for development)
- [x] Make front page - use Expo and its capabilities to test app on iPhone (through Expo testing app)
- [x] Scrape any kpop news site and display it 1:1 (try to optimize the view via React components)

**FIRST PHASE:**
	Code:
- [ ] Dynamically update rules for parsing html content
	- [ ] Option 1: on device dynamic rules
	- [ ] Option 2: on device machine learning?
	- [ ] Option 3: Update rules from self hosted server
- [x] Fix Fetching after storage clearing
- [x] preload a link for faster link traversal
	- WebView now sits loaded in the background and hidden with lower zIndex than main View. While WebView is loading the next, it shows white background with and indicator.
- [ ] Improve data hashing security methods
- [ ] Filter cards by artist, group, label
- [x] Use articles image for higher resolution thumbnails
- [ ] Upgrade the Gesture Handler to use new APIs

	UI/UX:
- [ ] Infinite scrolling
- [x] Make Tik-tok like content experience
- [x] Embed pages instead of opening in Native Browsers
	- [x] Security considerations - apply "disable everything but" logic.
	- [x] Delete state on each link press - delete WebView state, web cookies/cache etc
	- [x] Swipe right to open a link

	Bugs:
- [x] Bug: Swiping back out of the webview when it hasnt finished loading yet results in empty render (?) - sometimes
- [x] Swiping slowly results in link not being set
- [x] If the link is loaded and user tries to access it again, the "setLoadingProgress(true);" line prevents the app to show the webview
- [ ] Making a slow gesture to open a link and holding the view in motion, makes it do a quick reset in X value because of the re-render of the view.

**SECOND PHASE:**
	Code:
- [ ] Add ability to switch to native browser