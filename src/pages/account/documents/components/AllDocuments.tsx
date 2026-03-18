"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useTheme } from "../../../../context/themeContext"
import { useCompany } from "../../../../context/routerContext"
import { usePageName } from "../../../../hook/usePageName"
import { useSearch } from "../../../../context/searchContext"
import PagesHeader from "../../../../components/headers/pagesHeader"
import Loader from "../../../../components/loaders/loader"
import SimpleTable from "../../../../components/tables/SimpleTable"
import { FileText, File, Image } from "lucide-react"
import { useTranslation } from "react-i18next"

const { VITE_API_URL } = import.meta.env

interface Document {
  id: string
  title: string
  description?: string
  fileUrl: string
  fileType?: string
  category?: string
  companyId: string
  equipmentId?: string
  createdAt: string
  company?: { name: string }
  equipment?: { serialNumber: string; type: string; brand: string }
}

const getFileIcon = (fileType?: string) => {
  if (!fileType) return <File size={16} />
  if (fileType.includes("image")) return <Image size={16} className="text-purple-500" />
  if (fileType.includes("pdf")) return <FileText size={16} className="text-red-500" />
  return <File size={16} className="text-blue-500" />
}

export default function AllDocuments() {
  const navigate = useNavigate()
  const { isDarkMode } = useTheme()
  const { t } = useTranslation()
  const { selectedCompany } = useCompany()
  usePageName()
  const { search } = useSearch()

  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [activeCategory, setActiveCategory] = useState("Todos")

  const cardBg = isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
  const textMain = isDarkMode ? "text-white" : "text-gray-900"
  const textSub = isDarkMode ? "text-gray-400" : "text-gray-600"

  useEffect(() => {
    fetchDocuments()
  }, [selectedCompany])

  const fetchDocuments = () => {
    setLoading(true)
    fetch(`${VITE_API_URL}/api/documents/all`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("jwt") || ""}` },
    })
      .then((r) => r.json())
      .then((data: Document[]) => {
        const filtered = selectedCompany
          ? data.filter((d) => d.companyId === selectedCompany.id)
          : data
        setDocuments(filtered)
      })
      .catch(() => setError(t("error.loadData")))
      .finally(() => setLoading(false))
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      await fetch(`${VITE_API_URL}/api/documents/${deleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("jwt") || ""}` },
      })
      setDocuments((prev) => prev.filter((d) => d.id !== deleteId))
      setDeleteId(null)
    } catch {
      alert(t("error.deleteData"))
    } finally {
      setIsDeleting(false)
    }
  }

  const categories = ["Todos", ...Array.from(new Set(documents.map((d) => d.category || t("documents.noCategory"))))]

  const filteredDocuments = documents.filter((d) => {
    const matchesCategory = activeCategory === "Todos" || (d.category || t("documents.noCategory")) === activeCategory
    const matchesSearch =
      !search ||
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      (d.description || "").toLowerCase().includes(search.toLowerCase()) ||
      (d.category || "").toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const columns = [
    { key: "title", label: t("common.name") },
    { key: "category", label: t("common.type") },
    { key: "equipment", label: t("documents.equipment") },
    { key: "date", label: t("common.date") },
    { key: "fileType", label: t("documents.fileType") },
    { key: "actions", label: t("common.actions") },
  ]

  const tableRows = filteredDocuments.map((d) => ({
    title: (
      <div className="flex items-center gap-2">
        {getFileIcon(d.fileType)}
        <span className={`font-medium ${textMain}`}>{d.title}</span>
      </div>
    ),
    category: (
      <span className={`px-2 py-1 rounded text-xs font-medium ${isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"}`}>
        {d.category || t("documents.noCategory")}
      </span>
    ),
    equipment: d.equipment
      ? `${d.equipment.type} - ${d.equipment.serialNumber}`
      : <span className={textSub}>-</span>,
    date: new Date(d.createdAt).toLocaleDateString("es-ES"),
    fileType: d.fileType || "-",
    actions: (
      <div className="flex gap-2">
        {d.fileUrl && (
          <a
            href={d.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-500 hover:text-green-700 text-xs font-medium"
          >
            {t("action.view")}
          </a>
        )}
        <button
          onClick={() => navigate(`/${selectedCompany?.code}/documents/edit/${d.id}`)}
          className="text-blue-500 hover:text-blue-700 text-xs font-medium"
        >
          {t("action.edit")}
        </button>
        <button
          onClick={() => setDeleteId(d.id)}
          className="text-red-500 hover:text-red-700 text-xs font-medium"
        >
          {t("action.delete")}
        </button>
      </div>
    ),
  }))

  if (loading) return <Loader />
  if (error) return <div className={`text-center p-8 ${isDarkMode ? "text-red-400" : "text-red-600"}`}>{error}</div>

  return (
    <div className="space-y-4">
      <PagesHeader
        title={t("documents.title")}
        description={selectedCompany ? `${t("documents.title")} - ${selectedCompany.name}` : t("documents.all")}
        showCreate
      />

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className={`rounded-xl p-3 sm:p-4 border ${cardBg}`}>
          <p className={`text-xs ${textSub}`}>{t("documents.totalDocuments")}</p>
          <p className={`text-2xl sm:text-3xl font-bold ${textMain}`}>{filteredDocuments.length}</p>
        </div>
        <div className={`rounded-xl p-3 sm:p-4 border ${cardBg}`}>
          <p className={`text-xs ${textSub}`}>{t("documents.categories")}</p>
          <p className={`text-2xl sm:text-3xl font-bold ${textMain}`}>{categories.length - 1}</p>
        </div>
        <div className={`rounded-xl p-3 sm:p-4 border ${cardBg}`}>
          <p className={`text-xs ${textSub}`}>{t("documents.withEquipment")}</p>
          <p className={`text-2xl sm:text-3xl font-bold ${textMain}`}>
            {filteredDocuments.filter((d) => d.equipmentId).length}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat
                ? "bg-blue-600 text-white"
                : isDarkMode
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {cat === "Todos" ? t("common.all") : cat}
          </button>
        ))}
      </div>

      <SimpleTable columns={columns} data={tableRows} isDarkMode={isDarkMode} />

      {deleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setDeleteId(null)}
        >
          <div
            className={`rounded-xl p-6 w-full max-w-sm shadow-xl ${cardBg}`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={`text-lg font-bold mb-2 ${textMain}`}>{t("documents.deleteConfirm")}</h3>
            <p className={`text-sm mb-4 ${textSub}`}>{t("common.cannotUndo")}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className={`px-4 py-2 rounded-lg text-sm ${isDarkMode ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
              >
                {t("action.cancel")}
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg text-sm bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
              >
                {isDeleting ? t("common.deleting") : t("action.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
