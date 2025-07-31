class FS {
  constructor(manager) {
    this.manager = manager;
  }

  readdirSync(pathname) {
    let result = { app: this.manager.files };
    let splited = pathname.split("/");

    for (let i = 0; i < splited.length; i++) {
      if (!splited[i]) continue;
      let dir = splited[i];
      result = result[dir];
    }

    return Object.keys(result);
  }
}

module.exports = FS;
