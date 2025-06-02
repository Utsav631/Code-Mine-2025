import { useFileSystem } from "@/context/FileContext"
import useResponsive from "@/hooks/useResponsive"
import cn from "classnames"
import Editor from "./Editor"
import FileTab from "./FileTab"
import styles from "./EditorComponent.module.css"

function EditorComponent() {
    const { openFiles } = useFileSystem()
    const { minHeightReached } = useResponsive()

    if (openFiles.length <= 0) {
        return (
            <div className={styles.centeredMessage}>
                <h1 className={styles.messageText}>
                    No file is currently open.
                </h1>
            </div>
        )
    }

    return (
        <main
            className={cn(styles.wrapper, {
                [styles.calculatedHeight]: !minHeightReached,
                [styles.fullHeight]: minHeightReached,
            })}
        >
            <FileTab />
            <Editor />
        </main>
    )
}

export default EditorComponent
