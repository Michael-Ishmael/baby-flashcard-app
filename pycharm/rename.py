import glob, os

def rename(dir, pattern, titlePattern):
    for pathAndFilename in glob.iglob(os.path.join(dir, pattern)):
        title, ext = os.path.splitext(os.path.basename(pathAndFilename))
        rep = title.replace(titlePattern, '')
        #titlePattern % title
        os.rename(pathAndFilename,
                  os.path.join(dir, rep + ext).lower())
