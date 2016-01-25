import rename

dir = '/Users/michaelishmael/Dev/Projects/baby-flashcard-app/media/ipadretina'
find = r'*.jpg'
replace = r'_ipadr'

rename.rename(dir, find, replace)