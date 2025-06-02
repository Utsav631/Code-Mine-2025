import { ChangeEvent } from "react"
import { PiCaretDownBold } from "react-icons/pi"
import styles from "./Select.module.css"

interface SelectProps {
    onChange: (e: ChangeEvent<HTMLSelectElement>) => void
    value: string
    options: string[]
    title: string
}

function Select({ onChange, value, options, title }: SelectProps) {
    return (
        <div className={styles.selectContainer}>
            <label className={styles.label}>{title}</label>
            <select
                className={styles.select}
                value={value}
                onChange={onChange}
            >
                {options.sort().map((option) => {
                    const val = option
                    const name =
                        option.charAt(0).toUpperCase() + option.slice(1)
                    return (
                        <option key={name} value={val}>
                            {name}
                        </option>
                    )
                })}
            </select>
            <PiCaretDownBold size={16} className={styles.icon} />
        </div>
    )
}

export default Select
