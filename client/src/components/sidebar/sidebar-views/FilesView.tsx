import { useState } from "react"
import FileStructureView from "@/components/files/FileStructureView"
import { useFileSystem } from "@/context/FileContext"
import useResponsive from "@/hooks/useResponsive"
import { FileSystemItem } from "@/types/file"
import cn from "classnames"
import { BiArchiveIn } from "react-icons/bi"
import { TbFileUpload } from "react-icons/tb"
import { v4 as uuidV4 } from "uuid"
import { toast } from "react-hot-toast"
import styles from "./FilesView.module.css"

function FilesView() {
    const { downloadFilesAndFolders, updateDirectory } = useFileSystem()
    const { viewHeight } = useResponsive()
    const { minHeightReached } = useResponsive()
    const [isLoading, setIsLoading] = useState(false)

    const handleOpenDirectory = async () => {
        try {
            setIsLoading(true)

            if ("showDirectoryPicker" in window) {
                const directoryHandle = await window.showDirectoryPicker()
                await processDirectoryHandle(directoryHandle)
                return
            }

            if ("webkitdirectory" in HTMLInputElement.prototype) {
                const fileInput = document.createElement("input")
                fileInput.type = "file"
                fileInput.webkitdirectory = true

                fileInput.onchange = async (e) => {
                    const files = (e.target as HTMLInputElement).files
                    if (files) {
                        const structure = await readFileList(files)
                        updateDirectory("", structure)
                    }
                }

                fileInput.click()
                return
            }

            toast.error("Your browser does not support directory selection.")
        } catch (error) {
            console.error("Error opening directory:", error)
            toast.error("Failed to open directory")
        } finally {
            setIsLoading(false)
        }
    }

    const processDirectoryHandle = async (directoryHandle: FileSystemDirectoryHandle) => {
        try {
            toast.loading("Getting files and folders...")
            const structure = await readDirectory(directoryHandle)
            updateDirectory("", structure)
            toast.dismiss()
            toast.success("Directory loaded successfully")
        } catch (error) {  
            console.error("Error processing directory:", error)
            toast.error("Failed to process directory")
        }
    }

    const readDirectory = async (
        directoryHandle: FileSystemDirectoryHandle
    ): Promise<FileSystemItem[]> => {
        const children: FileSystemItem[] = []
        const blackList = ["node_modules", ".git", ".vscode", ".next"]

        for await (const entry of directoryHandle.values()) {
            try {
                if (blackList.includes(entry.name)) continue

                if (entry.kind === "file") {
                    const file = await entry.getFile()
                    const newFile: FileSystemItem = {
                        id: uuidV4(),
                        name: entry.name,
                        type: "file",
                        content: await readFileContent(file),
                    }
                    children.push(newFile)
                } else if (entry.kind === "directory") {
                    const newDirectory: FileSystemItem = {
                        id: uuidV4(),
                        name: entry.name,
                        type: "directory",
                        children: await readDirectory(entry),
                        isOpen: false,
                    }
                    children.push(newDirectory)
                }
            } catch (e) {
                console.warn("Skipping entry due to error:", e)
            }
        }

        return children
    }

    const readFileList = async (files: FileList): Promise<FileSystemItem[]> => {
        const blackList = ["node_modules", ".git", ".vscode", ".next"]
        const root: { [path: string]: FileSystemItem } = {}

        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            const pathParts = file.webkitRelativePath.split("/")

            if (pathParts.some((part) => blackList.includes(part))) continue

            let currentLevel = root

            for (let j = 0; j < pathParts.length; j++) {
                const name = pathParts[j]

                if (j === pathParts.length - 1) {
                    // It's a file
                    const fileItem: FileSystemItem = {
                        id: uuidV4(),
                        name,
                        type: "file",
                        content: await readFileContent(file),
                    }
                    currentLevel[name] = fileItem
                } else {
                    if (!currentLevel[name]) {
                        currentLevel[name] = {
                            id: uuidV4(),
                            name,
                            type: "directory",
                            // @ts-expect-error - children will be converted to array later
                            children: {},

                            isOpen: false,
                        }
                    }

                    // @ts-ignore
                    currentLevel = currentLevel[name].children
                }
            }
        }

        const convertToArray = (level: { [key: string]: FileSystemItem }): FileSystemItem[] => {
            return Object.values(level).map((item) => {
                if (item.type === "directory" && item.children) {
                    return {
                        ...item,
                        // @ts-ignore
                        children: convertToArray(item.children),
                    }
                }
                return item
            })
        }

        return convertToArray(root)
    }

    const readFileContent = async (file: File): Promise<string> => {
        const MAX_FILE_SIZE = 1024 * 1024 // 1MB limit

        if (file.size > MAX_FILE_SIZE) {
            return `File too large: ${file.name} (${Math.round(file.size / 1024)}KB)`
        }

        try {
            return await file.text()
        } catch (error) {
            console.error(`Error reading file ${file.name}:`, error)
            return `Error reading file: ${file.name}`
        }
    }

    return (
        <div
            className={styles.container}
            style={{ height: viewHeight, maxHeight: viewHeight }}
        >
            <FileStructureView />
            <div
                className={`${styles.actions} ${minHeightReached ? styles.hidden : ''}`}
            >
                <hr />
                <button
                    className={styles.button}
                    onClick={handleOpenDirectory}
                    disabled={isLoading}
                >
                    <TbFileUpload className={styles.icon} size={24} />
                    {isLoading ? "Loading..." : "Open File/Folder"}
                </button>
                <button
                    className={styles.button}
                    onClick={downloadFilesAndFolders}
                >
                    <BiArchiveIn className={styles.icon} size={22} /> Download Code
                </button>
            </div>
        </div>
    );
    
    
}

export default FilesView
