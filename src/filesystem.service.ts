import * as fs from "fs"

export default class FilesystemService {
  exists(path) {
    return fs.existsSync(path)
  }

  read(path) {
    return fs.readFileSync(path, "utf8")
  }
}
