"use client";

import React, { useState } from "react";
import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";
import { X } from "lucide-react";
import { useTheme } from "../../../../context/themeContext";

export interface CreateEquipmentData {
  id: string;
  type: string;
  brand: string;
  model: string;
  serialNumber: string;
  plateNumber: string;
  location?: string;
  status?: string;
  assignedToPerson?: {
    fullName: string | null;
    position: string | null;
  };
  company?: {
    name: string;
  };
}

interface DeliveryPDFProps {
  equipos: CreateEquipmentData[];
  company?: {
    name: string;
  };
  departmentNameResolver: (locationId: string | null | undefined) => string;
  onClose: () => void;
}

const styles = StyleSheet.create({
  page: {
    padding: 0,
    backgroundColor: "#fff",
    fontFamily: "Helvetica",
    display: "flex",
    flexDirection: "column",
  },
  // ===== HEADER =====
  header: {
    backgroundColor: "#1a3a5c",
    padding: 20,
    paddingHorizontal: 40,
    color: "#fff",
  },
  headerCompanyName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 3,
  },
  headerTitle: {
    fontSize: 13,
    color: "#e8f0f7",
    fontWeight: "normal",
  },
  
  // ===== BODY =====
  body: {
    padding: 35,
    paddingHorizontal: 40,
    flex: 1,
  },
  formSection: {
    marginBottom: 20,
  },
  fieldRow: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "center",
    gap: 15,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#333",
    width: 45,
  },
  fieldValue: {
    flex: 1,
    borderBottomWidth: 2,
    borderBottomColor: "#1a3a5c",
    height: 10,
  },
  introText: {
    fontSize: 11,
    marginBottom: 18,
    marginTop: 12,
    textAlign: "justify",
    lineHeight: 1.6,
    color: "#333",
  },
  tableTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 10,
    color: "#1a3a5c",
  },
  tableSection: {
    marginBottom: 25,
  },
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
  },
  tableRow: {
    width: "100%",
    flexDirection: "row",
  },
  tableHeader: {
    backgroundColor: "#e8e8e8",
    fontWeight: "bold",
    fontSize: 9,
  },
  tableCell: {
    padding: 6,
    borderRightWidth: 1,
    borderRightColor: "#000",
    borderRightStyle: "solid",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    borderBottomStyle: "solid",
    fontSize: 9,
    minHeight: 20,
    color: "#333",
  },
  tableCellHeader: {
    padding: 6,
    borderRightWidth: 1,
    borderRightColor: "#000",
    borderRightStyle: "solid",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    borderBottomStyle: "solid",
    fontSize: 9,
    fontWeight: "bold",
    minHeight: 20,
    color: "#000",
  },
  signatureSection: {
    marginTop: 25,
    flexDirection: "row",
    gap: 40,
  },
  signatureBlock: {
    flex: 1,
  },
  signatureTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#1a3a5c",
  },
  signatureLine: {
    borderTopWidth: 2,
    borderTopColor: "#1a3a5c",
    borderTopStyle: "solid",
    height: 28,
    marginBottom: 6,
  },
  signatureText: {
    fontSize: 10,
    lineHeight: 1.5,
    marginBottom: 2,
    color: "#333",
  },
  signatureSubText: {
    fontSize: 9,
    lineHeight: 1.4,
    marginBottom: 1,
    color: "#666",
  },

  // ===== FOOTER =====
  footer: {
    backgroundColor: "#1a3a5c",
    color: "#fff",
    padding: 12,
    paddingHorizontal: 40,
    fontSize: 8,
    textAlign: "center",
  },
  footerText: {
    fontSize: 8,
    color: "#e8f0f7",
    marginBottom: 2,
  },
});

