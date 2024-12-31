import os
from IPython import embed
from glob import glob
import re

website_dir = './dist'

html_files = [y for x in os.walk(website_dir) for y in glob(os.path.join(x[0], '*.html'))]

common_f = open("./templates/common_head.html", 'r')
mark = common_f.readline().strip()
common_html = common_f.read()

begin_mark = f"<!-- __{mark}_START__ -->\n"
end_mark = f"<!-- __{mark}_END__ -->\n"

def replace_between(text, begin, end, alternative=''):
    middle = text.split(begin, 1)[1].split(end, 1)[0]
    return text.replace(middle, alternative)

for file in html_files:
    with open(file, 'r') as f:
        html = f.read()

    new_html = replace_between(html, begin_mark, end_mark, common_html)
    open(file, 'w').write(new_html)