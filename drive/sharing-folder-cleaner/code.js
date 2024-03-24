const GOOGLE_DRIVE_FOLDER_ID = '<<< folder id >>>';
const RETENTION_PERIOD_IN_DAYS = 14;
const NOTIFICATION_EMAIL_ADDRESS = '<<< email >>>';

function main() {
  const cleanedFolder = DriveApp.getFolderById(GOOGLE_DRIVE_FOLDER_ID);

  const cutoffDate = new Date((new Date()).getTime() - RETENTION_PERIOD_IN_DAYS * 24 * 60 * 60 * 1000);

  // remove top-level files
  removeFilesCreatedBefore(cutoffDate, cleanedFolder);

  // clean subfolders and their contents
  for (const subfolder of subdirectories(cleanedFolder))
    purgeFolder(cutoffDate, subfolder);
}

function* subdirectories(folder) {
  const subdirectories = folder.getFolders();
  while(subdirectories.hasNext())
    yield subdirectories.next();
}

function* folderFiles(folder) {
  const files = folder.getFiles();
  while(files.hasNext())
    yield files.next()
}

function purgeFolder(cutoffDate, folder) {
  let contentsLeft = removeFilesCreatedBefore(cutoffDate, folder);

  // recursion to clean nested folders as well
  for (const subfolder in subdirectories(folder))
    contentsLeft += purgeFolder(cutoffDate, subfolder);

  if (contentsLeft == 0) {
    console.log(`Removing empty folder '${folder.getName()}'`);
    folder.setTrashed(true);
  }

  return contentsLeft;
}

function removeFilesCreatedBefore(cutoffDate, folder) {
  let filesLeft = 0;

  for (const file of folderFiles(folder)) {
    if (file.getDateCreated() < cutoffDate) {
      console.log(`Removing expired file '${file.getName()}'`);
      file.setTrashed(true);
    } else {
      filesLeft++;
    }
  }

  return filesLeft;
}
