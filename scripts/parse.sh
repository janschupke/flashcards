#!/bin/bash

cat input.txt |\
sed "s/<br><div style='font-family: Arial; font-size: 20px;'><\/div><br>	/chobotnice/g" |\
sed "s/.mp3]<br><br><br>/chobotnice/g" |\
sed "s/ \[sound:google-/chobotnice/g" |\
sed "s/\"//g" |\
awk -f parse.awk > ../src/output.json
