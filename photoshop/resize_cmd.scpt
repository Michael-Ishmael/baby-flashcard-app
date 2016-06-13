on run argv
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
          set js to "#include ~/Dev/Projects/baby-flashcard-app/photoshop/singleImage.jsx" & return
          set js to js & "main(arguments);" & return
          do javascript js with arguments argv
          
     end tell
end run