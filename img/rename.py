import os

newFilenames = []

for filename in os.listdir("."):
	newFilename = str(filename)[0:2] + ".jpg"
	# test if photo name already exists
	if newFilename in newFilenames:
		continue
	else:
		newFilenames.append(newFilename)
		os.rename(filename,newFilename)

	print(filename)
	print(newFilename)