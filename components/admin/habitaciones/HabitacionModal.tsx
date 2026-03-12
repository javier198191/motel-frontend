import { Home, X, Loader2 } from "lucide-react";
import { Habitacion } from "./HabitacionesTable";
import { TipoHabitacion } from "./TiposTable";

interface HabitacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  editingHabitacion: Habitacion | null;
  tipos: TipoHabitacion[];
  isSubmitting: boolean;
}

export function HabitacionModal({
  isOpen,
  onClose,
  onSubmit,
  editingHabitacion,
  tipos,
  isSubmitting,
}: HabitacionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50/50">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Home className="w-5 h-5 text-indigo-600" />{" "}
            {editingHabitacion ? "Editar Habitación" : "Nueva Habitación"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:bg-gray-200 p-2 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Nro. de Habitación</label>
            <input
              name="numero"
              type="number"
              min="1"
              defaultValue={editingHabitacion?.numero}
              required
              className="w-full font-black text-2xl tracking-widest text-center border rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="101"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Asignar Categoría Base</label>
            <select
              name="tipoHabitacionId"
              defaultValue={editingHabitacion?.tipoHabitacionId || ""}
              required
              className="w-full bg-white border rounded-lg px-4 py-3 font-semibold text-gray-800 outline-none"
            >
              {tipos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </div>
          <input type="hidden" name="estado" value="LIBRE" />

          <div className="pt-4 border-t flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full px-5 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-3 rounded-xl font-bold shadow-sm flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="animate-spin w-5 h-5" />}{" "}
              {editingHabitacion ? "Guardar Cambios" : "Añadir"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