const DeliveryPDFDocument = ({
  equipos,
  company,
  departmentNameResolver,
}: DeliveryPDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <Text style={styles.headerCompanyName}>{company?.name || "EMPRESA"}</Text>
        <Text style={styles.headerTitle}>Carta de Entrega de Equipo</Text>
      </View>

      {/* ===== BODY ===== */}
      <View style={styles.body}>
        {/* FORM FIELDS */}
        <View style={styles.formSection}>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Fecha:</Text>
            <View style={styles.fieldValue} />
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Para:</Text>
            <View style={styles.fieldValue} />
          </View>
        </View>

        {/* INTRO TEXT */}
        <Text style={styles.introText}>
          Por medio de la presente, hacemos constar que en fecha __________________ el departamento de IT hace entrega del siguiente equipo al colaborador antes mencionado para el desempeño de sus funciones laborales:
        </Text>

        {/* TABLE TITLE */}
        <Text style={styles.tableTitle}>Equipos Entregados:</Text>

        {/* TABLE */}
        <View style={styles.tableSection}>
          <View style={styles.table}>
            {/* Header Row */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCellHeader, { width: "10%" }]}>Cantidad</Text>
              <Text style={[styles.tableCellHeader, { width: "20%" }]}>Descripción</Text>
              <Text style={[styles.tableCellHeader, { width: "20%" }]}>Marca / Modelo</Text>
              <Text style={[styles.tableCellHeader, { width: "25%" }]}>Número de Serie</Text>
              <Text style={[styles.tableCellHeader, { width: "25%" }]}>Observaciones</Text>
            </View>

            {/* Data Rows */}
            {equipos.map((equipo, index) => (
              <View key={equipo.id || index} style={styles.tableRow}>
                <Text style={[styles.tableCell, { width: "10%" }]}>1</Text>
                <Text style={[styles.tableCell, { width: "20%" }]}>{equipo.type}</Text>
                <Text style={[styles.tableCell, { width: "20%", fontSize: 8 }]}>
                  {equipo.brand} {equipo.model}
                </Text>
                <Text style={[styles.tableCell, { width: "25%", fontSize: 8 }]}>
                  {equipo.serialNumber}
                </Text>
                <Text style={[styles.tableCell, { width: "25%", fontSize: 8 }]}></Text>
              </View>
            ))}

            {/* Empty Rows */}
            {[...Array(Math.max(0, 4 - equipos.length))].map((_, i) => (
              <View key={`empty-row-${i}`} style={styles.tableRow}>
                <Text style={[styles.tableCell, { width: "10%" }]}></Text>
                <Text style={[styles.tableCell, { width: "20%" }]}></Text>
                <Text style={[styles.tableCell, { width: "20%" }]}></Text>
                <Text style={[styles.tableCell, { width: "25%" }]}></Text>
                <Text style={[styles.tableCell, { width: "25%" }]}></Text>
              </View>
            ))}
          </View>
        </View>

        {/* SPACING */}
        <View style={{ marginBottom: 15 }} />

        {/* SIGNATURES SECTION */}
        <View style={styles.signatureSection}>
          {/* FIRMA DE QUIEN RECIBE */}
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureTitle}>Firma de Quien Recibe</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureText}>Nombre: ________________________</Text>
            <Text style={styles.signatureSubText}>Cédula: ________________________</Text>
            <Text style={styles.signatureSubText}>Fecha: ________________________</Text>
          </View>

          {/* FIRMA DEL TÉCNICO QUE ENTREGA */}
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureTitle}>Firma Técnico que Entrega</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureText}>Nombre: ________________________</Text>
            <Text style={styles.signatureSubText}>Cédula: ________________________</Text>
            <Text style={styles.signatureSubText}>Fecha: ________________________</Text>
          </View>
        </View>
      </View>

      {/* ===== FOOTER ===== */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Departamento de Tecnología de la Información</Text>
        <Text style={styles.footerText}>Este documento debe ser firmado por ambas partes</Text>
      </View>
    </Page>
  </Document>
);

