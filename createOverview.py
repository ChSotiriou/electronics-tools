import yaml
from jinja2 import Environment, FileSystemLoader, select_autoescape

env = Environment(
    loader=FileSystemLoader("templates"),
    autoescape=select_autoescape()
)
template = env.get_template('index.jinja')

tools = yaml.safe_load(open("./tools.yaml"))

rendered_html = template.render(tools=tools)

open("dist/index.html", 'w').write(rendered_html)

import updateCommon