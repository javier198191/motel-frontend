import { Edit } from "lucide-react";

export interface TipoHabitacion {
  id: number;
  nombre: string;
  precioHora: number;
  precioAmanecida: number;
  precioHoraExtra: number;
  horasIncluidas: number;
  tieneMinibar: boolean;
  tieneParqueadero: boolean;
}

interface TiposTableProps {
  tipos: TipoHabitacion[];
  onEdit: (tipo: TipoHabitacion) => void;
}

export function TiposTable({ tipos, onEdit }: TiposTableProps) {
  if (tipos.length === 0) {
    return <div className="text-center py-20 text-gray-400 font-medium">No se encontraron categorías.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider border-b border-gray-100">
            <th className="px-6 py-4 font-bold">Categoría</th>
            <th className="px-6 py-4 font-bold">Tarifa Base (Pack)</th>
            <th className="px-6 py-4 font-bold">Precio Hora Extra</th>
            <th className="px-6 py-4 font-bold">Precio Amanecida</th>
            <th className="px-6 py-4 font-bold">Horas del Pack</th>
            <th className="px-6 py-4 font-bold text-center">Extras</th>
            <th className="px-6 py-4 font-bold text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {tipos.map((t) => (
            <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-6 py-4 font-bold text-gray-900">{t.nombre}</td>
              <td className="px-6 py-4 font-black text-indigo-600">${t.precioHora.toFixed(2)}</td>
              <td className="px-6 py-4 font-black text-amber-600">${t.precioHoraExtra?.toFixed(2) || "0.00"}</td>
              <td className="px-6 py-4 font-black text-indigo-600">${t.precioAmanecida.toFixed(2)}</td>
              <td className="px-6 py-4 font-medium text-gray-600">{t.horasIncluidas} hrs</td>
              <td className="px-6 py-4 text-center">
                <div className="flex justify-center gap-2 text-xs font-bold">
                  {t.tieneMinibar && <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md">Minibar</span>}
                  {t.tieneParqueadero && <span className="bg-slate-200 text-slate-700 px-2 py-1 rounded-md">Garaje</span>}
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <button
                  onClick={() => onEdit(t)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Editar Categoría"
                >
                  <Edit className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
