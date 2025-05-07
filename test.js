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