export default function DeliveryPDFGenerator({
  equipos,
  company,
  departmentNameResolver,
  onClose,
}: DeliveryPDFProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const { isDarkMode } = useTheme();

  const handleDownload = async () => {
    try {
      setIsDownloading(true);

      const blob = await pdf(
        <DeliveryPDFDocument
          equipos={equipos}
          company={company}
          departmentNameResolver={departmentNameResolver}
          onClose={onClose}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const filenamePrefix =
        equipos.length === 1
          ? `Entrega_${equipos[0].brand}_${equipos[0].model}_${equipos[0].serialNumber}`
          : `Entrega_Multiple_${new Date().toISOString().split("T")[0]}`;

      link.download = `${filenamePrefix}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsDownloading(false);
      onClose();
    } catch (error) {
      console.error("Error generando PDF:", error);
      alert("Hubo un error al generar el PDF. Inténtalo de nuevo.");
      setIsDownloading(false);
    }
  };

  return (
    <>
      {/* Preview Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div
          className={`rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col transition-colors ${
            isDarkMode
              ? "bg-gray-800 border border-gray-700"
              : "bg-white border border-gray-200"
          }`}
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between p-4 border-b ${
              isDarkMode
                ? "border-gray-700 bg-gray-800"
                : "border-gray-200 bg-white"
            }`}
          >
            <div>
              <h2
                className={`text-lg font-bold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Preview - Carta de Entrega
              </h2>
              <p
                className={`text-sm mt-1 ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {equipos.length} equipo{equipos.length !== 1 ? "s" : ""} seleccionado
                {equipos.length !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              onClick={onClose}
              className={`transition-colors ${
                isDarkMode
                  ? "text-gray-400 hover:text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <X size={24} />
            </button>
          </div>

          {/* PDF Preview */}
          <div className="flex-1 overflow-auto bg-gray-300 p-6 flex justify-center">
            <HTMLPreview
              equipos={equipos}
              company={company}
              departmentNameResolver={departmentNameResolver}
              onClose={onClose}
            />
          </div>

          {/* Footer */}
          <div
            className={`flex items-center justify-end gap-3 p-4 border-t ${
              isDarkMode
                ? "border-gray-700 bg-gray-800"
                : "border-gray-200 bg-white"
            }`}
          >
            <button
              onClick={onClose}
              disabled={isDownloading}
              className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                isDarkMode
                  ? "bg-gray-600 hover:bg-gray-700 text-white"
                  : "bg-gray-300 hover:bg-gray-400 text-gray-900"
              }`}
            >
              Cerrar
            </button>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg text-white transition-colors font-medium flex items-center gap-2"
            >
              {isDownloading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Generando...
                </>
              ) : (
                <>📥 Descargar PDF</>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Componente HTML para preview
function HTMLPreview({
  equipos,
  company,
  departmentNameResolver,
  onClose,
}: DeliveryPDFProps) {
  return (
    <div
      className="bg-white shadow-lg flex flex-col"
      style={{ width: "21cm", height: "29.7cm", fontFamily: "Helvetica", display: "flex", flexDirection: "column" }}
    >
      {/* ===== HEADER ===== */}
      <div
        className="text-white p-5 flex-shrink-0"
        style={{ backgroundColor: "#1a3a5c" }}
      >
        <p className="text-lg font-bold m-0 mb-1">{company?.name || "EMPRESA"}</p>
        <p className="text-sm m-0">Carta de Entrega de Equipo</p>
      </div>

      {/* ===== BODY ===== */}
      <div className="flex-1 overflow-auto p-8" style={{ display: "flex", flexDirection: "column" }}>
        {/* FORM FIELDS */}
        <div className="mb-5">
          <div className="flex gap-4 mb-3 items-center">
            <span className="text-sm font-bold w-12">Fecha:</span>
            <div
              className="flex-1 border-b-2"
              style={{ borderColor: "#1a3a5c", height: "0.7em" }}
            ></div>
          </div>
          <div className="flex gap-4 items-center">
            <span className="text-sm font-bold w-12">Para:</span>
            <div
              className="flex-1 border-b-2"
              style={{ borderColor: "#1a3a5c", height: "0.7em" }}
            ></div>
          </div>
        </div>

        {/* INTRO TEXT */}
        <p className="text-sm mb-4 text-justify leading-relaxed">
          Por medio de la presente, hacemos constar que en fecha __________________ el departamento de IT hace entrega del siguiente equipo al colaborador antes mencionado para el desempeño de sus funciones laborales:
        </p>

        {/* TABLE TITLE */}
        <p className="text-sm font-bold mb-2" style={{ color: "#1a3a5c" }}>
          Equipos Entregados:
        </p>

        {/* TABLE */}
        <div className="mb-5 flex-shrink-0">
          <table
            className="w-full border-collapse text-sm"
            style={{ borderSpacing: "0", border: "1px solid #000" }}
          >
            <thead>
              <tr style={{ backgroundColor: "#e8e8e8" }}>
                <th
                  className="border border-black p-1.5 font-bold text-center"
                  style={{ width: "10%", fontSize: "9px" }}
                >
                  Cantidad
                </th>
                <th
                  className="border border-black p-1.5 font-bold text-center"
                  style={{ width: "20%", fontSize: "9px" }}
                >
                  Descripción
                </th>
                <th
                  className="border border-black p-1.5 font-bold text-center"
                  style={{ width: "20%", fontSize: "9px" }}
                >
                  Marca / Modelo
                </th>
                <th
                  className="border border-black p-1.5 font-bold text-center"
                  style={{ width: "25%", fontSize: "9px" }}
                >
                  Número de Serie
                </th>
                <th
                  className="border border-black p-1.5 font-bold text-center"
                  style={{ width: "25%", fontSize: "9px" }}
                >
                  Observaciones
                </th>
              </tr>
            </thead>
            <tbody>
              {equipos.map((equipo, index) => (
                <tr key={equipo.id || index} style={{ height: "24px" }}>
                  <td className="border border-black p-1.5 text-center text-sm">1</td>
                  <td className="border border-black p-1.5 text-sm">{equipo.type}</td>
                  <td className="border border-black p-1.5 text-xs">
                    {equipo.brand} {equipo.model}
                  </td>
                  <td className="border border-black p-1.5 text-xs">{equipo.serialNumber}</td>
                  <td className="border border-black p-1.5 text-xs"></td>
                </tr>
              ))}
              {[...Array(Math.max(0, 4 - equipos.length))].map((_, i) => (
                <tr key={`empty-${i}`} style={{ height: "24px" }}>
                  <td className="border border-black p-1.5"></td>
                  <td className="border border-black p-1.5"></td>
                  <td className="border border-black p-1.5"></td>
                  <td className="border border-black p-1.5"></td>
                  <td className="border border-black p-1.5"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* SIGNATURES */}
        <div className="flex gap-8 flex-1" style={{ fontSize: "10px" }}>
          {/* FIRMA DE QUIEN RECIBE */}
          <div style={{ flex: 1 }}>
            <p className="font-bold mb-3 m-0" style={{ color: "#1a3a5c" }}>
              Firma de Quien Recibe
            </p>
            <div
              className="border-t-2"
              style={{ borderColor: "#1a3a5c", height: "38px", marginBottom: "6px" }}
            ></div>
            <p className="mb-1 m-0">Nombre: ________________________</p>
            <p className="mb-1 m-0">Cédula: ________________________</p>
            <p className="m-0">Fecha: ________________________</p>
          </div>

          {/* FIRMA DEL TÉCNICO */}
          <div style={{ flex: 1 }}>
            <p className="font-bold mb-3 m-0" style={{ color: "#1a3a5c" }}>
              Firma Técnico que Entrega
            </p>
            <div
              className="border-t-2"
              style={{ borderColor: "#1a3a5c", height: "38px", marginBottom: "6px" }}
            ></div>
            <p className="mb-1 m-0">Nombre: ________________________</p>
            <p className="mb-1 m-0">Cédula: ________________________</p>
            <p className="m-0">Fecha: ________________________</p>
          </div>
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <div
        className="p-3 text-center flex-shrink-0 text-white"
        style={{ backgroundColor: "#1a3a5c", fontSize: "8px" }}
      >
        <p className="m-0 mb-0.5">Departamento de Tecnología de la Información</p>
        <p className="m-0">Este documento debe ser firmado por ambas partes</p>
      </div>
    </div>
  );
}