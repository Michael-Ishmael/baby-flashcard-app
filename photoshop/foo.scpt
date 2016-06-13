tell application "Adobe Photoshop CC 2015"
	-- 'do javascript' runs any arbitrary JS.
	-- We're using the #include feature to run another
	-- file. (That's an Adobe extension to JS.)
	--
	-- You have to pass a full, absolute path to #include.
	--
	-- The documentation alleges that 'do javascript'
	-- can be passed an AppleScript file object, but
	-- I wasn't able to get that to work.
	do javascript "#include ~/temp/foo.jsx"
end tell