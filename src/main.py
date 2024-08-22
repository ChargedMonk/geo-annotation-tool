import bottle
from bottle import request, response, route, run, static_file, template
import json
import webbrowser

bottle.BaseRequest.MEMFILE_MAX = 100 * 1024 * 1024  # 100 MB


@route("/")
def home():
    response.set_header("Cache-Control", "no-cache, no-store, must-revalidate")
    response.set_header("Pragma", "no-cache")
    response.set_header("Expires", "0")
    return template("src/static/index.html")


@route("/<filetype>/<filename>")
def server_static(filetype, filename):
    response.set_header("Cache-Control", "no-cache, no-store, must-revalidate")
    response.set_header("Pragma", "no-cache")
    response.set_header("Expires", "0")
    return static_file(filename, root=f"src/static/{filetype}")


if __name__ == "__main__":
    webbrowser.open("http://localhost:8080", new=2)
    run(host="localhost", port=8080, debug=True)
