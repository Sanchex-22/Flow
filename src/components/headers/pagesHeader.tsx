"use client";

import React from "react";
import { Plus, Upload, Download, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/themeContext";

interface PagesHeaderProps {
  title: string;
  description?: string;
  showCreate?: boolean;
  showCreatePath?: string;
  onExport?: () => void;
  onImport?: () => void;
  onReport?: () => void;
  onDownloadTemplate?: () => void;
  onImportCsv?: () => void;
  onModal?: () => void;
  importingCsv?: boolean;
}

const PagesHeader: React.FC<PagesHeaderProps> = ({
  title,
  description,
  showCreate = false,
  showCreatePath,
  onExport,
  onImport,
  onReport,
  onDownloadTemplate,
  onImportCsv,
  onModal,
  importingCsv = false,
}) => {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();

  const btnSecondary = `flex items-center justify-center gap-2 h-9 px-4 rounded-lg text-[13px] font-medium transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed ${
    isDarkMode
      ? "bg-white/[0.06] hover:bg-white/[0.1] text-[#8e8e93] hover:text-white border border-white/[0.06]"
      : "bg-white hover:bg-gray-50 text-[#6e6e73] hover:text-gray-900 border border-gray-200"
  }`;

  const btnPrimary = `flex items-center justify-center gap-2 h-9 px-4 rounded-lg text-[13px] font-medium transition-colors whitespace-nowrap bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white`;

  const btnPurple = `flex items-center justify-center gap-2 h-9 px-4 rounded-lg text-[13px] font-medium transition-colors whitespace-nowrap bg-purple-600 hover:bg-purple-500 text-white`;

  return (
    <div className="mb-4 sm:mb-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Title */}
        <div className="min-w-0">
          <h1 className={`text-lg sm:text-xl font-semibold capitalize tracking-tight truncate ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            {title}
          </h1>
          {description && (
            <p className={`text-xs sm:text-[13px] mt-0.5 truncate ${isDarkMode ? "text-[#636366]" : "text-gray-400"}`}>
              {description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 flex-shrink-0">
          {onExport && (
            <button onClick={onExport} className={btnSecondary}>
              <Download className="w-3.5 h-3.5" />
              {t("action.export")}
            </button>
          )}

          {onImport && (
            <button onClick={onImport} className={btnSecondary}>
              <Upload className="w-3.5 h-3.5" />
              {t("action.import")}
            </button>
          )}

          {onDownloadTemplate && (
            <button onClick={onDownloadTemplate} className={btnPurple}>
              <Download className="w-3.5 h-3.5" />
              {t("action.downloadTemplate")}
            </button>
          )}

          {onImportCsv && (
            <button onClick={onImportCsv} disabled={importingCsv} className={btnSecondary}>
              {importingCsv ? (
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              {importingCsv ? t("action.importing") : t("action.importCSV")}
            </button>
          )}

          {onReport && (
            <button onClick={onReport} className={btnPurple}>
              <FileText className="w-3.5 h-3.5" />
              {t("action.report")}
            </button>
          )}

          {onModal && (
            <button onClick={onModal} className={btnPrimary}>
              <Plus className="w-3.5 h-3.5" />
              {t("action.create")}
            </button>
          )}

          {showCreate && (
            <a href="create" className={btnPrimary}>
              <Plus className="w-3.5 h-3.5" />
              {t("action.create")}
            </a>
          )}

          {showCreatePath && (
            <a href={showCreatePath} className={btnPrimary}>
              <Plus className="w-3.5 h-3.5" />
              {t("action.create")}
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default PagesHeader;
