"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VirtualFiles = exports.FileNotFoundError = exports.DirectoryNotFoundError = void 0;
class DirectoryNotFoundError extends Error {
    constructor(directory) {
        super(`Directory not found: ${directory}`);
        this.name = "DirectoryNotFoundError";
    }
}
exports.DirectoryNotFoundError = DirectoryNotFoundError;
class FileNotFoundError extends Error {
    constructor(file) {
        super(`File not found: ${file}`);
        this.name = "FileNotFoundError";
    }
}
exports.FileNotFoundError = FileNotFoundError;
/**
 * Virtual file system implementation for managing files and directories in memory.
 */
class VirtualFiles {
    data;
    /**
     * Mapping of file extensions to their corresponding emojis.
     * @static
     */
    static fileTypeEmojis = {
        pdf: "📄",
        doc: "📝",
        docx: "📃",
        xls: "📊",
        xlsx: "📈",
        ppt: "📉",
        txt: "🗒️",
        csv: "📊",
        jpg: "🖼️",
        png: "🌄",
        gif: "🎞️",
        mp3: "🎵",
        mp4: "📹",
        zip: "📦",
        rar: "📦",
        html: "🌐",
        css: "🎨",
        js: "💻",
        json: "📜",
        java: "☕",
        py: "🐍",
        javascript: "📜",
        xml: "📄",
        cpp: "💻",
        cs: "🔵",
        rb: "💎",
        go: "🚀",
        php: "🐘",
        md: "✍️",
        yaml: "🗂️",
        swift: "🍏",
    };
    /**
     * Gets the emoji for a file based on its extension.
     * @static
     * @param fileName - The name of the file (default: 'root')
     * @returns The emoji representing the file type
     */
    static getFileEmoji(fileName = "root") {
        const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
        return this.fileTypeEmojis[extension] || "📁";
    }
    /**
     * Reference to DirectoryNotFoundError class.
     * @static
     */
    static DirectoryNotFoundError = DirectoryNotFoundError;
    /**
     * Reference to FileNotFoundError class.
     * @static
     */
    static FileNotFoundError = FileNotFoundError;
    /**
     * Creates a new VirtualFiles instance.
     * @param data - Initial file system data
     */
    constructor(data = {}) {
        this.data = { mainDir: [], ...data };
    }
    /**
     * Returns the raw file system data.
     * @returns The raw file system structure
     */
    raw() {
        return this.data;
    }
    /**
     * Creates a new directory at the specified path.
     * @param path - The path where to create the directory
     */
    mkdir(path) {
        const parts = path.split("/").filter(Boolean);
        let currentDir = this.data.mainDir;
        for (const part of parts) {
            let dir = currentDir.find((item) => item.name === part);
            if (!dir) {
                dir = { name: part, content: [], lastModified: Date.now() };
                currentDir.push(dir);
            }
            currentDir = dir.content;
        }
    }
    /**
     * Legacy method for creating directories (maintained for backward compatibility).
     * @param path - The path where to create the directory
     * @deprecated Use mkdir instead
     */
    mkdirOld(path) {
        const parts = path.split("/").filter(Boolean);
        let currentDir = this.data.mainDir;
        for (const part of parts) {
            let dir = currentDir.find((item) => item.name === part);
            if (!dir) {
                dir = { name: part, content: [], lastModified: Date.now() };
                currentDir.push(dir);
            }
            currentDir = dir.content;
        }
    }
    /**
     * Writes content to a file at the specified path.
     * @param path - The path to the file
     * @param content - The content to write
     */
    writeFile(path, content) {
        const parts = path.split("/").filter(Boolean);
        const fileName = parts.pop();
        let currentDir = this.data.mainDir;
        for (const part of parts) {
            let dir = currentDir.find((item) => item.name === part);
            if (!dir) {
                console.warn(`Parent directory missing, creating: ${part}`);
                this.mkdir(parts.join("/"));
                dir = currentDir.find((item) => item.name === part);
            }
            currentDir = dir.content;
        }
        const existingFile = currentDir.find((item) => item.name === fileName);
        if (existingFile) {
            existingFile.content = content;
            existingFile.lastModified = Date.now();
        }
        else {
            currentDir.push({ name: fileName, content, lastModified: Date.now() });
        }
    }
    /**
     * Legacy method for writing files (maintained for backward compatibility).
     * @param path - The path to the file
     * @param content - The content to write
     * @throws {DirectoryNotFoundError} If a parent directory doesn't exist
     * @deprecated Use writeFile instead
     */
    writeFileOld(path, content) {
        const parts = path.split("/").filter(Boolean);
        const fileName = parts.pop();
        let currentDir = this.data.mainDir;
        for (const part of parts) {
            const dir = currentDir.find((item) => item.name === part);
            if (!dir) {
                throw new DirectoryNotFoundError(part);
            }
            currentDir = dir.content;
        }
        const existingFile = currentDir.find((item) => item.name === fileName);
        if (existingFile) {
            existingFile.content = content;
            existingFile.lastModified = Date.now();
        }
        else {
            currentDir.push({ name: fileName, content, lastModified: Date.now() });
        }
    }
    /**
     * Reads content from a file or directory at the specified path.
     * @param path - The path to read
     * @returns The content at the path
     * @throws {FileNotFoundError} If the path doesn't exist
     */
    readFile(path) {
        const parts = path.split("/").filter(Boolean);
        let currentDir = this.data.mainDir;
        for (const part of parts) {
            const dir = currentDir.find((item) => item.name === part);
            if (!dir) {
                throw new FileNotFoundError(part);
            }
            currentDir = dir.content;
        }
        if (currentDir.length === 0) {
            throw new FileNotFoundError(path);
        }
        return currentDir;
    }
    /**
     * Checks if a path exists.
     * @param path - The path to check
     * @returns Whether the path exists
     */
    exists(path) {
        const parts = path.split("/").filter(Boolean);
        let currentDir = this.data.mainDir;
        for (const part of parts) {
            const dir = currentDir.find((item) => item.name === part);
            if (!dir) {
                return false;
            }
            currentDir = dir.content;
        }
        return true;
    }
    /**
     * Deletes a file at the specified path.
     * @param path - The path to the file
     * @returns Whether the deletion was successful
     * @throws {DirectoryNotFoundError} If a parent directory doesn't exist
     * @throws {FileNotFoundError} If the file doesn't exist
     */
    unlink(path) {
        const parts = path.split("/").filter(Boolean);
        const fileName = parts.pop();
        let currentDir = this.data.mainDir;
        for (const part of parts) {
            const dir = currentDir.find((item) => item.name === part);
            if (!dir) {
                throw new DirectoryNotFoundError(part);
            }
            currentDir = dir.content;
        }
        const index = currentDir.findIndex((item) => item.name === fileName);
        if (index !== -1) {
            currentDir.splice(index, 1);
            return true;
        }
        throw new FileNotFoundError(fileName);
    }
    /**
     * Removes a directory at the specified path.
     * @param path - The path to the directory
     * @returns Whether the deletion was successful
     * @throws {DirectoryNotFoundError} If the directory or its parent doesn't exist
     */
    rmdir(path) {
        const parts = path.split("/").filter(Boolean);
        const dirName = parts.pop();
        let currentDir = this.data.mainDir;
        for (const part of parts) {
            const dir = currentDir.find((item) => item.name === part);
            if (!dir) {
                throw new DirectoryNotFoundError(part);
            }
            currentDir = dir.content;
        }
        const index = currentDir.findIndex((item) => item.name === dirName);
        if (index !== -1) {
            currentDir.splice(index, 1);
            return true;
        }
        throw new DirectoryNotFoundError(dirName);
    }
    /**
     * Lists contents of a directory.
     * @param path - The path to the directory
     * @returns Array of item names
     * @throws {DirectoryNotFoundError} If the directory doesn't exist
     */
    readdir(path) {
        const parts = path.split("/").filter(Boolean);
        let currentDir = this.data.mainDir;
        for (const part of parts) {
            const dir = currentDir.find((item) => item.name === part);
            if (!dir) {
                throw new DirectoryNotFoundError(part);
            }
            currentDir = dir.content;
        }
        return currentDir.map((item) => item.name);
    }
    /**
     * Gets statistics about a file or directory.
     * @param path - The path to check
     * @returns Statistics about the item
     * @throws {FileNotFoundError} If the path doesn't exist
     */
    stat(path) {
        const parts = path.split("/").filter(Boolean);
        let currentDir = this.data.mainDir;
        let lastItem;
        for (const part of parts) {
            lastItem = Array.isArray(currentDir)
                ? currentDir.find((item) => item.name === part)
                : null;
            if (!lastItem) {
                throw new FileNotFoundError(part);
            }
            currentDir = lastItem.content;
        }
        if (!lastItem) {
            throw new FileNotFoundError(path);
        }
        return {
            name: lastItem.name,
            type: Array.isArray(lastItem.content) ? "directory" : "file",
            lastModified: lastItem.lastModified,
            size: Array.isArray(lastItem.content) ? 0 : lastItem.content.length,
        };
    }
    /**
     * Converts the file system structure to a string representation.
     * @param path - The path to convert (default: '/')
     * @returns String representation of the file system
     */
    toString(path = "/") {
        const parts = path.split("/").filter(Boolean);
        let currentDir = this.data.mainDir;
        for (const part of parts) {
            const dir = currentDir.find((item) => item.name === part);
            if (!dir) {
                return "[Error]";
            }
            currentDir = dir.content;
        }
        return this._buildString(currentDir);
    }
    /**
     * Internal method to build string representation of directory contents.
     * @param directory - The directory to process
     * @param level - The indentation level
     * @returns String representation of directory contents
     * @private
     */
    _buildString(directory, level = 0) {
        let result = "";
        const indent = "-".repeat(level);
        for (const item of directory) {
            const emoji = VirtualFiles.getFileEmoji(item.name);
            if (Array.isArray(item.content)) {
                result += `${indent}${emoji} ${item.name}/\n`;
                result += this._buildString(item.content, level + 1);
            }
            else {
                result += `${indent}${emoji} ${item.name}\n`;
            }
        }
        return result;
    }
    /**
     * Checks if a path is a directory.
     * @param path - The path to check
     * @returns Whether the path is a directory
     */
    isDirectory(path) {
        const parts = path.split("/").filter(Boolean);
        let currentDir = this.data.mainDir;
        for (const part of parts) {
            const dir = currentDir.find((item) => item.name === part);
            if (!dir || !Array.isArray(dir.content)) {
                return false;
            }
            currentDir = dir.content;
        }
        return true;
    }
}
exports.VirtualFiles = VirtualFiles;
