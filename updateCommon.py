import os
from IPython import embed
from glob import glob
import re

html_files = [y for x in os.walk("./dist") for y in glob(os.path.join(x[0], '*.html'))]
common_templates = [y for x in os.walk("./templates") for y in glob(os.path.join(x[0], 'common*.html'))]

def replace_between(text, begin, end, alternative=''):
    try:
        begin_loc = text.index(begin) + len(begin)
        end_loc = text.index(end)
        return text[:begin_loc] + alternative + text[end_loc:]
    except:
        return text

for template in common_templates:
    common_f = open(template, 'r')
    mark = common_f.readline().strip()
    common_html = common_f.read()

    begin_mark = f"<!-- __{mark}_START__ -->\n"
    end_mark = f"<!-- __{mark}_END__ -->\n"

    for file in html_files:
        with open(file, 'r') as f:
            html = f.read()

        new_html = replace_between(html, begin_mark, end_mark, common_html)
        open(file, 'w').write(new_html)