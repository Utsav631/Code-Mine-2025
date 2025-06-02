import "./CopilotView.css"
import { useCopilot } from "@/context/CopilotContext"
import { useFileSystem } from "@/context/FileContext"
import { useSocket } from "@/context/SocketContext"
import useResponsive from "@/hooks/useResponsive"
import { SocketEvent } from "@/types/socket"
import toast from "react-hot-toast"
import { LuClipboardPaste, LuCopy, LuRepeat } from "react-icons/lu"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism"

function CopilotView() {
    const { socket } = useSocket()
    const { viewHeight } = useResponsive()
    const { generateCode, output, isRunning, setInput } = useCopilot()
    const { activeFile, updateFileContent, setActiveFile } = useFileSystem()

    const copyOutput = async () => {
        try {
            const content = output.replace(/```[\w]*\n?/g, "").trim()
            await navigator.clipboard.writeText(content)
            toast.success("Output copied to clipboard")
        } catch (error) {
            toast.error("Unable to copy output to clipboard")
            console.log(error)
        }
    }

    const pasteCodeInFile = () => {
        if (activeFile) {
            const fileContent = activeFile.content
                ? `${activeFile.content}\n`
                : ""
            const content = `${fileContent}${output.replace(/```[\w]*\n?/g, "").trim()}`
            updateFileContent(activeFile.id, content)
            setActiveFile({ ...activeFile, content })
            toast.success("Code pasted successfully")
            socket.emit(SocketEvent.FILE_UPDATED, {
                fileId: activeFile.id,
                newContent: content,
            })
        }
    }

    const replaceCodeInFile = () => {
        if (activeFile) {
            const isConfirmed = confirm("Are you sure you want to replace the code in the file?")
            if (!isConfirmed) return
            const content = output.replace(/```[\w]*\n?/g, "").trim()
            updateFileContent(activeFile.id, content)
            setActiveFile({ ...activeFile, content })
            toast.success("Code replaced successfully")
            socket.emit(SocketEvent.FILE_UPDATED, {
                fileId: activeFile.id,
                newContent: content,
            })
        }
    }

    return (
        <div className="copilot-view" style={{ height: viewHeight }}>
            <h1 className="view-title">Copilot</h1>
            <textarea
                className="copilot-textarea"
                placeholder="What code do you want to generate?"
                onChange={(e) => setInput(e.target.value)}
            />
            <button
                className="copilot-button"
                onClick={generateCode}
                disabled={isRunning}
            >
                {isRunning ? "Generating..." : "Generate Code"}
            </button>
            {output && (
                <div className="copilot-actions">
                    <button title="Copy Output" onClick={copyOutput} className="copilot-icon-button">
                        <LuCopy size={18} />
                    </button>
                    <button title="Replace code in file" onClick={replaceCodeInFile} className="copilot-icon-button">
                        <LuRepeat size={18} />
                    </button>
                    <button title="Paste code in file" onClick={pasteCodeInFile} className="copilot-icon-button">
                        <LuClipboardPaste size={18} />
                    </button>
                </div>
            )}
            <div className="copilot-output">
                <ReactMarkdown
                    components={{
                        code({ inline, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || "")
                            const language = match ? match[1] : "javascript"
                            return !inline ? (
                                <SyntaxHighlighter
                                    style={dracula}
                                    language={language}
                                    PreTag="pre"
                                    className="custom-code-block"
                                >
                                    {String(children).replace(/\n$/, "")}
                                </SyntaxHighlighter>
                            ) : (
                                <code className={className} {...props}>
                                    {children}
                                </code>
                            )
                        },
                        pre({ children }) {
                            return <pre>{children}</pre>
                        },
                    }}
                >
                    {output}
                </ReactMarkdown>
            </div>
        </div>
    )
}

export default CopilotView
