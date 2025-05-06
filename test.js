/*
* **************************************************************************************************************
*
*                                           START OF MY JS FILE
*
* **************************************************************************************************************
* */

// async function ds() {
//     const l = [1];
//     for (let i = 0; i < 10000000000; i++) {
//         l[0] = i;
//     }
//     console.log("finish inside");
//     return l;
// }
//
// function does(){
//     (async () => {
//         const r = await ds();
//         console.log("finish outside");
//     })();
// }

// console.log('123/'.substring(0,0));
// alert('22');

function printObj(obj) {
    console.log(
        `{${
            Object.keys(obj).reduce((acc, key, index) => {
                acc += `    ${key}: ${obj[key]}`;
                if (index < Object.keys(obj).length - 1) acc += ',\n';
                return acc;
            }, '')
        }}`
    );
}

const
    isLegalKeyNameInFileSystem = (() => {
        const reg = /^(?!\.{1,2}$)[^\/\0]{1,255}$/;
        return (x) => reg.test(x);
    })();

function generateRootDirectory() {
    const fsRoot = { // FolderObject
        keyCheck: "TERMINAL FS ROOT",
        parentFolder: null, // FolderObject
        subfolders: {}, // subfolderName : folderObject
        files: {} // fileName : fileContents
    };
    fsRoot.parentFolder = fsRoot;
    return fsRoot;
}

function generateSubfolderOf(currentFolderObject) {
    return {
        parentFolder: currentFolderObject,
        subfolders: {},
        files: {}
    };
}

class TerminalFolderPointer {
    #fsRoot;
    #currentFolderObject;
    #currentFullPathStack;

    constructor(fsRoot, currentFolderObject = fsRoot, currentFullPathStack = []) {
        this.#fsRoot = fsRoot;
        this.#currentFolderObject = currentFolderObject;
        this.#currentFullPathStack = currentFullPathStack;
    }

    /*
    *  Duplication
    * */
    duplicate() {
        return new TerminalFolderPointer(
            this.#fsRoot, // shallow copy of pointer
            this.#currentFolderObject, // shallow copy of pointer
            this.#currentFullPathStack.map(x => x) // deep copy of array of strings
        )
    }

