import { Edit } from "lucide-react";
import { TipoHabitacion } from "./TiposTable";

export interface Habitacion {
  id: number;
  numero: number;
  estado: string;
  tipoHabitacionId: number;
  tipo?: TipoHabitacion;
}

interface HabitacionesTableProps {
  habitaciones: Habitacion[];
  onEdit: (habitacion: Habitacion) => void;
}

export function HabitacionesTable({ habitaciones, onEdit }: HabitacionesTableProps) {
  if (habitaciones.length === 0) {
    return <div className="text-center py-20 text-gray-400 font-medium">No se encontraron habitaciones físicas registradas.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider border-b border-gray-100">
            <th className="px-6 py-4 font-bold">Nro. Habitación</th>
            <th className="px-6 py-4 font-bold">Tipo Asignado</th>
            <th className="px-6 py-4 font-bold">Estado Actual</th>
            <th className="px-6 py-4 font-bold text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {habitaciones.map((h) => (
            <tr key={h.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-6 py-4 font-black text-xl text-gray-900">{h.numero}</td>
              <td className="px-6 py-4 font-bold text-gray-600">{h.tipo?.nombre || `Unkown ID #${h.tipoHabitacionId}`}</td>
              <td className="px-6 py-4 font-medium">
                <span
                  className={`px-3 py-1 text-xs font-bold rounded-full ${
                    h.estado === "LIBRE"
                      ? "bg-emerald-100 text-emerald-700"
                      : h.estado === "OCUPADA"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {h.estado}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <button
                  onClick={() => onEdit(h)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Editar Habitación"
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
