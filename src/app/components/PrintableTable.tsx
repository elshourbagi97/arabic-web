import React from "react";
import "../../styles/fonts.css";
import "./printable-table.css";

type PrintableTableProps = {
  title: string;
  headers: string[];
  rows: Array<any>; // each row can be an array (cells by index) or an object (cells by header key)
};

export const PrintableTable: React.FC<PrintableTableProps> = ({
  title,
  headers,
  rows,
}) => {
  const renderCell = (row: any, header: string, colIndex: number) => {
    if (row == null) return "";
    if (Array.isArray(row)) return row[colIndex] ?? "";
    if (typeof row === "object")
      return row[header] ?? row[String(colIndex)] ?? "";
    return String(row);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="printable-page font-arabic" dir="rtl">
      <div className="print-controls no-print">
        <button onClick={handlePrint} className="print-button">
          طباعة كـ PDF
        </button>
      </div>

      <div className="print-area">
        <table className="record-table" role="table" aria-label={title}>
          <caption className="table-title">{title}</caption>
          <thead>
            <tr>
              <th scope="col" className="col-number">
                #
              </th>
              {headers.map((h, i) => (
                <th scope="col" key={i}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rIdx) => (
              <tr key={rIdx}>
                <td className="row-number">{rIdx + 1}</td>
                {headers.map((h, cIdx) => (
                  <td key={cIdx} className="cell">
                    {renderCell(row, h, cIdx)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PrintableTable;
