import { Key, X, Loader2 } from 'lucide-react';

interface CheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tipoServicio: 'POR_HORAS' | 'AMANECIDA') => void;
  isSubmitting: boolean;
}

export function CheckinModal({ isOpen, onClose, onSubmit, isSubmitting }: CheckinModalProps) {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const ts = formData.get('tipoServicio') as 'POR_HORAS' | 'AMANECIDA';
    onSubmit(ts);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm transform transition-all overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-100">
        <div className="flex justify-between items-center p-6 border-b border-gray-50 bg-gray-50/50">
          <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-xl">
               <Key className="w-6 h-6 text-indigo-600" />
            </div>
            Registrar Check-in
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 hover:bg-gray-200 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-7 space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-black text-gray-700 block uppercase tracking-wider">
              Tipo de Servicio
            </label>
            <div className="relative">
              <select
                name="tipoServicio"
                defaultValue="POR_HORAS"
                className="w-full bg-white border-2 border-gray-200 text-gray-900 text-lg rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 block p-4 cursor-pointer hover:border-gray-300 transition-colors appearance-none font-bold outline-none shadow-sm"
              >
                <option value="POR_HORAS">Por Horas (Pack Básico)</option>
                <option value="AMANECIDA">Amanecida Fija</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-gray-400">
                <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-black py-4 px-4 rounded-2xl shadow-xl hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 transform active:scale-95 disabled:opacity-70 disabled:active:scale-100"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Procesando el Ingreso...
              </>
            ) : (
              <>
                Activar Habitación
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
