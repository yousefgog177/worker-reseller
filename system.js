// system.js (updated FS class)
class FILESYSTEM__ {
  constructor(manager) {
    this.manager = manager;
  }

  normalizePath(pathname) {
    return pathname.replace(/^\/opt\/render\/project\/src/, "").replace(/^\/+/, "");
  }

  getFromPath(pathname) {
    const normalized = this.normalizePath(pathname);
    let result = this.manager.files;
    const parts = normalized.split("/").filter(Boolean);

    for (const part of parts) {
      result = result?.[part];
      if (result === undefined) return undefined;
    }

    return result;
  }

  readdirSync(pathname) {
    const result = this.getFromPath(pathname);
    if (!result || typeof result !== "object") {
      throw new Error(`Path not found or not a directory: ${pathname}`);
    }
    return Object.keys(result);
  }

  require(pathname) {
    const fileContent = this.getFromPath(pathname);
    if (!fileContent) {
      throw new Error(`Virtual file not found: ${pathname}`);
    }

    try {
      return eval(fileContent); // Assumes content is wrapped in module.exports = {...}
    } catch (e) {
      console.error(`Eval error at ${pathname}:`, e.message);
    }
  }
}

module.exports = FILESYSTEM__;
