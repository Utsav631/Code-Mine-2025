import { useFileSystem } from "@/context/FileContext"
import { getIconClassName } from "@/utils/getIconClassName"
import { Icon } from "@iconify/react"
import { IoClose } from "react-icons/io5"
import cn from "classnames"
import { useEffect, useRef } from "react"
import customMapping from "@/utils/customMapping"
import { useSettings } from "@/context/SettingContext"
import langMap from "lang-map"
import styles from "./FileTab.module.css"

function FileTab() {
    const {
        openFiles,
        closeFile,
        activeFile,
        updateFileContent,
        setActiveFile,
    } = useFileSystem()
    const fileTabRef = useRef<HTMLDivElement>(null)
    const { setLanguage } = useSettings()

    const changeActiveFile = (fileId: string) => {
        if (activeFile?.id === fileId) return
        updateFileContent(activeFile?.id || "", activeFile?.content || "")

        const file = openFiles.find((file) => file.id === fileId)
        if (file) {
            setActiveFile(file)
        }
    }

    useEffect(() => {
        const fileTabNode = fileTabRef.current
        if (!fileTabNode) return

        const handleWheel = (e: WheelEvent) => {
            fileTabNode.scrollLeft += e.deltaY > 0 ? 100 : -100
        }

        fileTabNode.addEventListener("wheel", handleWheel)
        return () => fileTabNode.removeEventListener("wheel", handleWheel)
    }, [])

    useEffect(() => {
        if (!activeFile?.name) return
        const extension = activeFile.name.split(".").pop()
        if (!extension) return

        if (customMapping[extension]) {
            setLanguage(customMapping[extension])
            return
        }

        const language = langMap.languages(extension)
        setLanguage(language[0])
    }, [activeFile?.name, setLanguage])

    return (
        <div className={styles.tabContainer} ref={fileTabRef}>
            {openFiles.map((file) => (
                <span
                    key={file.id}
                    className={cn(styles.tab, {
                        [styles.activeTab]: file.id === activeFile?.id,
                    })}
                    onClick={() => changeActiveFile(file.id)}
                >
                    <Icon
                        icon={getIconClassName(file.name)}
                        fontSize={22}
                        className={styles.icon}
                    />
                    <p
                        className={styles.fileName}
                        title={file.name}
                    >
                        {file.name}
                    </p>
                    <IoClose
                        className={styles.closeIcon}
                        size={20}
                        onClick={() => closeFile(file.id)}
                    />
                </span>
            ))}
        </div>
    )
}

export default FileTab
