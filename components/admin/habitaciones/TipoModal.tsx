import { Settings2, X, Loader2 } from "lucide-react";
import { TipoHabitacion } from "./TiposTable";

interface TipoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  editingTipo: TipoHabitacion | null;
  isSubmitting: boolean;
}

export function TipoModal({ isOpen, onClose, onSubmit, editingTipo, isSubmitting }: TipoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50/50">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-indigo-600" /> {editingTipo ? "Editar Categoría" : "Crear Categoría"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:bg-gray-200 p-2 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Nombre Comercial</label>
            <input
              name="nombre"
              type="text"
              defaultValue={editingTipo?.nombre}
              required
              className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Ej. Suite Presidencial"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Tarifa Base (Pack)</label>
              <input
                name="precioHora"
                type="number"
                min="0"
                step="1"
                defaultValue={editingTipo?.precioHora}
                required
                className="w-full border rounded-lg px-4 py-2.5 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Horas del Pack</label>
              <input
                name="horasIncluidas"
                type="number"
                min="1"
                defaultValue={editingTipo?.horasIncluidas}
                required
                className="w-full border rounded-lg px-4 py-2.5 outline-none"
                placeholder="Ej. 4"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Precio x Hora Extra</label>
              <input
                name="precioHoraExtra"
                type="number"
                min="0"
                step="1"
                defaultValue={editingTipo?.precioHoraExtra}
                required
                className="w-full border rounded-lg px-4 py-2.5 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Precio Amanecida Fija</label>
              <input
                name="precioAmanecida"
                type="number"
                min="0"
                step="1"
                defaultValue={editingTipo?.precioAmanecida}
                required
                className="w-full border rounded-lg px-4 py-2.5 outline-none"
              />
            </div>
          </div>

          <div className="flex gap-6 mt-2 p-4 bg-gray-50 rounded-xl">
            <label className="flex items-center gap-2 font-bold text-sm cursor-pointer">
              <input
                type="checkbox"
                name="tieneMinibar"
                defaultChecked={editingTipo?.tieneMinibar}
                className="w-4 h-4 text-indigo-600 rounded"
              />{" "}
              Ofrece Minibar
            </label>
            <label className="flex items-center gap-2 font-bold text-sm cursor-pointer">
              <input
                type="checkbox"
                name="tieneParqueadero"
                defaultChecked={editingTipo?.tieneParqueadero}
                className="w-4 h-4 text-indigo-600 rounded"
              />{" "}
              Garaje Privado
            </label>
          </div>

          <div className="pt-4 border-t flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} className="px-5 py-2 text-gray-600 font-bold">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-2.5 rounded-xl font-bold flex gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : editingTipo ? (
                "Guardar Cambios"
              ) : (
                "Guardar Categoría"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
