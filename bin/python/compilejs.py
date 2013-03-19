#!/usr/bin/env py
#######################################################################
# THIS SCRIPT TAKES AN ABSOLUTE PATH TO A HTML FILE
# IT CHECKS FOR SCRIPT TAGS GETS SRC ATTRIBUTE AND BUFFERS THEM
# IF SRC ARE VALID FILES IT JUST PUTS THEM TO A SINGLE FILE
# THE FILE CREATED IS LOCATED IN THE SAME DIRECTORY THAN THE HTML FILE
# FEEL FREE TO IMPROVE THE CODE ! 
#######################################################################
import os
import re
import sys

args = sys.argv[1:]
# READING CLI ARGUMENTS
# ABORTING IF EMPTY
if not len(args):
    print "No arguments given, aborting..."
    exit(0)

# ENTRY POINT
print("OS detected: %s" % sys.platform)

html_file = None
html_file_dirname = None
included_script_pattern = "(<script((?!src).)*(src=\"/?([^\"]*)\"|[^>]*)>)"
js_file = None
js_success_count = 0
js_fail_count = 0

try:
    html_file = open(args[0], 'r')
    html_file_dirname = os.path.dirname(args[0])
except:
    print "Couldn't open file, check if path is correct and try again"
    exit(1)

file_data = html_file.read()
for included_script in re.finditer(included_script_pattern, file_data):
    script_file_path = included_script.group(4)
    print ("Reading file %s" % script_file_path)
    if script_file_path is not None:
        try:
            script_file_path = html_file_dirname + "/" + script_file_path
            js_file = open(script_file_path)            
            js_compiled_file = open(html_file_dirname + "/" + "compiled.js", 'a+')
            js_compiled_file.write(js_file.read())
            js_compiled_file.close()
            del js_compiled_file
            js_success_count = js_success_count + 1
        except:
            print("Failed reading file %s... skipping this one" % script_file_path)
            js_fail_count = js_fail_count + 1
if js_fail_count > 0:
    print("%d file(s) failed loading, thus not compiled" % js_fail_count)
print("%d file(s) compiled" % js_success_count)
print("Exit")