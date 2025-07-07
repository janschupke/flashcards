BEGIN {
	print "["
}

{
    split($0,items,"chobotnice");

	chinese = items[1]
	english = items[2]
	sound = items[3]
	pinyin = items[4]

    print "  {"
	print "    \"item\": \"" NR "\","
	print "    \"chinese\": \"" chinese "\","
	print "    \"pinyin\": \"" pinyin "\","
	print "    \"english\": \"" english "\","
	print "    \"sound\": \"" sound "\""
	print "  },"
}

END {
	print "]"
}
