"use client"

import { useState } from "react"
import styles from "./ReportBlockModal.module.css"

export default function ReportBlockModal({
  isOpen,
  onClose,
  userId,
  userName,
  onReport,
  onBlock,
  isBlocked = false,
  onUnblock,
}) {
  const [activeTab, setActiveTab] = useState("report")
  const [reportReason, setReportReason] = useState("")
  const [reportDescription, setReportDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const reportReasons = [
    { value: "harassment", label: "Harassment or bullying" },
    { value: "spam", label: "Spam or unwanted messages" },
    { value: "inappropriate_content", label: "Inappropriate content" },
    { value: "fake_profile", label: "Fake or impersonation account" },
    { value: "other", label: "Other" },
  ]

  const handleReport = async () => {
    if (!reportReason) return

    setIsSubmitting(true)
    try {
      await onReport(reportReason, reportDescription)
      setReportReason("")
      setReportDescription("")
      onClose()
    } catch (error) {
      console.error("Error reporting user:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBlock = async () => {
    setIsSubmitting(true)
    try {
      if (isBlocked) {
        await onUnblock()
      } else {
        await onBlock()
      }
      onClose()
    } catch (error) {
      console.error("Error blocking/unblocking user:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Report or Block User</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === "report" ? styles.active : ""}`}
            onClick={() => setActiveTab("report")}
          >
            Report User
          </button>
          <button
            className={`${styles.tab} ${activeTab === "block" ? styles.active : ""}`}
            onClick={() => setActiveTab("block")}
          >
            {isBlocked ? "Unblock User" : "Block User"}
          </button>
        </div>

        <div className={styles.content}>
          {activeTab === "report" && (
            <div className={styles.reportSection}>
              <p className={styles.description}>Report {userName} for violating community guidelines</p>

              <div className={styles.formGroup}>
                <label>Reason for reporting:</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className={styles.select}
                >
                  <option value="">Select a reason</option>
                  {reportReasons.map((reason) => (
                    <option key={reason.value} value={reason.value}>
                      {reason.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Additional details (optional):</label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Provide more details about the issue..."
                  className={styles.textarea}
                  rows={4}
                />
              </div>

              <button onClick={handleReport} disabled={!reportReason || isSubmitting} className={styles.reportButton}>
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          )}

          {activeTab === "block" && (
            <div className={styles.blockSection}>
              <p className={styles.description}>
                {isBlocked
                  ? `Unblock ${userName}? They will be able to message you again.`
                  : `Block ${userName}? They won't be able to message you anymore.`}
              </p>

              <button
                onClick={handleBlock}
                disabled={isSubmitting}
                className={isBlocked ? styles.unblockButton : styles.blockButton}
              >
                {isSubmitting
                  ? isBlocked
                    ? "Unblocking..."
                    : "Blocking..."
                  : isBlocked
                    ? "Unblock User"
                    : "Block User"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
