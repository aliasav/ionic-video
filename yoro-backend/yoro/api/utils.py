def clean_string(string):

	string = string.lower()
	string = string.replace(" ","")

	special_chars = ["," , "." , ";" , "!" , "@" , "#" , "$" , "%" , "^" , "&" , "*" , "~" , "/" , "\\" , "|"]

	for s in special_chars:
		string = string.replace(s,"")

	return string
