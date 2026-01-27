import type React from "react"
import { Dialog, DialogContent, DialogTitle } from "@/shared/components/ui/dialog"

interface ModalWrapperProps {
    open: boolean
    onClose: () => void
    title: string
    children: React.ReactNode
    maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl"
}

const ModalWrapper: React.FC<ModalWrapperProps> = ({ open, onClose, title, children, maxWidth = "xl" }) => {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="!max-w-6xl w-full flex flex-col max-h-[90vh]">
                <DialogTitle className="bg-gradient-to-r from-[#da291c] to-[#b52217] text-white py-3 px-6 -mx-6 -mt-6 rounded-t-lg">
                    {title}
                </DialogTitle>
                <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
            </DialogContent>
        </Dialog>
    )
}

export default ModalWrapper
