/**
 * Estado de una operación de Nexo. run controla espera, errores y confirmación alrededor de una promesa y comunica el resultado a la pantalla.
 */

import { useRef, useState } from 'react';

export function useTask() {
  const locked = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  async function run(task: () => Promise<void>, success = '') {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await task();
      setMessage(success);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'No se pudo completar la operación.',
      );
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }
  return { busy, error, message, run, setError };
}
