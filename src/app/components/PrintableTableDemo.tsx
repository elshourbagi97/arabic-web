import React from "react";
import PrintableTable from "./PrintableTable";

const sampleHeaders = ["اسم المبنى", "العنوان", "المالك", "ملاحظات"];

const sampleRows = [
  {
    "اسم المبنى": "برج النخبة",
    العنوان: "الرياض، شارع الملك",
    المالك: "شركة العمران",
    ملاحظات: "تم الانتهاء 2024",
  },
  {
    "اسم المبنى": "مجمع الورد",
    العنوان: "جدة، الحمراء",
    المالك: "مستثمر خاص",
    ملاحظات: "قيد الصيانة — تحتاج إلى مراجعة السجلات التفصيلية",
  },
  ["مستودع الشرق", "الدمام، الصناعية", "مؤسسة نقل", ""],
];

export const PrintableTableDemo: React.FC = () => {
  return (
    <div>
      <PrintableTable
        title={"سجل العقارات والمباني"}
        headers={sampleHeaders}
        rows={sampleRows}
      />
    </div>
  );
};

export default PrintableTableDemo;
