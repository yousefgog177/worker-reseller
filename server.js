const FILESYSTEM__ = require('./system.js')
const AXIOS__ = require("axios");
const oldRequire = require;
const express = require("express");
let app = express();
app.listen(4000);

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
    let formattedString = input
      .replace(/([{,])(\s*)([^:{},\s]+)(\s*):/g, '$1"$3":')
      .replace(/:\s*([^",{}\s][^,{}]*)(,|\})/g, ':"$1"$2');

    try {
      return JSON.parse(formattedString);
    } catch (e) {
      console.error("Parsing error:", e);
      return [];
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

      executePath = this.fs.normalizePath(executePath);

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
          break;
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
      // patched require fallback for unresolved modules
      require = (mod) => {
        try {
          return this._require(pathofkey, mod);
        } catch {
          return oldRequire(mod);
        }
      };

      const loaded = this.fs.require(pathname);
      if (loaded) this.cache[pathname] = loaded;
      return loaded;

    } catch (e) {
      console.log(`Failed to load ${pathname}:`, e.message);
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