    /*
    *  Directory Information Getters
    * */
    getContentListAsString() {
        let contents = '';
        const
            folderNames = Object.keys(this.#currentFolderObject.subfolders),
            fileNames = Object.keys(this.#currentFolderObject.files);
        if (folderNames.length > 0) {
            contents += 'Folders:' + folderNames.reduce((acc, elem) =>
                `${acc}\n            ${elem}`, '');
        }
        if (folderNames.length > 0 && fileNames.length > 0)
            contents += '\n';
        if (fileNames.length > 0) {
            contents += 'Files:' + fileNames.reduce((acc, elem) =>
                `${acc}\n            ${elem}`, '');
        }
        return contents.length === 0 ? 'No file or folder existing here...' : contents;
    }

    getFullPath() {
        return this.#currentFullPathStack.length === 0 ? '/' :
            this.#currentFullPathStack.reduce((acc, elem) => `${acc}/${elem}`, '');
    }

    getSubfolderNames() {
        return Object.keys(this.#currentFolderObject.subfolders);
    }

    getFileNames() {
        return Object.keys(this.#currentFolderObject.files);
    }

    haveFile(fileName) {
        return (isLegalKeyNameInFileSystem(fileName) && this.#currentFolderObject.files[fileName] !== undefined);
    }

    haveSubfolder(subfolderName) {
        return (isLegalKeyNameInFileSystem(subfolderName) && this.#currentFolderObject.subfolders[subfolderName] !== undefined);
    }

    /*
    *  Directory Pointer Controllers
    * */
    gotoRoot() {
        this.#currentFolderObject = this.#fsRoot;
        this.#currentFullPathStack = [];
    }

    gotoSubfolder(subfolderName) {
        if (!isLegalKeyNameInFileSystem(subfolderName))
            throw new Error(`Subfolder name is illegal`);
        if (this.#currentFolderObject.subfolders[subfolderName] === undefined)
            throw new Error(`Folder ${subfolderName} not found`);
        this.#currentFolderObject = this.#currentFolderObject.subfolders[subfolderName];
        this.#currentFullPathStack.push(subfolderName);
    }

    gotoParentFolder() {
        this.#currentFolderObject = this.#currentFolderObject.parentFolder;
        if (this.#currentFullPathStack.length > 0)
            this.#currentFullPathStack.pop();
    }

    // gotoSubpath(subpath)
    // gotoPathFromRoot(path)
    gotoPath(path) {
        if (path.length === 0) return;
        if (!path.startsWith('/') && !path.startsWith('./') && !path.startsWith('../'))
            path = './' + path;
        const pathStack = path.split('/');
        if (pathStack[pathStack.length - 1] === '') pathStack.pop();
        let firstEmptyFolderName = true;
        const tempFolderPointer = this.duplicate();
        for (const folderName of pathStack) {
            switch (folderName) {
                case '': {
                    if (!firstEmptyFolderName)
                        throw new Error(`Path name is illegal`);
                    tempFolderPointer.gotoRoot();
                    firstEmptyFolderName = false;
                    break;
                }
                case '.': {
                    // do nothing (goto the current folder)
                    break;
                }
                case '..': {
                    tempFolderPointer.gotoParentFolder();
                    break;
                }
                default: {
                    tempFolderPointer.gotoSubfolder(folderName);
                    break;
                }
            }
        }
        this.#currentFolderObject = tempFolderPointer.#currentFolderObject;
        this.#currentFullPathStack = tempFolderPointer.#currentFullPathStack;
    }

    /*
    *  Directory File Controllers
    * */
    getFileContent(fileName) {
        if (!isLegalKeyNameInFileSystem(fileName))
            throw new Error(`File name is illegal`);
        const fileContent = this.#currentFolderObject.files[fileName];
        if (fileContent === undefined)
            throw new Error(`File ${fileName} not found`);
        return fileContent;
    }

    changeFileContent(fileName, newContent) {
        if (!isLegalKeyNameInFileSystem(fileName))
            throw new Error(`File name is illegal`);
        this.#currentFolderObject.files[fileName] = newContent;
    }

    createNewFile(fileName) {
        if (!isLegalKeyNameInFileSystem(fileName))
            throw new Error(`File name is illegal`);
        if (this.#currentFolderObject.files[fileName] !== undefined)
            throw new Error(`File ${fileName} is already existing`);
        this.#currentFolderObject.files[fileName] = "";
    }

    renameExistingFile(oldFileName, newFileName) {
        if (!isLegalKeyNameInFileSystem(oldFileName) || !isLegalKeyNameInFileSystem(newFileName))
            throw new Error(`File name is illegal`);
        if (this.#currentFolderObject.files[oldFileName] === undefined)
            throw new Error(`File ${oldFileName} not found`);
        if (this.#currentFolderObject.files[newFileName] !== undefined)
            throw new Error(`File ${newFileName} already exists`);
        this.#currentFolderObject.files[newFileName] = this.#currentFolderObject.files[oldFileName];
        delete this.#currentFolderObject.files[oldFileName];
    }

    deleteFile(fileName) {
        if (!isLegalKeyNameInFileSystem(fileName))
            throw new Error(`File name is illegal`);
        if (this.#currentFolderObject.files[fileName] === undefined)
            throw new Error(`File ${fileName} not found.`);
        delete this.#currentFolderObject.files[fileName];
    }

    /*
    *  Directory Subfolder Controllers
    * */
    createSubfolder(newSubfolderName, gotoNewFolder = false) {
        if (!isLegalKeyNameInFileSystem(newSubfolderName))
            throw new Error(`Subfolder name is illegal`);
        if (this.#currentFolderObject.subfolders[newSubfolderName] !== undefined)
            throw new Error(`Folder ${newSubfolderName} already exists`);
        this.#currentFolderObject.subfolders[newSubfolderName] = generateSubfolderOf(this.#currentFolderObject);
        if (gotoNewFolder === true) {
            this.#currentFolderObject = this.#currentFolderObject.subfolders[newSubfolderName];
            this.#currentFullPathStack.push(newSubfolderName);
        }
    }

    // createSubpath(subpath, gotoNewFolder = false)
    createPath(path, gotoNewFolder = false) {
        if (path.length === 0) return;
        if (!path.startsWith('/') && !path.startsWith('./') && !path.startsWith('../'))
            path = './' + path;
        const pathStack = path.split('/');
        if (pathStack[pathStack.length - 1] === '') pathStack.pop();
        let firstEmptyFolderName = true;
        // check the availability of path for creation
        for (const folderName of pathStack) {
            switch (folderName) {
                case '': {
                    if (!firstEmptyFolderName)
                        throw new Error(`Path name is illegal`);
                    firstEmptyFolderName = false;
                    break;
                }
                case '.': {
                    break;
                }
                case '..': {
                    break;
                }
                default: {
                    if (!isLegalKeyNameInFileSystem(folderName))
                        throw new Error(`Path name is illegal`);
                    break;
                }
            }
        }
        // do the creation of path
        const tempFolderPointer = this.duplicate();
        for (const folderName of pathStack) {
            switch (folderName) {
                case '': {
                    tempFolderPointer.gotoRoot();
                    break;
                }
                case '.': {
                    // do nothing (goto the current folder)
                    break;
                }
                case '..': {
                    tempFolderPointer.gotoParentFolder();
                    break;
                }
                default: {
                    if (tempFolderPointer.#currentFolderObject.subfolders[folderName] === undefined)
                        tempFolderPointer.#currentFolderObject.subfolders[folderName] = generateSubfolderOf(tempFolderPointer.#currentFolderObject);
                    tempFolderPointer.#currentFolderObject = tempFolderPointer.#currentFolderObject.subfolders[folderName];
                    tempFolderPointer.#currentFullPathStack.push(folderName);
                    break;
                }
            }
        }
        if (gotoNewFolder === true) {
            this.#currentFolderObject = tempFolderPointer.#currentFolderObject;
            this.#currentFullPathStack = tempFolderPointer.#currentFullPathStack;
        }
    }

    renameExistingSubfolder(oldSubfolderName, newSubfolderName) {
        if (!isLegalKeyNameInFileSystem(oldSubfolderName) || !isLegalKeyNameInFileSystem(newSubfolderName))
            throw new Error(`Subfolder name is illegal`);
        if (this.#currentFolderObject.subfolders[oldSubfolderName] === undefined)
            throw new Error(`Folder ${oldSubfolderName} not found`);
        if (this.#currentFolderObject.subfolders[newSubfolderName] !== undefined)
            throw new Error(`Folder ${newSubfolderName} already exists`);
        this.#currentFolderObject.subfolders[newSubfolderName] = this.#currentFolderObject.subfolders[oldSubfolderName];
        delete this.#currentFolderObject.subfolders[oldSubfolderName];
    }

    deleteSubfolder(subfolderName) {
        if (!isLegalKeyNameInFileSystem(subfolderName))
            throw new Error(`Subfolder name is illegal`);
        if (this.#currentFolderObject.subfolders[subfolderName] === undefined)
            throw new Error(`Folder ${subfolderName} not found`);
        delete this.#currentFolderObject.subfolders[subfolderName]; // doable because of auto-garbage-collection
    }

    /*
    *  Other powerful Controllers
    * */

    movePath(type, oldPath, newPath) {
        switch (type) {
            case 'file': {
                // analyze the old file path
                let index = oldPath.lastIndexOf('/');
                const [oldFileDir, oldFileName] = (() => {
                    if (index === -1) return ['.', oldPath];
                    if (index === 0) return ['/', oldPath.slice(1)];
                    return [oldPath.substring(0, index), oldPath.slice(index + 1)];
                })();
                if (!isLegalKeyNameInFileSystem(oldFileName))
                    throw new Error(`The old file name is illegal`);
                // analyze the new file path
                index = newPath.lastIndexOf('/');
                const [newFileDir, newFileName] = (() => {
                    if (index === -1) return ['.', newPath];
                    if (index === 0) return ['/', newPath.slice(1)];
                    return [newPath.substring(0, index), newPath.slice(index + 1)];
                })();
                if (!isLegalKeyNameInFileSystem(newFileName))
                    throw new Error(`The new file name is illegal`);
                // check the old file status
                const fp_old = this.duplicate();
                fp_old.gotoPath(oldFileDir);
                const oldFile = fp_old.#currentFolderObject.files[oldFileName];
                if (oldFile === undefined)
                    throw new Error(`The old path is not found`);
                // check the new file status
                const fp_new = this.duplicate();
                fp_new.gotoPath(newFileDir);
                if (fp_new.#currentFolderObject.files[newFileName] !== undefined)
                    throw new Error(`The new path is already existing`);
                // do the movement
                delete fp_old.#currentFolderObject.files[oldFileName];
                fp_new.#currentFolderObject.files[newFileName] = oldFile;
                break;
            }
            case 'directory': {
                // analyze the old dir path
                let index = oldPath.lastIndexOf('/');
                const [oldDirParent, oldDirName] = (() => {
                    if (index === -1) return ['.', oldPath];
                    if (index === 0) return ['/', oldPath.slice(1)];
                    return [oldPath.substring(0, index), oldPath.slice(index + 1)];
                })();
                if (!isLegalKeyNameInFileSystem(oldDirName))
                    throw new Error(`The old file name is illegal`);
                // analyze the new dir path
                index = newPath.lastIndexOf('/');
                const [newDirParent, newDirName] = (() => {
                    if (index === -1) return ['.', newPath];
                    if (index === 0) return ['/', newPath.slice(1)];
                    return [newPath.substring(0, index), newPath.slice(index + 1)];
                })();
                if (!isLegalKeyNameInFileSystem(newDirName))
                    throw new Error(`The new file name is illegal`);
                // check the old dir status
                const fp_old = this.duplicate();
                fp_old.gotoPath(oldDirParent);
                const oldDir = fp_old.#currentFolderObject.subfolders[oldDirName];
                if (oldDir === undefined)
                    throw new Error(`The old path is not found`);
                // check the new dir status
                const fp_new = this.duplicate();
                fp_new.gotoPath(newDirParent);
                if (fp_new.#currentFolderObject.subfolders[newDirName] !== undefined)
                    throw new Error(`The new path is already existing`);
                // do the movement
                delete fp_old.#currentFolderObject.subfolders[oldDirName];
                fp_new.#currentFolderObject.subfolders[newDirName] = oldDir;
                break;
            }
            default: {
                throw new Error(`Path type is illegal`);
            }
        }
    }

    copyPath(type, oldPath, newPath) {
        switch (type) {
            case 'file': {
                // analyze the old file path
                let index = oldPath.lastIndexOf('/');
                const [oldFileDir, oldFileName] = (() => {
                    if (index === -1) return ['.', oldPath];
                    if (index === 0) return ['/', oldPath.slice(1)];
                    return [oldPath.substring(0, index), oldPath.slice(index + 1)];
                })();
                if (!isLegalKeyNameInFileSystem(oldFileName))
                    throw new Error(`The old file name is illegal`);
                // analyze the new file path
                index = newPath.lastIndexOf('/');
                const [newFileDir, newFileName] = (() => {
                    if (index === -1) return ['.', newPath];
                    if (index === 0) return ['/', newPath.slice(1)];
                    return [newPath.substring(0, index), newPath.slice(index + 1)];
                })();
                if (!isLegalKeyNameInFileSystem(newFileName))
                    throw new Error(`The new file name is illegal`);
                // check the old file status
                const fp_old = this.duplicate();
                fp_old.gotoPath(oldFileDir);
                const oldFile = fp_old.#currentFolderObject.files[oldFileName];
                if (oldFile === undefined)
                    throw new Error(`The old path is not found`);
                // check the new file status
                const fp_new = this.duplicate();
                fp_new.gotoPath(newFileDir);
                if (fp_new.#currentFolderObject.files[newFileName] !== undefined)
                    throw new Error(`The new path is already existing`);
                // deep-copy the file
                fp_new.#currentFolderObject.files[newFileName] = `${oldFile}`; // deep copy of the string
                break;
            }
            case 'directory': {
                // analyze the old dir path
                let index = oldPath.lastIndexOf('/');
                const [oldDirParent, oldDirName] = (() => {
                    if (index === -1) return ['.', oldPath];
                    if (index === 0) return ['/', oldPath.slice(1)];
                    return [oldPath.substring(0, index), oldPath.slice(index + 1)];
                })();
                if (!isLegalKeyNameInFileSystem(oldDirName))
                    throw new Error(`The old file name is illegal`);
                // analyze the new dir path
                index = newPath.lastIndexOf('/');
                const [newDirParent, newDirName] = (() => {
                    if (index === -1) return ['.', newPath];
                    if (index === 0) return ['/', newPath.slice(1)];
                    return [newPath.substring(0, index), newPath.slice(index + 1)];
                })();
                if (!isLegalKeyNameInFileSystem(newDirName))
                    throw new Error(`The new file name is illegal`);
                // check the old dir status
                const fp_old = this.duplicate();
                fp_old.gotoPath(oldDirParent);
                const oldDir = fp_old.#currentFolderObject.subfolders[oldDirName];
                if (oldDir === undefined)
                    throw new Error(`The old path is not found`);
                // check the new dir status
                const fp_new = this.duplicate();
                fp_new.gotoPath(newDirParent);
                if (fp_new.#currentFolderObject.subfolders[newDirName] !== undefined)
                    throw new Error(`The new path is already existing`);

                // make a copy of oldDri (named oldDirName), and append it to newParentOfOldDir
                function deepCopyOfFolderObject(oldDir, newDirName, newParentOfOldDir) {
                    // create a new dir with the same name as the old dir
                    const newDir = generateSubfolderOf(newParentOfOldDir);

                    const oldDirFileNames = Object.keys(oldDir.files);
                    for (const fileName of oldDirFileNames)
                        newDir.files[fileName] = `${oldDir.files[fileName]}`;

                    const oldDirSubfolderNames = Object.keys(oldDir.subfolders);
                    for (const subfolderName of oldDirSubfolderNames)
                        deepCopyOfFolderObject(oldDir.subfolders[subfolderName], subfolderName, newDir);

                    newParentOfOldDir.subfolders[newDirName] = newDir;
                }

                // deep-copy the directory
                deepCopyOfFolderObject(oldDir, newDirName, fp_new.#currentFolderObject);
                break;
            }
            default: {
                throw new Error(`Path type is illegal`);
            }
        }
    }

    deletePath(type, oldPath, newPath) {
        switch (type) {
            case 'file': {

                break;
            }
            case 'directory': {

                break;
            }
            default: {
                throw new Error(`Path type is illegal`);
            }
        }
    }

}


// const rt = generateRootDirectory();
// const fp = new TerminalFolderPointer(rt);
// fp.createPath('abc', true);
// fp.createPath('123');
// fp.gotoRoot();
// fp.copyPath('directory', 'abc', 'new_abc');
// console.log(1);

const o = {a:1,b:2};
delete o['a'];
console.log(o['a']);

// does();

// function gobj(n) {
//     return {
//         a: n,
//         b: Math.random()
//     };
// }
//
// const l = [1, 2, 3, 4, 5].map(gobj);
//
// const o = l[1];
// // delete l[1];
// l.pop();
// l.push(gobj(10));
//
// console.log(l.length, l);
// console.log(o.a, o.b);


// const o2 = {
//     a: [1, 2, 3],
//     b: [4, 5, 6],
//     c: [7, 8, 9]
// };
// const a456 = o2['b'];
// a456.push(10);
// delete o2['b'];
// console.log(o2);
// console.log(a456);

// const
//     isLegalKeyNameInFileSystem = (() => {
//         const reg = /^(?!\.{1,2}$)[^\/\0]{1,255}$/;
//         return (x) => reg.test(x);
//     })(),
//     isLegalPathNameInFileSystem = (() => {
//         const reg = /^(?!\.{1,2}$)[^\0]{1,255}$/;
//         return (x) => reg.test(x);
//     })();
//
// function fstr(str) {
//     switch (str) {
//         case '123':{
//             console.log('onetwothree');
//             break;
//         }
//         default:{
//             console.log('default');
//         }
//     }
// }
//
// fstr('22');


// folderName = '...';
//
// switch (folderName) {
//     case '': {
//         break;
//     }
//     case '.':
//     case '..': {
//         console.log('123');
//         break;
//     }
//     default: {
//         tempFolderPointer.gotoSubfolder(folderName);
//         break;
//     }
// }

// function exportFS(root, cwd) {
//     return {
//         fs: root,
//         cwd
//     };
// }
//
// const a = exportFS(101,102);
// console.log(a.cwd);

// // Set Up <terminalFSDB> and try to restore old <fsRoot>
// let terminalFSDB = undefined;
// (() => {
//     // Open (or create) the IndexedDB database called "TerminalFSDB" with version 1
//     const dbRequest = indexedDB.open("TerminalFSDB", 1);
//     // Listen for the 'upgradeneeded' event to create the object store if necessary
//     dbRequest.onupgradeneeded = (event) => {
//         const db = event.target.result;
//         // Create the object store "TerminalFSStore" with "id" as the key path, if it doesn't exist
//         if (!db.objectStoreNames.contains("TerminalfSStore")) {
//             db.createObjectStore("TerminalFSStore", {keyPath: "id"});
//         }
//     };
//     dbRequest.onsuccess = (event) => {
//         terminalFSDB = event.target.result;
//
//         // Start a read-only transaction for the object store
//         const store = terminalFSDB.transaction(["TerminalFSStore"], "readonly")
//             .objectStore("TerminalFSStore");
//
//         // Use the get() method to read the xtermObj file system
//         const getRequest = store.get("terminal_file_system");
//
//         // Listen for the success event for the get request
//         getRequest.addEventListener("success", (event) => {
//             const result = event.target.result; // result: {id: ..., data: ...}
//             if (result !== undefined && result.data["keyCheck"] === "TERMINAL FS ROOT") {
//                 fsRoot = result;
//                 console.log(`Terminal file system restored successfully.`);
//             }
//         });
//     };
//
//     dbRequest.onerror = (event) => {
//         alert(`generateTerminalCore: Error opening IndexedDB: ${event.target.error}.`);
//     };
// })();


/*
        *  Terminal Built-in Button Ports
        * */
// button_to_save_terminal_file_system_to_indexDB: () => {
//     if (terminalFSDB === undefined) {
//         alert(`generateTerminalCore: button_to_save_terminal_file_system_to_indexDB: Error for undefined terminalFSDB.`);
//         return;
//     }
//
//     // Start a read-write transaction for the object store
//     const store = terminalFSDB.transaction(["TerminalFSStore"], "readwrite")
//         .objectStore("TerminalFSStore");
//
//     // Use the put() method to insert or update the xtermObj file system
//     const putRequest = store.put({
//         id: "terminal_file_system",
//         data: fsRoot
//     });
//
//     // Listen for the success event for the put request
//     putRequest.addEventListener("success", () => {
//         alert(`Terminal file system saved successfully.`);
//     });
//
//     // Listen for errors during the put operation
//     putRequest.addEventListener("error", event => {
//         alert(`generateTerminalCore: button_to_save_terminal_file_system_to_indexDB: Error saving terminal file system: ${event.target.error}.`);
//     });
// },
// button_to_download_terminal_log: () => {
//     const
//         full_current_log = terminalLog.reduce((acc, elem) => acc + elem, ''),
//         url = URL.createObjectURL(new Blob([full_current_log], {type: 'text/plain'})),
//         date = new Date(),
//         link = document.createElement('a');
//     link.href = url;
//     link.download = `terminal_log @ ${date.getHours()}-${date.getMinutes()}'-${date.getSeconds()}'' ${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}.txt`; // the filename the user will get
//     link.click();
//     URL.revokeObjectURL(url);
// },
// button_to_add_local_file: () => {
//     const input = document.createElement('input');
//     input.type = 'file';
//     input.accept = '';
//     input.onchange = (event) => {
//         const file = event.target.files[0];
//         if (!file) return;   // user hit “cancel”
//         const reader = new FileReader();
//         reader.onload = (evt) => {
//             const
//                 fileContent = evt.target.result,  // the file’s text content
//                 date = new Date();
//             let
//                 filename = file.name;
//             if (currentTerminalFolderPointer.haveFile(filename))
//                 filename = `${date.getHours()}-${date.getMinutes()}'-${date.getSeconds()}'' ${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}_${filename}`;
//             currentTerminalFolderPointer.changeFileContent(filename, fileContent);
//             xtermObj.write(`[Button:] Successfully added file "${filename}" to the current directory.\n\n\r $ `);
//             terminalLog.push(`[Button:] Successfully added file "${filename}" to the current directory.\n\n $ `);
//         };
//         reader.onerror = (error) => {
//             alert(`generateTerminalCore: button_to_add_local_file: error reading the file "${file.name}", ${error}.`);
//         };
//         reader.readAsText(file);
//     };
//     input.click();
// },
// button_to_import_filesystem_json: () => {
//     const input = document.createElement('input');
//     input.type = 'file';
//     input.accept = 'application/json';
//     input.onchange = (e) => {
//         const file = e.target.files[0];
//         if (!file) return;  // user cancelled
//         const reader = new FileReader();
//         reader.onload = (evt) => {
//             try {
//                 // TODO: Use the JSON file to restore the xtermObj file system.
//                 const fsObj = JSON.parse(evt.target.result);
//
//             } catch (error) {
//                 alert(`generateTerminalCore: button_to_import_filesystem_json: Error importing filesystem: ${error}.`);
//             }
//         };
//         reader.readAsText(file);
//     };
//     input.click();
// },
// button_to_export_filesystem_json: () => {
//     try {
//         const fsJSON = JSON.stringify(fsRoot);
//         const url = URL.createObjectURL(new Blob([fsJSON], {type: 'text/plain'}));
//         const date = new Date();
//         const link = document.createElement('a');
//         link.href = url;
//         link.download = `terminal_log @ ${date.getHours()}-${date.getMinutes()}'-${date.getSeconds()}'' ${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}.txt`; // the filename the user will get
//         link.click();
//         URL.revokeObjectURL(url);
//     } catch (error) {
//         alert(`generateTerminalCore: button_to_export_filesystem_json: Error exporting filesystem: ${error}.`);
//     }
// },