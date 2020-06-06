const ByteArray = imports.byteArray
const GLib      = imports.gi.GLib

function toString(charCode) {
  return ByteArray.toString(charCode)
}

function toJSON(string) {
  try {
    return JSON.parse(string)
  } catch (e) {
    return {}
  }
}

function getFilePath(path) {
  return path.replace('~', GLib.get_home_dir())
}

function fileGetContents(path, defaultValue = null, jsonConvert = false) {
  let filePath = getFilePath(path)
  let fileData = defaultValue

  if (GLib.file_test(filePath, GLib.FileTest.EXISTS)) {
    let data = GLib.file_get_contents(filePath)
    fileData = toString(data[1])

    if (jsonConvert) {
      fileData = toJSON(fileData)
    }
  }

  if (!fileData) {
    fileData = defaultValue
  }

  return fileData
}

function fileGetLine(path, line, defaultValue = null) {
  let fileData  = fileGetContents(path, '')
  let fileLine  = fileData.split("\n")[line]
  let lineValue = defaultValue

  if (fileLine != '') {
    lineValue = fileLine
  }

  return lineValue
}
