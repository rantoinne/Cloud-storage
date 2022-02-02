# $1 arg is path to package.json file
cat $1 \
  | grep version \
  | head -1 \
  | awk -F: '{print $2}' \
  | sed 's/[", *$]//g'