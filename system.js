class FS {
  constructor(manager) {
    this.manager = manager;
  }

  readdirSync(pathname) {
    let result = this.manager.files; // Use the root of the file structure
    let splited = pathname.split("/");

    for (let i = 0; i < splited.length; i++) {
      if (!splited[i]) continue;
      let dir = splited[i];

      if (!result || typeof result !== "object" || !(dir in result)) {
        throw new Error(`Directory "${dir}" not found in path "${pathname}"`);
      }

      result = result[dir];
    }

    if (typeof result !== "object") {
      throw new Error(`Path "${pathname}" is not a directory`);
    }

    return Object.keys(result);
  }
}

module.exports = FS;
