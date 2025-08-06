

const FILESYSTEM__ = require('./system.js')

const AXIOS__ = require("axios");
const oldRequire = require;
let express = require("express")
let app = express()
app.listen(4000)

class Main {
  constructor() {
    this._files = {};
    this.cache = {};
    this.fs = new FILESYSTEM__(this);

    this._request_Files();
  }

  handleError(err) {
    console.log(err.message);
    process.exit(0);
  }
  parseDataToArr(input) {
    // Add double quotes around the keys and values to make it valid JSON
    let formattedString = input
        .replace(/([{,])(\s*)([^:{},\s]+)(\s*):/g, '$1"$3":')  // Add quotes around keys
        .replace(/:\s*([^",{}\s][^,{}]*)(,|\})/g, ':"$1"$2');  // Add quotes around values
  
    try {
        // Parse the corrected JSON string
        let dataArray = JSON.parse(formattedString);
        return dataArray;
    } catch (e) {
        console.error("Parsing error:", e);
        return []; // Return an empty array in case of an error
    }
  }

  async _request_Files() {

    const filesObj = await AXIOS__.get("https://bots.storiza.store/api/files", {
      headers: {
        authentication: "SBrXagRBkN3@",
      },
    })
      .then((res) => res.data)
      .catch((err) => this.handleError(err));

    if (!filesObj) return;

    this._files = filesObj;
    console.log("Files Loaded!");
    this.star_t();
  }

  get files() {
    return this._files;
  }

  _require(path, input) {
    if (input === "F_S".split("_").join("").toLowerCase()) {
      return this.fs;
    } else if (!input.includes("/")) {
      return oldRequire(input);
    } else {
      let currentPath = path;
      let executePath = input;

      let currentPath_ = currentPath;
      let executePath_ = executePath;

      let target = "";
      let extention = "";

      if (executePath.endsWith(".js") || executePath.endsWith(".json")) {
        extention = executePath.endsWith(".js") ? ".js" : ".json";
        executePath = executePath.split(".");
        executePath = executePath.slice(0, executePath.length - 1).join(".");
      }

      if (!executePath.includes(".")) {
        currentPath = "/";
      }
      if (executePath.startsWith("/opt/render/project/src/")) {
        executePath = executePath.replace("/opt/render/project/src/", "/");
      }

      while (true) {
        if (!executePath.includes(".")) {
          target = "/" + executePath + extention;
          break;
        }
        const splited = executePath.split("/");
        if (splited[0] === "..") {
          currentPath = currentPath.split("/");
          currentPath = currentPath.slice(0, currentPath.length - 1).join("/");
          executePath = executePath.split("/").slice(1).join("/");
        } else if (splited[0] === ".") {
          executePath = executePath.split("/").slice(1).join("/");
        } else if (splited[0] === "") {
        }
      }

      const result =
        this.cache[target] ||
        this.load_FromPath(currentPath + target, currentPath);

      if (!result) {
        console.log(`
Main execute path: ${executePath_}
Main current path: ${currentPath_}
execute path: ${executePath}
current path: ${currentPath}
target: ${currentPath + target}
result: ${!!result}
`);
      }

      return result;
    }
  }

  load_FromPath(pathname, pathofkey) {
    try {
      require = (...args) => this._require(pathofkey, ...args);

      let result = this.files;
      const splited = pathname.split("/");

      for (let i = 0; i < splited.length; i++) {
        if (!splited[i]) continue;
        let dir = splited[i];
        result = result[dir];
      }

      try {
        this.cache[pathname] = eval(result);
      } catch (e) {
        console.log(pathname, e.message);
      }

      return this.cache[pathname];
    } catch (e) {
      console.log(e, pathname, pathofkey);
    }
  }

  async star_t() {
    const caching = (obj, path = "") => {
      const result = {};
      for (let [key, value] of Object.entries(obj)) {
        const pathofkey = `${path}/${key}`;
        if (typeof value === "object") {
          result[key] = caching(value, pathofkey);
        } else {
          this.load_FromPath(pathofkey, path);
        }
      }
    };

    caching(this.files);
  }
}

new Main();

