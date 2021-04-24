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

function configProgramPath() {
  const command = fileGetLine('~/.hotelrc', 0, 'hotel')
  return getFilePath(command)
}

function userProgramPath(folder) {
  const path = GLib.build_filenamev([getFilePath(folder), 'hotel'])
  return GLib.file_test(path, GLib.FileTest.EXISTS) && path
}

function findProgramPath() {
  return GLib.find_program_in_path('hotel') ||
    userProgramPath('~/.local/bin')         ||
    userProgramPath('~/.yarn/bin')          ||
    userProgramPath('~/.node_modules/bin')  ||
    configProgramPath()
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
