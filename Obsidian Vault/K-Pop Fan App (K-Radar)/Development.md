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
- [ ] Add ability to switch to native browser
- [ ] preload a link for faster link traversal
- [ ] Improve data hashing security methods
- [ ] Filter cards by artist, group, label

	UI/UX:
- [ ] Infinite scrolling
- [x] Make Tik-tok like content experience
- [x] Embed pages instead of opening in Native Browsers
	- [ ] Security considerations - apply "disable everything but" logic.
	- [x] Delete state on each link press - delete WebView state, web cookies/cache etc
	- [x] Swipe right to open a link

	Bugs:
- [ ] Bug: Swiping back out of the webview when it hasnt finished loading yet results in empty render (?) - sometimes
